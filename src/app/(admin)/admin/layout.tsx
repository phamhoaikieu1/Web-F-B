'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Profile } from '@/types/database'
import {
  ShoppingBag,
  PlusCircle,
  ArrowDownLeft,
  Package,
  Users,
  BarChart3,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  Crown,
  Briefcase,
  UserCheck,
  Store,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import { clearLocalGuestData } from '@/lib/syncCart'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [profile, setProfile] = useState<Profile | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) setProfile(data)
      }
    }
    loadProfile()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    clearLocalGuestData()
    toast.success('Đã đăng xuất khỏi hệ thống quản trị')
    router.push('/admin/login')
  }

  const navigation = [
    { name: 'Quản Lý Đơn Hàng', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Tạo Đơn Sỉ Mới (POS)', href: '/admin/orders/new', icon: PlusCircle },
    { name: 'Nhập Kho Nguyên Liệu', href: '/admin/import', icon: ArrowDownLeft },
    { name: 'Quản Lý Sản Phẩm', href: '/admin/products', icon: Package },
    { name: 'Quản Lý Khách Sỉ', href: '/admin/customers', icon: Users },
    { name: 'Báo Cáo Kinh Doanh', href: '/admin/reports', icon: BarChart3 },
    { name: 'Quản Lý Nhân Sự', href: '/admin/staff', icon: ShieldCheck },
    { name: 'Cài Đặt Tài Khoản', href: '/admin/settings', icon: Settings },
  ]

  // Đóng mobile menu khi chuyển trang
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Trang login admin thì hiển thị full width không cần sidebar
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-slate-900">{children}</div>
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans antialiased text-slate-900">
      {/* ==================================================================== */}
      {/* MOBILE ADMIN HEADER (CHỈ HIỂN THỊ TRÊN MÀN HÌNH NHỎ < md) */}
      {/* ==================================================================== */}
      <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/admin/orders" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center font-black text-xs">
              F&B
            </div>
            <span className="font-bold text-sm tracking-tight">ADMIN B2B</span>
          </Link>
        </div>

        {profile && (
          <div className="flex items-center gap-2">
            {profile.role === 'OWNER' && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-300" /> CEO
              </span>
            )}
            {profile.role === 'ADMIN' && (
              <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-blue-300" /> Leader
              </span>
            )}
            {profile.role === 'STAFF' && (
              <span className="bg-slate-700 text-slate-300 border border-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-slate-300" /> NV
              </span>
            )}
          </div>
        )}
      </header>

      {/* ==================================================================== */}
      {/* SIDEBAR MOBILE SLIDE-OUT DRAWER */}
      {/* ==================================================================== */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex">
          <div className="bg-slate-900 text-white w-72 h-full p-5 space-y-6 flex flex-col justify-between animate-in slide-in-from-left duration-300 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center font-black text-sm">
                    F&B
                  </div>
                  <div>
                    <h2 className="font-bold text-sm">F&B STORE ADMIN</h2>
                    <p className="text-[10px] text-slate-400">Hệ thống quản lý bán sỉ</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* PROFILE BADGE ON MOBILE */}
              {profile && (
                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                    {profile.full_name.slice(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-white truncate">{profile.full_name}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{profile.email}</p>
                  </div>
                </div>
              )}

              {/* MENU DẪN DỰ ÁN */}
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 opacity-50 ${isActive ? 'opacity-100' : ''}`} />
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="space-y-2 border-t border-slate-800 pt-4">
              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-xs font-semibold transition-colors"
              >
                <Store className="w-4 h-4" /> Trang Chủ Bán Hàng
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-rose-500/30"
              >
                <LogOut className="w-4 h-4" /> Đăng Xuất Hệ Thống
              </button>
            </div>
          </div>

          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* ==================================================================== */}
      {/* SIDEBAR DESKTOP (CỐ ĐỊNH TRÊN MÀN HÌNH MD VÀ LỚN HƠN) */}
      {/* ==================================================================== */}
      <aside className="hidden md:flex md:w-64 bg-slate-900 text-white flex-col justify-between p-5 shrink-0 min-h-screen sticky top-0 h-screen">
        <div className="space-y-6">
          <Link href="/admin/orders" className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md">
              F&B
            </div>
            <div>
              <h2 className="font-extrabold text-sm tracking-tight text-white">F&B STORE B2B</h2>
              <p className="text-[10px] text-slate-400 font-medium">Hệ thống quản trị nội bộ</p>
            </div>
          </Link>

          {/* USER PROFILE INFO BADGE */}
          {profile && (
            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                {profile.full_name.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-white truncate">{profile.full_name}</p>
                <div className="mt-0.5">
                  {profile.role === 'OWNER' && (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-300" /> Giám Đốc (CEO)
                    </span>
                  )}
                  {profile.role === 'ADMIN' && (
                    <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-blue-300" /> Trưởng Phòng
                    </span>
                  )}
                  {profile.role === 'STAFF' && (
                    <span className="bg-slate-700 text-slate-300 border border-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-slate-300" /> Nhân Viên Sales
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* NAVIGATION ITEMS */}
          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4.5 h-4.5" />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* BOTTOM LINKS & LOGOUT */}
        <div className="space-y-2 border-t border-slate-800 pt-4">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-semibold transition-colors"
          >
            <Store className="w-4 h-4" /> Về Trang Chủ Bán Hàng
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-rose-500/30"
          >
            <LogOut className="w-4 h-4" /> Đăng Xuất Admin
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
