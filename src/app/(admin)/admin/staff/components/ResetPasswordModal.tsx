'use client'

import { useState } from 'react'
import { Profile } from '@/types/database'
import { XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ResetPasswordModalProps {
  staff: Profile | null
  onClose: () => void
}

export default function ResetPasswordModal({ staff, onClose }: ResetPasswordModalProps) {
  const [newPasswordInput, setNewPasswordInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!staff) return null

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPasswordInput.trim()) return toast.warning('Vui lòng nhập mật khẩu mới!')

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/staff/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESET_PASSWORD',
          staffId: staff.id,
          newPassword: newPasswordInput.trim(),
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)

      toast.success(result.message)
      setNewPasswordInput('')
      onClose()
    } catch (err: any) {
      toast.error(`Lỗi reset mật khẩu: ${err.message || 'Có lỗi xảy ra'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={handleResetPassword}
        className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-base">Reset Mật Khẩu Nhân Viên</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Nhập mật khẩu mới cho nhân sự <strong className="text-blue-600">{staff.full_name}</strong> ({staff.email})
        </p>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Mật khẩu mới (*):</label>
          <input
            type="password"
            required
            value={newPasswordInput}
            onChange={(e) => setNewPasswordInput(e.target.value)}
            placeholder="Nhập mật khẩu mới từ 6 ký tự..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm disabled:bg-slate-300"
          >
            {isSubmitting ? 'ĐANG LƯU...' : 'Lưu Mật Khẩu Mới'}
          </button>
        </div>
      </form>
    </div>
  )
}
