'use client'

import { useState } from 'react'
import { Clock, CheckCircle, Eye, Package, XCircle, Search, Filter } from 'lucide-react'
import { Order } from '@/types/database'

interface OrderTableProps {
  orders: Order[]
  loading: boolean
  onViewOrder: (order: Order) => void
}

type StatusFilter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
type PaymentFilter = 'ALL' | 'UNPAID' | 'PAID'

export default function OrderTable({
  orders,
  loading,
  onViewOrder,
}: OrderTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('ALL')

  // Lọc đơn hàng
  const filtered = orders.filter((o) => {
    const matchSearch = !searchTerm ||
      o.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_phone.includes(searchTerm)

    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter
    const matchPayment = paymentFilter === 'ALL' || o.payment_status === paymentFilter

    return matchSearch && matchStatus && matchPayment
  })

  // Đếm theo trạng thái
  const countByStatus = (s: string) => orders.filter((o) => o.status === s).length

  return (
    <div className="space-y-4">
      {/* BỘ LỌC & TÌM KIẾM */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs">
        {/* Ô tìm kiếm */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã đơn, tên khách hàng hoặc SĐT..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Nút lọc trạng thái đơn */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {([
            { key: 'ALL', label: 'Tất cả', count: orders.length },
            { key: 'PENDING', label: '🆕 Đơn mới', count: countByStatus('PENDING') },
            { key: 'CONFIRMED', label: '📦 Đã xuất kho', count: countByStatus('CONFIRMED') },
            { key: 'COMPLETED', label: '✅ Hoàn thành', count: countByStatus('COMPLETED') },
            { key: 'CANCELLED', label: '❌ Đã hủy', count: countByStatus('CANCELLED') },
          ] as const).map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key as StatusFilter)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === f.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Nút lọc thanh toán */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Thanh toán:</span>
          {([
            { key: 'ALL', label: 'Tất cả' },
            { key: 'UNPAID', label: '⏳ Chưa trả' },
            { key: 'PAID', label: '✅ Đã trả đủ' },
          ] as const).map((f) => (
            <button
              key={f.key}
              onClick={() => setPaymentFilter(f.key as PaymentFilter)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                paymentFilter === f.key
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* BẢNG DANH SÁCH ĐƠN HÀNG */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* DESKTOP TABLE (hidden on mobile) */}
        <div className="hidden md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Mã Đơn</th>
                <th className="p-4">Khách Hàng / Quán</th>
                <th className="p-4 text-right">Tổng Tiền</th>
                <th className="p-4 text-center">Trạng Thái</th>
                <th className="p-4 text-center">Thanh Toán</th>
                <th className="p-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Đang tải danh sách đơn hàng...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    {searchTerm || statusFilter !== 'ALL' ? 'Không tìm thấy đơn hàng phù hợp' : 'Chưa có đơn hàng nào'}
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-blue-600 text-sm">{o.order_code}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">
                        {o.customer_name}
                        {o.store_name && <span className="ml-1 text-emerald-700 font-bold text-xs">({o.store_name})</span>}
                      </div>
                      <div className="text-xs text-slate-500">
                        {o.customer_phone}
                      </div>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-900">
                      {Number(o.total_amount).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="p-4 text-center">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="p-4 text-center">
                      <PaymentStatusBadge paymentStatus={o.payment_status} />
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

        {/* MOBILE CARD VIEW (shown on mobile only) */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              {searchTerm || statusFilter !== 'ALL' ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng nào'}
            </div>
          ) : (
            filtered.map((o) => (
              <button
                key={o.id}
                onClick={() => onViewOrder(o)}
                className="w-full text-left p-4 hover:bg-slate-50 transition-colors cursor-pointer block"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="font-mono font-bold text-blue-600 text-sm">{o.order_code}</span>
                  </div>
                  <OrderStatusBadge status={o.status} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-900">{o.customer_name}</p>
                    <p className="text-slate-500">{o.customer_phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{Number(o.total_amount).toLocaleString('vi-VN')} đ</p>
                    <PaymentStatusBadge paymentStatus={o.payment_status} />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <p className="text-[10px] text-slate-400 text-center">
        Hiển thị {filtered.length} / {orders.length} đơn hàng
      </p>
    </div>
  )
}

// === SUB COMPONENTS ===

function OrderStatusBadge({ status }: { status: string }) {
  if (status === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
        <Clock className="w-3 h-3 text-amber-600" /> ĐƠN MỚI
      </span>
    )
  }
  if (status === 'CONFIRMED') {
    return (
      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
        <Package className="w-3 h-3 text-blue-600" /> ĐÃ XUẤT KHO
      </span>
    )
  }
  if (status === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
        <CheckCircle className="w-3 h-3 text-emerald-600" /> HOÀN THÀNH
      </span>
    )
  }
  if (status === 'CANCELLED') {
    return (
      <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
        <XCircle className="w-3 h-3 text-rose-600" /> ĐÃ HỦY
      </span>
    )
  }
  return null
}

function PaymentStatusBadge({ paymentStatus }: { paymentStatus?: string }) {
  if (!paymentStatus || paymentStatus === 'UNPAID') {
    return (
      <span className="inline-block bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded text-[9px] font-bold">
        ⏳ Chưa trả
      </span>
    )
  }
  if (paymentStatus === 'PAID') {
    return (
      <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-bold">
        ✅ Đã trả đủ
      </span>
    )
  }
  return null
}