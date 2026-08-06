'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Product } from '@/types/database'
import ReportMetricCards from './components/ReportMetricCards'
import AuditTrailLogTable, { InventoryReceiptItem } from './components/AuditTrailLogTable'
import { exportReportExcel } from './utils/exportReportExcel'
import { Download, RefreshCw, BarChart3 } from 'lucide-react'

export default function ReportsAndAuditPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [receipts, setReceipts] = useState<InventoryReceiptItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Financial State
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalCogs, setTotalCogs] = useState(0)
  const [topSellingProducts, setTopSellingProducts] = useState<Array<{ name: string; quantity: number }>>([])

  const fetchData = async () => {
    setLoading(true)

    // 1. Fetch Products
    const { data: prodData } = await supabase.from('products').select('*')
    const prodList = (prodData as Product[]) || []
    if (prodData) setProducts(prodList)

    // 2. Fetch Inventory Receipts Log (bảng mới)
    const { data: receiptData, error } = await supabase
      .from('inventory_receipts')
      .select('*, products(*)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Lỗi fetch phiếu nhập kho (inventory_receipts):', error)
    } else if (receiptData) {
      setReceipts(receiptData as unknown as InventoryReceiptItem[])
    }

    // 3. Fetch Completed Orders for Financials
    const { data: completedOrders } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'COMPLETED')

    let revSum = 0
    if (completedOrders) {
      revSum = completedOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
    }
    setTotalRevenue(revSum)

    const { data: orderItemsData } = await supabase
      .from('order_items')
      .select('*, products(*)')

    let cogsSum = 0
    const salesMap = new Map<string, { name: string; quantity: number }>()

    if (orderItemsData) {
      for (const item of orderItemsData as any[]) {
        const prod = item.products as Product
        const qty = Number(item.quantity) || 0
        const cost = Number(prod?.cost_price || prod?.avg_cost_price) || 0
        cogsSum += qty * cost

        const prodName = prod?.name || item.product_id
        const existing = salesMap.get(prodName)
        if (existing) {
          existing.quantity += qty
        } else {
          salesMap.set(prodName, { name: prodName, quantity: qty })
        }
      }
    }

    setTotalCogs(cogsSum)

    const topList = Array.from(salesMap.values()).sort((a, b) => b.quantity - a.quantity)
    setTopSellingProducts(topList)

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const totalImportCount = receipts.length

  return (
    <main className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-600" /> Báo Cáo Kinh Doanh B2B
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tổng hợp Doanh thu, COGS, Lợi nhuận gộp & Lịch sử phiếu nhập kho
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Làm mới
          </button>

          <button
            onClick={() => exportReportExcel(receipts)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Xuất File Excel (.csv)
          </button>
        </div>
      </header>

      <ReportMetricCards
        products={products}
        totalImportCount={totalImportCount}
        totalExportCount={0}
        totalRevenue={totalRevenue}
        totalCogs={totalCogs}
        topSellingProducts={topSellingProducts}
      />

      <AuditTrailLogTable
        receipts={receipts}
        loading={loading}
      />
    </main>
  )
}