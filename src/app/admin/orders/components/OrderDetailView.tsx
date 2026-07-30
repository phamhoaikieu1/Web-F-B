'use client'

import { Eye, PackageCheck } from 'lucide-react'
import { Order, OrderItem, Product } from '@/types/database'

export interface ExtendedOrderItem extends OrderItem {
  products?: Product
}

interface OrderDetailViewProps {
  selectedOrder: Order | null
  orderItems: ExtendedOrderItem[]
  processingId: string | null
  onFulfillOrder: (order: Order) => void
}

export default function OrderDetailView({
  selectedOrder,
  orderItems,
  processingId,
  onFulfillOrder,
}: OrderDetailViewProps) {
  if (!selectedOrder) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[500px] text-slate-400 text-sm space-y-2 py-20">
        <Eye className="w-10 h-10 text-slate-300" />
        <p>Bấm vào biểu tượng mắt ở cột thao tác để xem chi tiết đơn hàng</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[500px]">
      <div className="space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-xs text-slate-400">Chi tiết đơn hàng</span>
              <h2 className="text-xl font-bold font-mono text-blue-600">
                {selectedOrder.order_code}
              </h2>
            </div>
            {selectedOrder.status === 'PENDING' ? (
              <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-semibold">
                Chờ duyệt xuất kho
              </span>
            ) : (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
                Đã hoàn thành
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 space-y-1 mt-3">
            <p>
              <strong>Khách hàng:</strong> {selectedOrder.customer_name}
            </p>
            <p>
              <strong>Số điện thoại:</strong> {selectedOrder.customer_phone}
            </p>
            <p>
              <strong>Địa chỉ:</strong> {selectedOrder.customer_address}
            </p>
            {selectedOrder.notes && (
              <p className="italic text-slate-600">
                <strong>Ghi chú:</strong> {selectedOrder.notes}
              </p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase text-slate-400 mb-3 tracking-wider">
            Danh sách sản phẩm đặt
          </h3>
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
            {orderItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-semibold text-slate-900 truncate">
                    {item.products?.name || item.product_id}
                  </p>
                  <p className="text-slate-500">
                    {Number(item.unit_price).toLocaleString('vi-VN')} đ ×{' '}
                    <strong>{item.quantity}</strong>
                  </p>
                </div>
                <div className="font-bold text-slate-900 text-right">
                  {Number(item.subtotal).toLocaleString('vi-VN')} đ
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-700">Tổng Thành Tiền:</span>
            <span className="text-2xl font-bold text-blue-600">
              {Number(selectedOrder.total_amount).toLocaleString('vi-VN')} đ
            </span>
          </div>

          {selectedOrder.status === 'PENDING' && (
            <button
              onClick={() => onFulfillOrder(selectedOrder)}
              disabled={processingId === selectedOrder.id}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300"
            >
              <PackageCheck className="w-5 h-5" />
              {processingId === selectedOrder.id
                ? 'Đang xử lý xuất kho...'
                : 'XÁC NHẬN & XUẤT KHO'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}