'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Store, ShoppingBag, Phone, Menu, X, ChevronRight, MessageSquare } from 'lucide-react'
import SearchBar from '@/components/SearchBar'
import { Category } from '@/types/database'

interface NavbarDesktopProps {
  pathname: string
  categories: Category[]
  cartCount: number
  currentCategoryParam: string | null
}

export default function NavbarDesktop({
  pathname,
  categories,
  cartCount,
  currentCategoryParam,
}: NavbarDesktopProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Header Storefront Desktop
  return (
    <>
      <header className="hidden md:block bg-white sticky top-0 z-40 border-b border-slate-200 shadow-xs">
        {/* Top banner căn lề container chuẩn 1600px - Tone F&B Green #006838 */}
        <div className="bg-[#006838] text-white text-[11px] py-1.5 px-6 font-medium">
          <div className="max-w-[1600px] mx-auto flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <span>🎉</span>
              <span className="font-semibold">Tổng Kho Phân Phối Nguyên Liệu F&B Giá Sỉ</span>
              <span className="text-emerald-200 text-[10px] bg-white/10 px-2 py-0.5 rounded-full">Cam kết 100% Chính Hãng</span>
            </span>
            <span className="flex items-center gap-1.5 font-mono text-emerald-200 font-bold">
              <Phone className="w-3 h-3 text-emerald-300" /> Hotline / Zalo B2B: 0989.830.347
            </span>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex items-center gap-2 p-2 hover:bg-emerald-50 rounded-xl transition-colors text-slate-800 font-bold text-xs cursor-pointer shrink-0 border border-slate-200/80"
              title="Danh mục nguyên liệu"
            >
              <Menu className="w-5 h-5 text-[#006838]" />
              <span className="text-slate-800 font-bold">DANH MỤC</span>
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="bg-[#006838] p-2 rounded-xl text-white shadow-xs group-hover:bg-emerald-700 transition-colors">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <span className="font-black text-xl tracking-tight text-slate-900 block leading-none">F&B STORE</span>
                <span className="text-[9px] font-bold text-[#006838] tracking-widest block uppercase mt-0.5">B2B Ingredient</span>
              </div>
            </Link>
          </div>

          {/* Ô tìm kiếm nổi bật ở chính giữa */}
          <div className="flex-1 max-w-2xl px-2">
            <SearchBar />
          </div>

          {/* Cụm Nút Zalo B2B & Giỏ Hàng */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://zalo.me/0989830347"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-[#006838] border border-emerald-200/90 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-2xs shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#006838]" />
              <span>Zalo B2B: 0989.830.347</span>
            </a>

            <Link href="/cart" className="flex items-center gap-2.5 bg-[#006838] hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl font-bold text-xs shadow-xs transition-all shrink-0">
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
            <Link href="/" className={`hover:text-[#006838] whitespace-nowrap transition-colors ${pathname === '/' ? 'text-[#006838] font-black border-b-2 border-[#006838] py-2.5' : ''}`}>
              TRANG CHỦ
            </Link>

            <Link href="/products" className={`hover:text-[#006838] whitespace-nowrap transition-colors ${pathname === '/products' && !currentCategoryParam ? 'text-[#006838] font-black border-b-2 border-[#006838] py-2.5' : ''}`}>
              TẤT CẢ NGUYÊN LIỆU
            </Link>

            {categories.map((cat) => (
              <Link key={cat.id} href={`/products?category=${cat.id}`} className={`hover:text-[#006838] whitespace-nowrap transition-colors uppercase ${currentCategoryParam === cat.id ? 'text-[#006838] font-black border-b-2 border-[#006838] py-2.5' : ''}`}>
                {cat.name}
              </Link>
            ))}

            <span className="text-emerald-700 font-black uppercase whitespace-nowrap cursor-pointer hover:opacity-80 bg-emerald-50 px-2.5 py-1 rounded-full text-[11px] border border-emerald-200">
              🔥 ƯU ĐÃI SỈ THEO THÙNG
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
                  <div className="bg-[#006838] p-1.5 rounded-xl text-white">
                    <Store className="w-5 h-5" />
                  </div>
                  <span className="font-black text-base text-slate-900">F&B STORE</span>
                </Link>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <Link href="/products" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-3 hover:bg-emerald-50 hover:text-[#006838] rounded-xl font-bold text-xs text-slate-800">
                  <span>Tất Cả Nguyên Liệu</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/products?category=${cat.id}`} onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-3 hover:bg-emerald-50 hover:text-[#006838] rounded-xl font-medium text-xs text-slate-700">
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