'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { 
  Store, ShoppingBag, Menu, X, Heart, User, 
  ChevronRight, LogOut, Settings, Phone, ArrowDownLeft, BarChart3, Users 
} from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { Profile, Category } from '@/types/database'
import SearchBar from '@/components/SearchBar'

function NavbarContent() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategoryParam = searchParams.get('category')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('*').order('display_order')
      if (data) setCategories(data)
    }
    fetchCategories()

    const updateCounts = () => {
      const savedCart = localStorage.getItem('b2b_cart')
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart)
          setCartCount(parsed.reduce((sum: number, i: any) => sum + i.quantity, 0))
        } catch (e) {}
      } else { setCartCount(0) }

      const savedWishlist = localStorage.getItem('b2b_wishlist')
      if (savedWishlist) {
        try { setWishlistCount(JSON.parse(savedWishlist).length) } catch (e) {}
      } else { setWishlistCount(0) }
    }

    updateCounts()
    window.addEventListener('storage', updateCounts)
    const interval = setInterval(updateCounts, 1000)

    return () => {
      window.removeEventListener('storage', updateCounts)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) setProfile(data)
      }
    }
    fetchUserProfile()
  }, [pathname])

  // HEADER RIÊNG CHO TRANG ADMIN NỘI BỘ
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && profile) {
    const isOwner = profile.role === 'OWNER'
    const isAdmin = profile.role === 'ADMIN'

    return (
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md border-b border-slate-800">
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
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login'); }} className="p-2 bg-red-600/80 rounded-lg hover:bg-red-600 text-white cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </header>
    )
  }

  // HEADER STOREFRONT CHO KHÁCH HÀNG MUA HÀNG
  return (
    <>
      <header className="bg-white sticky top-0 z-40 border-b border-slate-200 shadow-2xs">
        {/* TOP BAR THÔNG BÁO */}
        <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-6">
          <div className="max-w-[1600px] mx-auto flex justify-between items-center">
            <span>🎉 Tổng kho nguyên liệu F&B giá sỉ - Cam kết chính hãng 100%</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
                <Phone className="w-3 h-3" /> Hotline / Zalo B2B: 0989.830.347
              </span>
            </div>
          </div>
        </div>

        {/* HEADER CHÍNH */}
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-20 flex items-center justify-between gap-4 md:gap-8">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-800 font-bold text-xs cursor-pointer shrink-0"
          >
            <Menu className="w-6 h-6 text-slate-900" />
            <span className="hidden sm:inline uppercase tracking-wider">Danh Mục</span>
          </button>

          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-xs">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-slate-900 block leading-none">F&B STORE</span>
              <span className="text-[9px] font-bold text-emerald-600 tracking-widest block uppercase mt-0.5">B2B Ingredient</span>
            </div>
          </Link>

          {/* CỤM TÌM KIẾM ĐÃ TÁCH COMPONENT */}
          <SearchBar />

          {/* CỤM NÚT THAO TÁC CỦA KHÁCH HÀNG */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <Link
              href="/login"
              className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-xl text-slate-700 hover:text-emerald-600 transition-colors text-xs font-semibold"
              title="Tài khoản khách hàng"
            >
              <User className="w-5 h-5 text-slate-600" />
              <span className="hidden xl:inline">Tài Khoản</span>
            </Link>

            <Link 
              href="/wishlist" 
              className="relative p-2 hover:bg-slate-100 rounded-xl text-slate-700 hover:text-red-600 transition-colors"
              title="Sản phẩm yêu thích"
            >
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
              <span className="hidden sm:inline">Giỏ Hàng</span>
            </Link>
          </div>
        </div>

        {/* NAVIGATION BAR DƯỚI */}
        <nav className="border-t border-slate-100 bg-white">
          <div className="max-w-[1600px] mx-auto px-6 h-11 flex items-center justify-center gap-8 text-xs font-bold text-slate-700 overflow-x-auto scrollbar-none">
            <Link
              href="/"
              className={`hover:text-emerald-600 whitespace-nowrap transition-colors ${
                pathname === '/' ? 'text-emerald-600 font-black border-b-2 border-emerald-600 py-2.5' : ''
              }`}
            >
              TRANG CHỦ
            </Link>

            <Link
              href="/products"
              className={`hover:text-emerald-600 whitespace-nowrap transition-colors ${
                pathname === '/products' && !currentCategoryParam ? 'text-emerald-600 font-black border-b-2 border-emerald-600 py-2.5' : ''
              }`}
            >
              TẤT CẢ NGUYÊN LIỆU
            </Link>

            {categories.map((cat) => {
              const isSelected = currentCategoryParam === cat.id
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  className={`hover:text-emerald-600 whitespace-nowrap transition-colors uppercase ${
                    isSelected ? 'text-emerald-600 font-black border-b-2 border-emerald-600 py-2.5' : ''
                  }`}
                >
                  {cat.name}
                </Link>
              )
            })}

            <span className="text-red-500 font-black uppercase whitespace-nowrap cursor-pointer hover:opacity-80">
              🔥 KÈM ƯU ĐÃI SỈ
            </span>
          </div>
        </nav>
      </header>

      {/* DRAWER MENU SLIDE OUT */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-left duration-300">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div className="flex items-center gap-2">
                  <Store className="w-6 h-6 text-emerald-600" />
                  <span className="font-black text-lg text-slate-900">DANH MỤC SẢN PHẨM</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <Link
                  href="/products"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between p-3 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl font-bold text-sm text-slate-800 transition-colors"
                >
                  <span>Tất Cả Nguyên Liệu F&B</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.id}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-3 hover:bg-slate-50 hover:text-emerald-600 rounded-xl font-medium text-xs text-slate-700 transition-colors"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
                <p className="font-bold">Tổng kho bán sỉ B2B Phạm Vi Toàn Quốc</p>
                <p className="text-slate-600">Hotline đặt hàng gấp: 0989.830.347</p>
              </div>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMenuOpen(false)} />
        </div>
      )}
    </>
  )
}

export default function Navbar() {
  return (
    <Suspense fallback={<header className="bg-slate-900 h-16 w-full" />}>
      <NavbarContent />
    </Suspense>
  )
}