'use client'

import { ShieldCheck } from 'lucide-react'

interface OrderSummaryCardProps {
  totalAmount: number
  itemCount: number
}

export default function OrderSummaryCard({ totalAmount, itemCount }: OrderSummaryCardProps) {
  return (
    <div className="bg-blue-50/70 border border-blue-100 p-4 rounded-xl space-y-2">
      <div className="flex justify-between items-center text-xs text-slate-600">
        <span>Tạm tính ({itemCount} món):</span>
        <span className="font-semibold text-slate-800">
          {Math.round(totalAmount).toLocaleString('vi-VN')} đ
        </span>
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

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Bảo mật thông tin đơn hàng B2B tuyệt đối</span>
      </div>
    </div>
  )
}
