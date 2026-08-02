'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasCart, setHasCart] = useState(false)

  useEffect(() => {
    // 1. Kiểm tra độ sâu cuộn trang
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    // 2. Kiểm tra xem giỏ hàng có sản phẩm hay không để tự nâng độ cao
    const checkCart = () => {
      const savedCart = localStorage.getItem('b2b_cart')
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart)
          setHasCart(parsed.length > 0)
        } catch (e) {
          setHasCart(false)
        }
      } else {
        setHasCart(false)
      }
    }

    checkCart()
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('storage', checkCart)
    const interval = setInterval(checkCart, 1000)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('storage', checkCart)
      clearInterval(interval)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!isVisible) return null

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-20 right-4 md:right-8 z-30 p-3 bg-slate-900/90 hover:bg-indigo-600 text-white rounded-2xl shadow-xl transition-all duration-300 backdrop-blur-xs cursor-pointer group border border-slate-700/80"
      aria-label="Cuộn lên đầu trang"
    >
      <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
    </button>
  )
}