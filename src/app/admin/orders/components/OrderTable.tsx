'use client'

import { Clock, CheckCircle, Eye } from 'lucide-react'
import { Order } from '@/types/database'

interface OrderTableProps {
  orders: Order[]
  loading: boolean
  onViewOrder: (order: Order) => void
}

export default function OrderTable({
  orders,
  loading,
  onViewOrder,
}: OrderTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
            <th className="p-4">Mã Đơn</th>
            <th className="p-4">Khách Hàng / Quán</th>
            <th className="p-4 text-right">Tổng Tiền</th>
            <th className="p-4 text-center">Trạng Thái</th>
            <th className="p-4 text-center">Thao Tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {loading ? (
            <tr>
              <td colSpan={5} className="p-8 text-center text-slate-400">
                Đang tải danh sách đơn hàng...
              </td>
            </tr>
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-8 text-center text-slate-400">
                Chưa có đơn hàng nào
              </td>
            </tr>
          ) : (
            orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-mono font-bold text-blue-600">
                  {o.order_code}
                </td>
                <td className="p-4">
                  <div className="font-semibold text-slate-900">
                    {o.customer_name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {o.customer_phone}
                  </div>
                </td>
                <td className="p-4 text-right font-bold text-slate-900">
                  {Number(o.total_amount).toLocaleString('vi-VN')} đ
                </td>
                <td className="p-4 text-center">
                  {o.status === 'PENDING' ? (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-medium">
                      <Clock className="w-3.5 h-3.5" /> PENDING
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> COMPLETED
                    </span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => onViewOrder(o)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}