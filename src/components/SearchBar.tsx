'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X, PackageCheck } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { Product } from '@/types/database'

export default function SearchBar() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase.from('products').select('*')
      if (data) setAllProducts(data)
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.trim().length > 0) {
      const matched = allProducts.filter((p) =>
        p.name.toLowerCase().includes(value.toLowerCase()) ||
        p.sku.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5)
      setSuggestions(matched)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      setShowSuggestions(false)
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  const handleSelectProduct = (productId: string) => {
    setShowSuggestions(false)
    setSearchTerm('')
    router.push(`/products/${productId}`)
  }

  return (
    <div ref={searchRef} className="flex-1 max-w-2xl relative hidden md:block">
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          placeholder="Nhập nguyên liệu, siro, mứt... (Nhấn Enter để tìm)"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => searchTerm.trim() && setShowSuggestions(true)}
          className="w-full pl-4 pr-10 py-3 bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
        
        {searchTerm && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
            title="Xóa chữ"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* DROPDOWN ĐỀ XUẤT GỢI Ý */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          {suggestions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              <div className="p-2.5 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Gợi Ý Nguyên Liệu Phù Hợp ({suggestions.length})
              </div>
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectProduct(item.id)}
                  className="flex items-center gap-3 p-3 hover:bg-emerald-50/60 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <PackageCheck className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-slate-900 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-400">Quy cách: 1 {item.unit}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-600 block">
                      {Number(item.price).toLocaleString('vi-VN')} đ
                    </span>
                    <span className="text-[9px] text-slate-400 block font-mono">Giá sỉ</span>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="w-full text-center py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 bg-slate-50/50 block cursor-pointer transition-colors"
              >
                Xem tất cả kết quả cho "{searchTerm}" →
              </button>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-400">
              Không tìm thấy nguyên liệu phù hợp với "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}