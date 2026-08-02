'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, ChevronRight } from 'lucide-react'

interface StickyCartBarProps {
  cartCount: number
  cartTotal: number
  targetRef: React.RefObject<HTMLDivElement | null>
}

export default function StickyCartBar({ cartCount, cartTotal, targetRef }: StickyCartBarProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!targetRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Chỉ hiện khi khu vực danh sách sản phẩm xuất hiện trên viewport
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(targetRef.current)
    return () => observer.disconnect()
  }, [targetRef])

  if (cartCount === 0 || !isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 md:left-8 z-40 bg-slate-900/95 backdrop-blur-md text-white p-3 md:px-5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 border border-slate-700/80 animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-3">
        <div className="relative bg-emerald-600 p-2 rounded-xl">
          <ShoppingBag className="w-5 h-5 text-white" />
          <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-900 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
            {cartCount}
          </span>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-bold">Giỏ Hàng Đặt Sỉ</p>
          <p className="text-sm font-black text-emerald-400">{cartTotal.toLocaleString('vi-VN')} đ</p>
        </div>
      </div>

      <Link
        href="/cart"
        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shrink-0 flex items-center gap-1"
      >
        <span>Xem giỏ hàng</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  )
}