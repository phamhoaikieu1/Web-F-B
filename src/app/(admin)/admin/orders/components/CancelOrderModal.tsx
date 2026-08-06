'use client'

import { Order } from '@/types/database'
import { X } from 'lucide-react'

interface CancelOrderModalProps {
  order: Order | null
  cancelReason: string
  setCancelReason: (reason: string) => void
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}

export default function CancelOrderModal({
  order,
  cancelReason,
  setCancelReason,
  onClose,
  onSubmit,
}: CancelOrderModalProps) {
  if (!order) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-base">Xác Nhận Hủy Đơn Hàng</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Bạn có chắc chắn muốn hủy đơn hàng <strong className="font-mono text-blue-600">{order.order_code}</strong>?
        </p>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Lý do hủy đơn (*):</label>
          <textarea
            required
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Ví dụ: Khách báo đổi địa chỉ, hết tồn kho siro,..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-rose-500 focus:bg-white transition-colors h-24"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Bỏ qua
          </button>
          <button
            type="submit"
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
          >
            Xác Nhận Hủy
          </button>
        </div>
      </form>
    </div>
  )
}
