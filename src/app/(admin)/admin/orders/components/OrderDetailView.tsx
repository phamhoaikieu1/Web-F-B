'use client'

import { Eye, PackageCheck, Printer, Clock, Package, CheckCircle, XCircle, Banknote, CreditCard } from 'lucide-react'
import { Order, OrderItem, Product } from '@/types/database'

export interface ExtendedOrderItem extends OrderItem {
  products?: Product
}

interface OrderDetailViewProps {
  selectedOrder: Order | null
  orderItems: ExtendedOrderItem[]
  processingId: string | null
  onFulfillOrder: (order: Order) => void
  onMarkAsPaid: (order: Order) => void
  onCancelOrder: (order: Order) => void
  onPrintPackingSlip: (order: Order) => void
  onMarkAsDebt?: (order: Order) => void
  onRecordPartialPayment?: (order: Order) => void
}

export default function OrderDetailView({
  selectedOrder,
  orderItems,
  processingId,
  onFulfillOrder,
  onMarkAsPaid,
  onCancelOrder,
  onPrintPackingSlip,
  onMarkAsDebt,
  onRecordPartialPayment,
}: OrderDetailViewProps) {
  if (!selectedOrder) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[500px] text-slate-400 text-sm space-y-2 py-20">
        <Eye className="w-10 h-10 text-slate-300" />
        <p>Bấm vào biểu tượng mắt ở cột thao tác để xem chi tiết đơn hàng</p>
      </div>
    )
  }

  const paymentStatus = selectedOrder.payment_status || 'UNPAID'

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

            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button
                onClick={() => onPrintPackingSlip(selectedOrder)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title="In Phiếu Dán Thùng Hàng Xuất Kho"
              >
                <Printer className="w-3.5 h-3.5" />
                In Tem Kho
              </button>

              {/* BADGE TRẠNG THÁI ĐƠN HÀNG */}
              {selectedOrder.status === 'PENDING' && (
                <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> BƯỚC 1: ĐƠN MỚI
                </span>
              )}
              {(selectedOrder.status === 'CONFIRMED' || selectedOrder.status === 'PROCESSING') && (
                <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" /> BƯỚC 2: ĐÃ XUẤT KHO
                </span>
              )}
              {selectedOrder.status === 'COMPLETED' && (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> BƯỚC 3: HOÀN THÀNH
                </span>
              )}
              {selectedOrder.status === 'CANCELLED' && (
                <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> ĐÃ HỦY ĐƠN
                </span>
              )}
            </div>
          </div>

          {/* THÔNG TIN KHÁCH HÀNG */}
          <div className="text-xs text-slate-500 space-y-1.5 mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p>
              <strong>Khách hàng:</strong> {selectedOrder.customer_name}
            </p>
            <p>
              <strong>Số điện thoại:</strong> {selectedOrder.customer_phone}
            </p>
            <p>
              <strong>Địa chỉ:</strong> {selectedOrder.customer_address}
            </p>

            {/* BADGE THANH TOÁN CÔNG NỢ */}
            <div className="flex items-center gap-2 pt-1.5 border-t border-slate-200/80 mt-1.5">
              <Banknote className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-bold text-slate-700">Thanh toán:</span>
              {paymentStatus === 'UNPAID' && (
                <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">⏳ Chưa thanh toán</span>
              )}
              {paymentStatus === 'PARTIAL' && (
                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  🔶 Đã trả {Number(selectedOrder.paid_amount || 0).toLocaleString('vi-VN')}đ / {Number(selectedOrder.total_amount).toLocaleString('vi-VN')}đ
                </span>
              )}
              {paymentStatus === 'PAID' && (
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">✅ Đã thanh toán đủ</span>
              )}
              {paymentStatus === 'DEBT' && (
                <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[10px] font-bold">🔴 Ghi nợ gối đầu</span>
              )}
            </div>

            {/* VẾT TRUY XUẤT NGUỒN GỐC & NHÂN SỰ DÙNG THAO TÁC */}
            <div className="border-t border-slate-200/80 pt-2 mt-2 space-y-1 text-[11px] font-mono">
              <p className="text-slate-700">
                📌 <strong>Nguồn tạo đơn:</strong>{' '}
                {selectedOrder.created_by_type === 'STAFF_POS'
                  ? `👨‍💼 NV ${selectedOrder.created_by_name || 'POS'} lên đơn hộ tại quầy`
                  : selectedOrder.created_by_type === 'CUSTOMER_SELF'
                  ? '👤 Khách tự chốt đơn qua Storefront'
                  : '👤 Khách ẩn danh'}
              </p>

              {selectedOrder.approved_by_name && (
                <p className="text-emerald-700 font-bold">
                  ✅ <strong>Duyệt xuất kho bởi:</strong> {selectedOrder.approved_by_name}
                </p>
              )}

              {selectedOrder.completed_by_name && (
                <p className="text-blue-700 font-bold">
                  💰 <strong>Hoàn thành bởi:</strong> {selectedOrder.completed_by_name}
                </p>
              )}

              {selectedOrder.cancelled_by_name && (
                <p className="text-rose-700 font-bold">
                  ❌ <strong>Hủy đơn bởi:</strong> {selectedOrder.cancelled_by_name}
                </p>
              )}
            </div>

            {selectedOrder.notes && (
              <p className="italic text-slate-600 border-t border-slate-200/60 pt-1.5 mt-1">
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
                  <div className="font-semibold text-slate-900 truncate">
                    {item.products?.name || `Mã SP: ${item.product_id}`}
                  </div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    {Number(item.unit_price).toLocaleString('vi-VN')} đ / gói
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-slate-900">
                    x {item.quantity}
                  </div>
                  <div className="font-mono text-emerald-600 font-bold">
                    {Number(item.subtotal).toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 mt-4 space-y-4">
        <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
            Tổng Tiền Đơn Hàng:
          </span>
          <span className="font-extrabold text-lg text-amber-400 font-mono">
            {Number(selectedOrder.total_amount).toLocaleString('vi-VN')} đ
          </span>
        </div>

        {/* CỤM NÚT THAO TÁC 3 BƯỚC ĐƠN GIẢN */}
        <div>
          {selectedOrder.status === 'PENDING' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => onFulfillOrder(selectedOrder)}
                disabled={processingId === selectedOrder.id}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-300 shadow-md"
              >
                <PackageCheck className="w-4 h-4" />
                📦 XÁC NHẬN & XUẤT KHO
              </button>

              <button
                onClick={() => onCancelOrder(selectedOrder)}
                disabled={processingId === selectedOrder.id}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-3 rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-300"
              >
                <XCircle className="w-4 h-4" />
                Hủy Đơn Hàng
              </button>
            </div>
          )}

          {(selectedOrder.status === 'CONFIRMED' || selectedOrder.status === 'PROCESSING') && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => onMarkAsPaid(selectedOrder)}
                  disabled={processingId === selectedOrder.id}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-300 shadow-md"
                >
                  <CheckCircle className="w-4 h-4" />
                  💰 XÁC NHẬN ĐÃ NHẬN TIỀN
                </button>

                <button
                  onClick={() => onCancelOrder(selectedOrder)}
                  disabled={processingId === selectedOrder.id}
                  className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-3 rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-300"
                >
                  <XCircle className="w-4 h-4" />
                  Hủy Đơn Hàng
                </button>
              </div>

              {/* NÚT CÔNG NỢ */}
              <div className="grid grid-cols-2 gap-2">
                {onMarkAsDebt && (
                  <button
                    onClick={() => onMarkAsDebt(selectedOrder)}
                    disabled={processingId === selectedOrder.id}
                    className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-2.5 rounded-xl transition-colors text-[11px] flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-300"
                  >
                    🔴 Ghi Nợ Gối Đầu
                  </button>
                )}
                {onRecordPartialPayment && (
                  <button
                    onClick={() => onRecordPartialPayment(selectedOrder)}
                    disabled={processingId === selectedOrder.id}
                    className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold py-2.5 rounded-xl transition-colors text-[11px] flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-300"
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Thanh Toán 1 Phần
                  </button>
                )}
              </div>
            </div>
          )}

          {selectedOrder.status === 'COMPLETED' && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Đơn Hàng Đã Thanh Toán & Hoàn Thành
            </div>
          )}

          {selectedOrder.status === 'CANCELLED' && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              Đơn Hàng Đã Hủy
            </div>
          )}
        </div>
      </div>
    </div>
  )
}