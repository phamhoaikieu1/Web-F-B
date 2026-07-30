'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Profile, UserRole } from '@/types/database'
import { UserPlus, Shield, Trash2 } from 'lucide-react'

export default function StaffManagementPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('STAFF')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchProfiles = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: myProf } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (myProf) setCurrentUserProfile(myProf)
    }

    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (!error) setProfiles(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !password) return alert('Vui lòng điền đầy đủ thông tin!')

    setIsSubmitting(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim(), role },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        await supabase.from('profiles').insert({
          id: authData.user.id,
          full_name: fullName.trim(),
          email: email.trim(),
          role: role,
        })
      }

      alert(`Khởi tạo tài khoản ${email} thành công!`)
      setFullName('')
      setEmail('')
      setPassword('')
      setRole('STAFF')
      fetchProfiles()
    } catch (err: any) {
      alert(`Lỗi tạo tài khoản: ${err.message || 'Không thể khởi tạo'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteStaff = async (staffId: string, staffName: string) => {
    if (currentUserProfile?.role !== 'OWNER') {
      return alert('Chỉ có Giám đốc (OWNER) mới có quyền xóa tài khoản nhân sự!')
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa nhân viên ${staffName}?`)) return

    try {
      await supabase.from('profiles').delete().eq('id', staffId)
      alert(`Đã xóa tài khoản ${staffName}!`)
      fetchProfiles()
    } catch (err: any) {
      alert(`Không thể xóa: ${err.message}`)
    }
  }

  // Chặn nếu SALE/POS cố tình vào trang nhân sự
  if (currentUserProfile && currentUserProfile.role === 'STAFF') {
    return (
      <main className="p-12 text-center space-y-4">
        <div className="text-red-500 font-bold text-lg">TRUY CẬP BỊ TỪ CHỐI</div>
        <p className="text-xs text-slate-500">Tài khoản Nhân viên Sale/POS không có quyền vào quản lý nhân sự.</p>
      </main>
    )
  }

  return (
    <main className="p-8 max-w-[1600px] mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-7 h-7 text-blue-600" /> Quản Lý Nhân Sự & Phân Quyền
        </h1>
        <p className="text-sm text-slate-500">
          Phân cấp 3 tầng: OWNER (Giám đốc) &gt; ADMIN KHO (Quản lý) &gt; SALE/POS (Nhân viên)
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 font-bold text-slate-900 text-sm">
            Danh Sách Nhân Sự ({profiles.length})
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="p-4">Họ & Tên</th>
                <th className="p-4">Email</th>
                <th className="p-4 text-center">Vai Trò</th>
                {currentUserProfile?.role === 'OWNER' && <th className="p-4 text-center">Thao Tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">Đang tải...</td>
                </tr>
              ) : profiles.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-900">{p.full_name}</td>
                  <td className="p-4 font-mono text-slate-500">{p.email}</td>
                  <td className="p-4 text-center">
                    {p.role === 'OWNER' && (
                      <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full font-bold">
                        OWNER
                      </span>
                    )}
                    {p.role === 'ADMIN' && (
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-bold">
                        ADMIN KHO
                      </span>
                    )}
                    {p.role === 'STAFF' && (
                      <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full font-semibold">
                        NV SALE / POS
                      </span>
                    )}
                  </td>
                  {currentUserProfile?.role === 'OWNER' && (
                    <td className="p-4 text-center">
                      {p.role !== 'OWNER' && (
                        <button
                          onClick={() => handleDeleteStaff(p.id, p.full_name)}
                          className="text-slate-300 hover:text-red-600 p-1 transition-colors cursor-pointer"
                          title="Xóa tài khoản nhân viên này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-3">
            <UserPlus className="w-5 h-5 text-blue-600" /> Cấp Tài Khoản Nhân Sự Mới
          </h2>

          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Họ tên nhân viên:</label>
              <input
                type="text"
                required
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email đăng nhập:</label>
              <input
                type="email"
                required
                placeholder="staff@fb-b2b.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu khởi tạo:</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cấp vai trò (Role):</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="STAFF">NHÂN VIÊN SALE / POS (Chỉ tạo đơn bán sỉ)</option>
                <option value="ADMIN">ADMIN KHO (Xem đơn, Nhập kho & Báo cáo)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all text-xs cursor-pointer shadow-md disabled:bg-slate-300"
            >
              {isSubmitting ? 'ĐANG CẤP TÀI KHOẢN...' : 'XÁC NHẬN CẤP TÀI KHOẢN'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}