'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Store, ShoppingBag, Menu, X, ChevronRight, MessageSquare, Phone } from 'lucide-react'
import SearchBar from '@/components/SearchBar'
import { Category } from '@/types/database'

interface NavbarMobileProps {
  categories: Category[]
  cartCount: number
}

export default function NavbarMobile({
  categories,
  cartCount,
}: NavbarMobileProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [bannerIndex, setBannerIndex] = useState(0)

  const bannerMessages = [
    "🎉 Tổng kho nguyên liệu F&B giá sỉ - Cam kết chính hãng 100%",
    "📞 Hotline / Zalo B2B đặt hàng hỏa tốc: 0989.830.347"
  ]

  // Khóa cuộn trang web khi mở Drawer Menu
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % bannerMessages.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="md:hidden bg-white border-b border-slate-200 shadow-2xs relative">
      {/* 1. Top Banner slider mỏng - Tone Primary F&B Green #006838 */}
      <div className="bg-[#006838] text-white text-[10px] py-1 px-4 text-center overflow-hidden font-medium">
        <div className="h-4 flex items-center justify-center">
          <span className="animate-in fade-in duration-300 truncate">
            {bannerMessages[bannerIndex]}
          </span>
        </div>
      </div>

      {/* 2. Header Mobile */}
      <div className="px-3 py-2.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="p-1.5 hover:bg-emerald-50 rounded-xl text-slate-800 cursor-pointer shrink-0 border border-slate-200/60"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5 text-[#006838]" />
          </button>

          {/* Logo F&B Store */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-[#006838] p-1.5 rounded-xl text-white shadow-2xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-base tracking-tight text-slate-900 block leading-none">F&B STORE</span>
              <span className="text-[8px] font-bold text-[#006838] tracking-widest block uppercase mt-0.5">B2B Ingredient</span>
            </div>
          </Link>

          {/* Cụm Icon Phím Tắt Zalo + Giỏ Hàng */}
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href="https://zalo.me/0989830347"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 bg-emerald-50 text-[#006838] border border-emerald-200/80 rounded-xl font-bold text-[10px] flex items-center gap-1"
              title="Chat Zalo B2B"
            >
              <MessageSquare className="w-4 h-4 text-[#006838]" />
              <span className="hidden sm:inline font-bold">Zalo</span>
            </a>

            <Link href="/cart" className="p-2 text-slate-700 hover:text-[#006838] relative bg-slate-100/80 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 font-black text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Ô Tìm Kiếm Hàng Dưới Prominent Centered */}
        <div className="w-full">
          <SearchBar />
        </div>
      </div>

      {/* 3. Drawer Menu Slide-out Mobile */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex">
          <div className="bg-white w-[82%] max-w-xs h-full shadow-2xl p-5 flex flex-col justify-between animate-in slide-in-from-left duration-300 relative overflow-y-auto">
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b pb-3">
                <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2">
                  <div className="bg-[#006838] p-1.5 rounded-xl text-white">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-base text-slate-900 block leading-none">F&B STORE</span>
                    <span className="text-[8px] font-bold text-[#006838] tracking-widest block uppercase mt-0.5">B2B Ingredient</span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">Danh Mục Nguyên Liệu</p>
                <Link
                  href="/products"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 hover:bg-emerald-50 hover:text-[#006838] rounded-xl font-bold text-xs text-slate-800"
                >
                  <span>Tất Cả Nguyên Liệu F&B</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.id}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 hover:bg-emerald-50 hover:text-[#006838] rounded-xl font-medium text-xs text-slate-700"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>
                ))}
              </div>

              <div className="border-t pt-4 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">Giỏ Hàng Đặt Hàng</p>

                <Link
                  href="/cart"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-4 h-4 text-[#006838]" />
                    <span>Giỏ Hàng Đặt Sỉ</span>
                  </div>
                  {cartCount > 0 && (
                    <span className="bg-amber-400 text-slate-900 font-bold text-[9px] px-2 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2 mt-4">
              <a
                href="https://zalo.me/0989830347"
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#006838] hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>CHÁT ZALO B2B 24/7</span>
              </a>
              <a
                href="tel:0989830347"
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4 text-[#006838]" />
                <span>Hotline: 0989.830.347</span>
              </a>
            </div>
          </div>

          <div className="flex-1 cursor-pointer" onClick={() => setIsMenuOpen(false)} />
        </div>
      )}
    </header>
  )
}