'use client'

import { useState } from 'react'
import { UserRole } from '@/types/database'
import { UserPlus, X } from 'lucide-react'
import { toast } from 'sonner'

interface CreateStaffModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateStaffModal({ isOpen, onClose, onSuccess }: CreateStaffModalProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('STAFF')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      return toast.warning('Vui lòng điền đầy đủ thông tin!')
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/staff/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_STAFF',
          fullName: fullName.trim(),
          email: email.trim(),
          password: password.trim(),
          role,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)

      toast.success(result.message)
      setFullName('')
      setEmail('')
      setPassword('')
      setRole('STAFF')
      onClose()
      onSuccess()
    } catch (err: any) {
      toast.error(`Lỗi tạo tài khoản: ${err.message || 'Có lỗi xảy ra'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" /> Cấp Tài Khoản Nhân Sự Mới
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Họ và Tên Nhân Viên (*):</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Nguyễn Văn Nam"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Đăng Nhập (*):</label>
            <input
              type="email"
              required
              placeholder="nam.nguyen@fb-b2b.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mật Khẩu Khởi Tạo (*):</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Chức Vụ Chuyên Môn (*):</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500"
            >
              <option value="STAFF">NHÂN VIÊN SALES / KHO</option>
              <option value="ADMIN">TRƯỞNG PHÒNG / LEADER</option>
            </select>
          </div>
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
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md disabled:bg-slate-300"
          >
            {isSubmitting ? 'ĐANG TẠO...' : 'XÁC NHẬN CẤP TK'}
          </button>
        </div>
      </form>
    </div>
  )
}
