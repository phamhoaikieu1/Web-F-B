'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Grid, ShoppingBag } from 'lucide-react'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const [cartCount, setCartCount] = useState(0)

  // Đừng hiển thị thanh này nếu đang ở trang Admin
  if (pathname.startsWith('/admin')) return null

  useEffect(() => {
    const updateCounts = () => {
      const savedCart = localStorage.getItem('b2b_cart')
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart)
          setCartCount(parsed.reduce((sum: number, i: any) => sum + i.quantity, 0))
        } catch (e) {}
      } else { setCartCount(0) }
    }

    updateCounts()
    window.addEventListener('storage', updateCounts)
    const interval = setInterval(updateCounts, 1000)

    return () => {
      window.removeEventListener('storage', updateCounts)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg">
      <div className="grid grid-cols-3 gap-1 text-center">
        
        {/* TRANG CHỦ */}
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
            pathname === '/' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Trang chủ</span>
        </Link>

        {/* SẢN PHẨM */}
        <Link 
          href="/products" 
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
            pathname.startsWith('/products') ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Sản phẩm</span>
        </Link>

        {/* GIỎ HÀNG */}
        <Link 
          href="/cart" 
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors relative ${
            pathname === '/cart' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-400 text-slate-900 font-black text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Giỏ hàng</span>
        </Link>

      </div>
    </div>
  )
}