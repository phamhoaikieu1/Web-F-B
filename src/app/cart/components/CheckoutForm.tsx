'use client'

import { Send, ShieldCheck } from 'lucide-react'

interface CheckoutFormProps {
  customerName: string
  setCustomerName: (v: string) => void
  storeName: string
  setStoreName: (v: string) => void
  customerPhone: string
  setCustomerPhone: (v: string) => void
  customerAddress: string
  setCustomerAddress: (v: string) => void
  notes: string
  setNotes: (v: string) => void
  totalAmount: number
  itemCount: number
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
}

export default function CheckoutForm({
  customerName,
  setCustomerName,
  storeName,
  setStoreName,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
  notes,
  setNotes,
  totalAmount,
  itemCount,
  isSubmitting,
  onSubmit,
}: CheckoutFormProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 sticky top-20">
      <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b pb-3">
        2. Thông Tin Chủ Quán & Giao Hàng
      </h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Họ tên người đặt / Chủ quán <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ví dụ: Nguyễn Văn A"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tên Quán / Thương hiệu (Nếu có)
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Trà Sữa Mixue Cầu Giấy"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Số điện thoại Zalo nhận xác nhận <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            placeholder="0912345678"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Địa chỉ nhận hàng chi tiết <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Số nhà, đường, phường/xã, quận/huyện..."
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Ghi chú đợt giao
          </label>
          <textarea
            rows={2}
            placeholder="Giao giờ hành chính, gọi trước khi giao..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="bg-blue-50/70 border border-blue-100 p-4 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-600">
            <span>Tạm tính ({itemCount} món):</span>
            <span>{Math.round(totalAmount).toLocaleString('vi-VN')} đ</span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-600">
            <span>Phí vận chuyển:</span>
            <span className="text-emerald-600 font-semibold">Thỏa thuận qua Zalo</span>
          </div>
          <div className="border-t border-blue-200 pt-2 flex justify-between items-center">
            <span className="font-bold text-slate-900 text-sm">Tổng cộng:</span>
            <span className="text-xl font-bold text-blue-600">
              {Math.round(totalAmount).toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || itemCount === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:bg-slate-300"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'ĐANG KHỞI TẠO ĐƠN HÀNG...' : 'XÁC NHẬN CHỐT ĐƠN QUA ZALO'}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Bảo mật thông tin đơn hàng B2B tuyệt đối</span>
        </div>
      </form>
    </div>
  )
}