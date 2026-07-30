'use client'

import { History, Filter, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { Product } from '@/types/database'

export interface TransactionItem {
  id: string
  product_id: string
  type: 'IMPORT' | 'EXPORT_ORDER' | 'ADJUSTMENT' | string
  quantity: number
  cost_price: number
  reference_id?: string | null
  notes?: string | null
  created_at: string
  products?: Product | null
}

interface AuditTrailLogTableProps {
  transactions: TransactionItem[]
  loading: boolean
  typeFilter: 'ALL' | 'IMPORT' | 'EXPORT_ORDER' | 'ADJUSTMENT'
  setTypeFilter: (filter: 'ALL' | 'IMPORT' | 'EXPORT_ORDER' | 'ADJUSTMENT') => void
  totalImportCount: number
  totalExportCount: number
}

export default function AuditTrailLogTable({
  transactions,
  loading,
  typeFilter,
  setTypeFilter,
  totalImportCount,
  totalExportCount,
}: AuditTrailLogTableProps) {
  const filteredTransactions = transactions.filter((t) => {
    if (typeFilter === 'ALL') return true
    return t.type === typeFilter
  })

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden space-y-4 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-lg">
          <History className="w-5 h-5 text-blue-600" /> Nhật Ký Chi Tiết Biến Động Kho
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex bg-slate-100 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-md transition-all font-medium cursor-pointer ${
                typeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Tất cả ({transactions.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('IMPORT')}
              className={`px-3 py-1.5 rounded-md transition-all font-medium cursor-pointer ${
                typeFilter === 'IMPORT' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'
              }`}
            >
              Nhập kho ({totalImportCount})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('EXPORT_ORDER')}
              className={`px-3 py-1.5 rounded-md transition-all font-medium cursor-pointer ${
                typeFilter === 'EXPORT_ORDER' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'
              }`}
            >
              Xuất kho ({totalExportCount})
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <th className="p-4">Thời Gian</th>
              <th className="p-4">Loại Biến Động</th>
              <th className="p-4">Sản Phẩm</th>
              <th className="p-4 text-right">Số Lượng Qui Đổi</th>
              <th className="p-4">Mã Tham Chiếu</th>
              <th className="p-4">Ghi Chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">Đang tải lịch sử kho...</td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">Chưa có lịch sử biến động nào</td>
              </tr>
            ) : (
              filteredTransactions.map((t) => {
                const isImport = t.type === 'IMPORT'
                const formattedDate = new Date(t.created_at).toLocaleString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })

                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-xs text-slate-500 whitespace-nowrap">{formattedDate}</td>
                    <td className="p-4 whitespace-nowrap">
                      {isImport ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <ArrowDownLeft className="w-3.5 h-3.5" /> NHẬP KHO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <ArrowUpRight className="w-3.5 h-3.5" /> XUẤT KHO
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{t.products?.name || t.product_id}</div>
                      <div className="text-xs text-slate-400 font-mono">{t.product_id}</div>
                    </td>
                    <td className={`p-4 text-right font-bold font-mono whitespace-nowrap ${isImport ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {isImport ? `+${t.quantity}` : `${t.quantity}`} {t.products?.base_unit || 'Cơ sở'}
                    </td>
                    <td className="p-4 font-mono text-xs font-semibold text-slate-700 whitespace-nowrap">
                      {t.reference_id || '-'}
                    </td>
                    <td className="p-4 text-xs text-slate-500 max-w-[250px] truncate">
                      {t.notes || '-'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}