'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Product, Order, OrderItem } from '@/types/database'
import ReportMetricCards from './components/ReportMetricCards'
import AuditTrailLogTable, { TransactionItem } from './components/AuditTrailLogTable'
import { Download, RefreshCw, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'

export default function ReportsAndAuditPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IMPORT' | 'EXPORT_ORDER' | 'ADJUSTMENT'>('ALL')

  // Financial State
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalCogs, setTotalCogs] = useState(0)
  const [topSellingProducts, setTopSellingProducts] = useState<Array<{ name: string; quantity: number }>>([])

  const [systemAuditLogs, setSystemAuditLogs] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'METRICS_AND_STOCK' | 'SYSTEM_LOGS'>('METRICS_AND_STOCK')

  // BỘ LỌC AUDIT LOGS
  const [auditSearch, setAuditSearch] = useState('')
  const [auditDateFrom, setAuditDateFrom] = useState('')
  const [auditDateTo, setAuditDateTo] = useState('')

  const fetchData = async () => {
    setLoading(true)

    // 1. Fetch Products
    const { data: prodData } = await supabase.from('products').select('*')
    const prodList = (prodData as Product[]) || []
    if (prodData) setProducts(prodList)

    // 2. Fetch Inventory Transactions Log
    const { data: transData, error } = await supabase
      .from('inventory_transactions')
      .select('*, products(*)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Lỗi fetch nhật ký kho:', error)
    } else if (transData) {
      setTransactions(transData as unknown as TransactionItem[])
    }

    // 3. Fetch System Audit Logs
    const { data: auditData } = await supabase
      .from('system_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (auditData) setSystemAuditLogs(auditData)

    // 4. Fetch Completed Orders for Financials
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
        const cost = Number(prod?.cost_price) || 0
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

    setTotalCogs(cogsSum > 0 ? cogsSum : Math.round(revSum * 0.65))

    const topList = Array.from(salesMap.values()).sort((a, b) => b.quantity - a.quantity)
    setTopSellingProducts(topList)

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const totalImportCount = transactions.filter((t) => t.type === 'IMPORT').length
  const totalExportCount = transactions.filter((t) => t.type === 'EXPORT_ORDER').length

  const handleExportExcelReport = () => {
    if (transactions.length === 0) return toast.warning('Chưa có dữ liệu để xuất file báo cáo!')

    let csvContent = '\uFEFF'
    csvContent += 'MÃ GIAO DỊCH,SẢN PHẨM,LOẠI BIẾN ĐỘNG,SỐ LƯỢNG,MÃ THAM CHIẾU,GHI CHÚ,NGÀY TẠO\n'

    for (const t of transactions) {
      const prodName = t.products?.name || t.product_id
      const typeText = t.type === 'IMPORT' ? 'NHẬP KHO' : t.type === 'EXPORT_ORDER' ? 'XUẤT ĐƠN' : 'ĐIỀU CHỈNH'
      const dateText = new Date(t.created_at).toLocaleString('vi-VN')
      
      csvContent += `"${t.id}","${prodName}","${typeText}",${t.quantity},"${t.reference_id || ''}","${t.notes || ''}","${dateText}"\n`
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `BaoCao_KinhDoanh_BienDongKho_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Đã xuất file báo cáo kinh doanh Excel (.csv) thành công!')
  }

  return (
    <main className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-600" /> Báo Cáo Kinh Doanh & Nhật Ký Hệ Thống B2B
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tổng hợp Doanh thu, COGS, Lợi nhuận gộp & Lịch sử truy vết thao tác nhân sự (System Audit Log)
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
            onClick={handleExportExcelReport}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Xuất File Excel (.csv)
          </button>
        </div>
      </header>

      {/* TAB NAVIGATION */}
      <div className="flex border-b border-slate-200 space-x-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('METRICS_AND_STOCK')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'METRICS_AND_STOCK'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          📊 Doanh Thu & Nhật Ký Kho
        </button>

        <button
          onClick={() => setActiveTab('SYSTEM_LOGS')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'SYSTEM_LOGS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          📜 Nhật Ký Biến Động Nhân Sự & Hệ Thống ({systemAuditLogs.length})
        </button>
      </div>

      {activeTab === 'METRICS_AND_STOCK' ? (
        <>
          <ReportMetricCards
            products={products}
            totalImportCount={totalImportCount}
            totalExportCount={totalExportCount}
            totalRevenue={totalRevenue}
            totalCogs={totalCogs}
            topSellingProducts={topSellingProducts}
          />

          <AuditTrailLogTable
            transactions={transactions}
            loading={loading}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            totalImportCount={totalImportCount}
            totalExportCount={totalExportCount}
          />
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h2 className="font-bold text-slate-900 text-sm">
            Nhật Ký Thao Tác Nhân Sự & Hệ Thống (System Audit Trail)
          </h2>

          {/* BỘ LỌC AUDIT TRAIL */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Tìm theo tên nhân sự, hành động, đối tượng..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-slate-500 font-bold shrink-0">Từ:</label>
              <input
                type="date"
                value={auditDateFrom}
                onChange={(e) => setAuditDateFrom(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs outline-none focus:border-blue-500"
              />
              <label className="text-[10px] text-slate-500 font-bold shrink-0">Đến:</label>
              <input
                type="date"
                value={auditDateTo}
                onChange={(e) => setAuditDateTo(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                  <th className="p-3.5">Người Thao Tác</th>
                  <th className="p-3.5">Hành Động</th>
                  <th className="p-3.5">Đối Tượng</th>
                  <th className="p-3.5">Chi Tiết</th>
                  <th className="p-3.5 text-right">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {(() => {
                  const filteredLogs = systemAuditLogs.filter((log) => {
                    const matchSearch = !auditSearch ||
                      (log.actor_name || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
                      (log.action || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
                      (log.target_name || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
                      (log.details || '').toLowerCase().includes(auditSearch.toLowerCase())

                    const logDate = new Date(log.created_at)
                    const matchFrom = !auditDateFrom || logDate >= new Date(auditDateFrom)
                    const matchTo = !auditDateTo || logDate <= new Date(auditDateTo + 'T23:59:59')

                    return matchSearch && matchFrom && matchTo
                  })

                  if (filteredLogs.length === 0) {
                    return (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 font-sans">
                          {auditSearch || auditDateFrom || auditDateTo ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có nhật ký hệ thống nào'}
                        </td>
                      </tr>
                    )
                  }

                  return filteredLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">{log.actor_name}</td>
                      <td className="p-3.5">
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md font-bold text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800">{log.target_name || 'N/A'}</td>
                      <td className="p-3.5 text-slate-600 font-sans">{log.details}</td>
                      <td className="p-3.5 text-right text-slate-400 text-[11px]">
                        {new Date(log.created_at).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  )
}