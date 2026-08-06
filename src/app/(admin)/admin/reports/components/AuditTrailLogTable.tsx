'use client'

import { History, ArrowDownLeft } from 'lucide-react'
import { Product } from '@/types/database'

export interface InventoryReceiptItem {
  id: string
  product_id: string
  import_quantity: number
  import_price: number
  notes?: string | null
  created_at: string
  products?: Product | null
}

interface AuditTrailLogTableProps {
  receipts: InventoryReceiptItem[]
  loading: boolean
}

export default function AuditTrailLogTable({
  receipts,
  loading,
}: AuditTrailLogTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden space-y-4 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-lg">
          <History className="w-5 h-5 text-blue-600" /> Nhật Ký Phiếu Nhập Kho
        </div>

        <div className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1.5 rounded-lg">
          Tổng phiếu nhập: <span className="text-emerald-700 font-bold">{receipts.length}</span>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <th className="p-4">Thời Gian</th>
              <th className="p-4">Loại Biến Động</th>
              <th className="p-4">Sản Phẩm</th>
              <th className="p-4 text-right">Số Lượng Nhập</th>
              <th className="p-4 text-right">Đơn Giá Nhập</th>
              <th className="p-4 text-right">Thành Tiền</th>
              <th className="p-4">Ghi Chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">Đang tải phiếu nhập kho...</td>
              </tr>
            ) : receipts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">Chưa có phiếu nhập kho nào</td>
              </tr>
            ) : (
              receipts.map((t) => {
                const totalCost = Number(t.import_quantity) * Number(t.import_price)
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
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                        <ArrowDownLeft className="w-3.5 h-3.5" /> NHẬP KHO
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{t.products?.name || t.product_id}</div>
                    </td>
                    <td className="p-4 text-right font-bold font-mono whitespace-nowrap text-emerald-600">
                      +{t.import_quantity} {t.products?.unit || 'Thùng'}
                    </td>
                    <td className="p-4 text-right font-mono text-slate-700 whitespace-nowrap">
                      {Number(t.import_price).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="p-4 text-right font-bold font-mono text-slate-900 whitespace-nowrap">
                      {totalCost.toLocaleString('vi-VN')} đ
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