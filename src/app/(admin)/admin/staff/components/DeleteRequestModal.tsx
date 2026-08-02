'use client'

import { useState } from 'react'
import { Profile } from '@/types/database'
import { XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface DeleteRequestModalProps {
  staff: Profile | null
  currentUserProfile: Profile | null
  onClose: () => void
  onSuccess: () => void
}

export default function DeleteRequestModal({
  staff,
  currentUserProfile,
  onClose,
  onSuccess,
}: DeleteRequestModalProps) {
  const [deleteReason, setDeleteReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!staff) return null

  const handleSendDeleteRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deleteReason.trim() || !currentUserProfile) {
      return toast.warning('Vui lòng nhập lý do trình Giám Đốc!')
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/staff/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REQUEST_DELETE',
          staffId: staff.id,
          requestedBy: currentUserProfile.id,
          reason: deleteReason.trim(),
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)

      toast.success(result.message)
      setDeleteReason('')
      onClose()
      onSuccess()
    } catch (err: any) {
      toast.error(`Lỗi gửi yêu cầu: ${err.message || 'Có lỗi xảy ra'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={handleSendDeleteRequest}
        className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-base">Tạo Phiếu Xin Xóa Nhân Viên</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Yêu cầu xóa nhân viên <strong className="text-rose-600">{staff.full_name}</strong> sẽ được chuyển đến <strong>Giám Đốc (CEO)</strong> phê duyệt.
        </p>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Lý do trình Giám Đốc xin xóa (*):</label>
          <textarea
            required
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            placeholder="Ví dụ: Nhân viên nghỉ việc từ tháng 8, vi phạm quy định công ty..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-rose-500 focus:bg-white transition-colors h-24"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Bỏ Qua
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm disabled:bg-slate-300"
          >
            {isSubmitting ? 'ĐANG GỬI...' : 'Gửi Phiếu Trình CEO'}
          </button>
        </div>
      </form>
    </div>
  )
}
