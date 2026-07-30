'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Product } from '@/types/database'
import ReportMetricCards from './components/ReportMetricCards'
import AuditTrailLogTable, { TransactionItem } from './components/AuditTrailLogTable'

export default function ReportsAndAuditPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IMPORT' | 'EXPORT_ORDER' | 'ADJUSTMENT'>('ALL')

  const fetchData = async () => {
    setLoading(true)

    const { data: prodData } = await supabase.from('products').select('*')
    if (prodData) setProducts(prodData as Product[])

    const { data: transData, error } = await supabase
      .from('inventory_transactions')
      .select('*, products(*)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Lỗi fetch nhật ký kho:', error)
    } else if (transData) {
      setTransactions(transData as unknown as TransactionItem[])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const totalImportCount = transactions.filter((t) => t.type === 'IMPORT').length
  const totalExportCount = transactions.filter((t) => t.type === 'EXPORT_ORDER').length

  return (
    <main className="p-8 max-w-[1600px] mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Báo Cáo & Lịch Sử Biến Động Kho</h1>
          <p className="text-sm text-slate-500">Theo dõi chi tiết luồng nhập xuất và cảnh báo tồn kho tự động</p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
        >
          Làm mới dữ liệu
        </button>
      </header>

      <ReportMetricCards
        products={products}
        totalImportCount={totalImportCount}
        totalExportCount={totalExportCount}
      />

      <AuditTrailLogTable
        transactions={transactions}
        loading={loading}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        totalImportCount={totalImportCount}
        totalExportCount={totalExportCount}
      />
    </main>
  )
}