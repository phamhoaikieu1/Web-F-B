'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Lock, Mail, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      toast.error(`Đăng nhập thất bại: ${error.message}`)
    } else {
      toast.success('Đăng nhập quản trị thành công!')
      // Đăng nhập thành công -> Chuyển thẳng tới trang Quản lý đơn hàng
      router.push('/admin/orders')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <main className="min-h-[85vh] flex items-center justify-center p-4 bg-slate-100">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex bg-slate-900 p-3.5 rounded-2xl text-emerald-400 mb-1 shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Cổng Quản Trị Nội Bộ</h1>
          <p className="text-xs text-slate-500">Dành riêng cho Owner, Admin Kho & Nhân viên POS</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email nhân sự:</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="admin@fb-b2b.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu khẩu nội bộ:</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all text-xs cursor-pointer disabled:bg-slate-300 shadow-md flex items-center justify-center gap-2"
          >
            {loading ? 'ĐANG XÁC THỰC...' : 'ĐĂNG NHẬP HỆ THỐNG QUẢN TRỊ'}
          </button>
        </form>

        <div className="text-center pt-2">
          <span className="text-[11px] text-slate-400">
            Hệ thống bảo mật nội bộ B2B F&B Management
          </span>
        </div>
      </div>
    </main>
  )
}