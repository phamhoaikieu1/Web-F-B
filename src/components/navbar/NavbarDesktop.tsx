'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Store, ShoppingBag, Heart, User, Phone, ArrowDownLeft, BarChart3, Users, Settings, LogOut, Menu, X, ChevronRight, ShieldCheck } from 'lucide-react'
import SearchBar from '@/components/SearchBar'
import { Profile, Category } from '@/types/database'

interface NavbarDesktopProps {
  pathname: string
  profile: Profile | null
  categories: Category[]
  cartCount: number
  wishlistCount: number
  currentCategoryParam: string | null
  onSignOut: () => void
}

export default function NavbarDesktop({
  pathname,
  profile,
  categories,
  cartCount,
  wishlistCount,
  currentCategoryParam,
  onSignOut,
}: NavbarDesktopProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Header Admin
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && profile) {
    const isOwner = profile.role === 'OWNER'
    const isAdmin = profile.role === 'ADMIN'

    return (
      <header className="hidden md:block bg-slate-900 text-white sticky top-0 z-50 shadow-md border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/admin/orders" className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-xl text-white">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-wide block">F&B ADMIN SYSTEM</span>
              <span className="text-[10px] text-emerald-400 block -mt-1 font-mono">INTERNAL MANAGEMENT</span>
            </div>
          </Link>

          <nav className="flex items-center gap-2 text-xs font-semibold">
            <Link href="/admin/orders/new" className="px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-emerald-400" /> POS Lên Đơn
            </Link>
            <Link href="/admin/orders" className="px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5">
              <Store className="w-4 h-4 text-amber-400" /> Quản Lý Đơn
            </Link>
            {(isOwner || isAdmin) && (
              <Link href="/admin/import" className="px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5">
                <ArrowDownLeft className="w-4 h-4 text-cyan-400" /> Nhập Kho
              </Link>
            )}
            {(isOwner || isAdmin) && (
              <Link href="/admin/reports" className="px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-purple-400" /> Báo Cáo
              </Link>
            )}
            {(isOwner || isAdmin) && (
              <Link href="/admin/staff" className="px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" /> Nhân Sự
              </Link>
            )}
            <Link href="/admin/settings" className="ml-2 px-3 py-1.5 rounded-xl bg-slate-800 text-amber-400 font-bold flex items-center gap-1">
              <Settings className="w-3.5 h-3.5" /> {profile.full_name}
            </Link>
            <button onClick={onSignOut} className="p-2 bg-red-600/80 rounded-lg hover:bg-red-600 text-white cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </header>
    )
  }

  // Header Storefront Desktop
  return (
    <>
      <header className="hidden md:block bg-white sticky top-0 z-40 border-b border-slate-200 shadow-2xs">
        {/* Top banner căn lề container chuẩn 1600px */}
        <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-6">
          <div className="max-w-[1600px] mx-auto flex justify-between items-center">
            <span>🎉 Tổng kho nguyên liệu F&B giá sỉ - Cam kết chính hãng 100%</span>
            <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
              <Phone className="w-3 h-3" /> Hotline / Zalo B2B: 0989.830.347
            </span>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 shrink-0">
            {/* Khôi phục Nút Hamburger Menu Desktop */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-800 font-bold text-xs cursor-pointer shrink-0"
            >
              <Menu className="w-6 h-6 text-slate-900" />
            </button>

            <Link href="/" className="flex items-center gap-2.5">
              <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-xs">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <span className="font-black text-xl tracking-tight text-slate-900 block leading-none">F&B STORE</span>
                <span className="text-[9px] font-bold text-emerald-600 tracking-widest block uppercase mt-0.5">B2B Ingredient</span>
              </div>
            </Link>
          </div>

          <div className="flex-1 max-w-2xl px-4">
            <SearchBar />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {profile && (
              <Link
                href="/admin/orders"
                className="flex items-center gap-1.5 bg-gradient-to-r from-blue-900 to-indigo-900 text-amber-300 border border-amber-400/40 px-3.5 py-2 rounded-2xl font-bold text-xs shadow-sm hover:opacity-90 transition-all"
                title="Chuyển sang Giao diện Quản trị Admin"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Cổng Quản Trị Admin</span>
              </Link>
            )}

            <Link href="/login" className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-xl text-slate-700 hover:text-emerald-600 transition-colors text-xs font-semibold">
              <User className="w-5 h-5 text-slate-600" />
              <span>{profile ? profile.full_name : 'Tài Khoản'}</span>
            </Link>

            <Link href="/wishlist" className="relative p-2 hover:bg-slate-100 rounded-xl text-slate-700 hover:text-red-600 transition-colors">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl font-bold text-xs shadow-xs transition-all">
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-900 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <span>Giỏ Hàng</span>
            </Link>
          </div>
        </div>

        <nav className="border-t border-slate-100 bg-white">
          <div className="max-w-[1600px] mx-auto px-6 h-11 flex items-center justify-center gap-8 text-xs font-bold text-slate-700 overflow-x-auto scrollbar-none">
            <Link href="/" className={`hover:text-emerald-600 whitespace-nowrap transition-colors ${pathname === '/' ? 'text-emerald-600 font-black border-b-2 border-emerald-600 py-2.5' : ''}`}>
              TRANG CHỦ
            </Link>

            <Link href="/products" className={`hover:text-emerald-600 whitespace-nowrap transition-colors ${pathname === '/products' && !currentCategoryParam ? 'text-emerald-600 font-black border-b-2 border-emerald-600 py-2.5' : ''}`}>
              TẤT CẢ NGUYÊN LIỆU
            </Link>

            {categories.map((cat) => (
              <Link key={cat.id} href={`/products?category=${cat.id}`} className={`hover:text-emerald-600 whitespace-nowrap transition-colors uppercase ${currentCategoryParam === cat.id ? 'text-emerald-600 font-black border-b-2 border-emerald-600 py-2.5' : ''}`}>
                {cat.name}
              </Link>
            ))}

            <span className="text-red-500 font-black uppercase whitespace-nowrap cursor-pointer hover:opacity-80">
              🔥 KÈM ƯU ĐÃI SỈ
            </span>
          </div>
        </nav>
      </header>

      {/* Drawer Slide-out Desktop */}
      {isMenuOpen && (
        <div className="hidden md:flex fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-80 h-full shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-left duration-300">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2">
                  <div className="bg-emerald-600 p-1.5 rounded-xl text-white">
                    <Store className="w-5 h-5" />
                  </div>
                  <span className="font-black text-base text-slate-900">F&B STORE</span>
                </Link>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <Link href="/products" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-3 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl font-bold text-xs text-slate-800">
                  <span>Tất Cả Nguyên Liệu</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/products?category=${cat.id}`} onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-3 hover:bg-slate-50 hover:text-emerald-600 rounded-xl font-medium text-xs text-slate-700">
                    <span>{cat.name}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 cursor-pointer" onClick={() => setIsMenuOpen(false)} />
        </div>
      )}
    </>
  )
}