'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Settings, User, Lock, CheckCircle2 } from 'lucide-react'

export default function SettingsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email || '')
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) {
          setFullName(data.full_name)
          setRole(data.role)
        }
      }
    }
    loadUserData()
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Cập nhật Họ tên trong bảng profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() })
        .eq('id', user.id)

      if (profileError) throw profileError

      // 2. Cập nhật mật khẩu mới nếu người dùng nhập
      if (newPassword.trim()) {
        const { error: passError } = await supabase.auth.updateUser({
          password: newPassword.trim(),
        })
        if (passError) throw passError
      }

      alert('Đã cập nhật thông tin tài khoản thành công!')
      setNewPassword('')
    } catch (err: any) {
      alert(`Lỗi cập nhật: ${err.message || 'Không thể lưu thông tin'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="p-8 max-w-2xl mx-auto space-y-6">
      <header className="border-b pb-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-7 h-7 text-blue-600" /> Cài Đặt Tài Khoản Cá Nhân
        </h1>
        <p className="text-sm text-slate-500">Chỉnh sửa tên hiển thị và thay đổi mật khẩu đăng nhập của bạn</p>
      </header>

      <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email đăng nhập (Không thể thay đổi):</label>
          <input
            type="email"
            disabled
            value={email}
            className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-mono cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Cấp vai trò (Role):</label>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            {role === 'OWNER' ? 'GIÁM ĐỐC (OWNER)' : role === 'ADMIN' ? 'QUẢN LÝ KHO (ADMIN)' : 'NHÂN VIÊN SALE / POS'}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và Tên hiển thị:</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Đổi Mật Khẩu Mới (Để trống nếu không muốn đổi):</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all text-xs cursor-pointer shadow-md disabled:bg-slate-300"
        >
          {isSubmitting ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI CÁ NHÂN'}
        </button>
      </form>
    </main>
  )
}