'use client'

import { Bell, Sparkles, X } from 'lucide-react'
import { RealtimeToastPayload } from '../hooks/useOrderRealtime'

interface OrderRealtimeToastProps {
  realtimeToast: RealtimeToastPayload | null
  onClose: () => void
}

export default function OrderRealtimeToast({
  realtimeToast,
  onClose,
}: OrderRealtimeToastProps) {
  if (!realtimeToast) return null

  return (
    <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-blue-900 to-indigo-900 text-white border border-blue-400/40 p-4 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in slide-in-from-top duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-blue-300 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Realtime Order
              </span>
            </div>
            <h4 className="font-bold text-sm text-white mt-1">Đơn hàng sỉ mới vừa cập bến!</h4>
            <p className="text-xs text-blue-200 font-mono mt-0.5">
              Mã: <strong className="text-white">{realtimeToast.orderCode}</strong> - Khách:{' '}
              <strong className="text-white">{realtimeToast.customerName}</strong>
            </p>
            <p className="text-xs text-emerald-400 font-bold mt-1">
              Giá trị: {realtimeToast.totalAmount.toLocaleString('vi-VN')} VNĐ
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
