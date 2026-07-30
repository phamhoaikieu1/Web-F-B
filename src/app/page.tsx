'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Product, Category } from '@/types/database'
import { ArrowRight, ShieldCheck, Truck, Clock, Sparkles, PackageCheck, Plus, Check, Heart } from 'lucide-react'

export default function HomePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [categories, setCategories] = useState<Category[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [addedItemKey, setAddedItemKey] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const { data: catData } = await supabase.from('categories').select('*').order('display_order')
      const { data: prodData } = await supabase.from('products').select('*').limit(8)
      if (catData) setCategories(catData)
      if (prodData) setFeaturedProducts(prodData)
    }
    fetchData()

    const savedWishlist = localStorage.getItem('b2b_wishlist')
    if (savedWishlist) {
      try { setWishlist(JSON.parse(savedWishlist)) } catch (e) {}
    }
  }, [])

  const toggleWishlist = (productId: string) => {
    let updated: string[]
    if (wishlist.includes(productId)) {
      updated = wishlist.filter((id) => id !== productId)
    } else {
      updated = [...wishlist, productId]
    }
    setWishlist(updated)
    localStorage.setItem('b2b_wishlist', JSON.stringify(updated))
  }

  const addToCart = (product: Product, unitType: 'UNIT' | 'BASE') => {
    const isBase = unitType === 'BASE'
    const unitName = isBase ? product.base_unit : product.unit
    const price = isBase ? Number(product.price) / product.conversion_rate : Number(product.price)
    const cartKey = `${product.id}-${unitName}`

    const savedCart = localStorage.getItem('b2b_cart')
    let currentCart: any[] = []
    if (savedCart) {
      try { currentCart = JSON.parse(savedCart) } catch (e) {}
    }

    const existingIndex = currentCart.findIndex((i) => `${i.product.id}-${i.selectedUnit}` === cartKey)
    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += 1
    } else {
      currentCart.push({ product, selectedUnit: unitName, quantity: 1, unitPrice: price })
    }

    localStorage.setItem('b2b_cart', JSON.stringify(currentCart))
    window.dispatchEvent(new Event('storage'))

    setAddedItemKey(cartKey)
    setTimeout(() => setAddedItemKey(null), 1000)
  }

  return (
    <main className="space-y-12 pb-16 bg-slate-50 min-h-screen">
      {/* 1. HERO BANNER B2B */}
      <section className="bg-slate-900 text-white py-16 px-6 relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-2 bg-blue-600/30 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Giải Pháp Nguyên Liệu F&B Giá Sỉ
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              TỔNG KHO PHÂN PHỐI NGUYÊN LIỆU PHA CHẾ B2B
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-xl">
              Cung cấp nguyên liệu chính hãng giá sỉ tận gốc cho Chuỗi Trà Sữa, Cafe & Bánh Ngọt. Chốt đơn trực tiếp qua Zalo Doanh Nghiệp nhanh chóng.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/products"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                <span>XEM TẤT CẢ NGUYÊN LIỆU</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CAM KẾT DỊCH VỤ */}
      <section className="max-w-[1600px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><ShieldCheck className="w-6 h-6" /></div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Chính Hãng 100%</h3>
              <p className="text-xs text-slate-400">Đầy đủ chứng từ ATVSTP</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Truck className="w-6 h-6" /></div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Giao Hàng Hỏa Tốc</h3>
              <p className="text-xs text-slate-400">Đáp ứng đợt giao gấp của quán</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Clock className="w-6 h-6" /></div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Chốt Đơn Zalo 24/7</h3>
              <p className="text-xs text-slate-400">Tự động báo giá sỉ & lẻ linh hoạt</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SẢN PHẨM NỔI BẬT NGUYÊN LIỆU */}
      <section className="max-w-[1600px] mx-auto px-6 space-y-6">
        <div className="flex justify-between items-end border-b pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Sản Phẩm Bán Chạy Cho Chuỗi Quán</h2>
            <p className="text-xs text-slate-500 mt-1">Các dòng nguyên liệu trà, siro, bột pha chế bán chạy nhất tháng</p>
          </div>
          <Link href="/products" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            Xem tất cả ({featuredProducts.length}+ món) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredProducts.map((p) => {
            const basePrice = Number(p.price) / p.conversion_rate
            const unitCartKey = `${p.id}-${p.unit}`
            const baseCartKey = `${p.id}-${p.base_unit}`
            const isLiked = wishlist.includes(p.id)

            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between relative group">
                <button
                  onClick={() => toggleWishlist(p.id)}
                  className="absolute top-3 right-3 z-10 p-2 bg-white/80 rounded-full shadow-xs text-slate-400 hover:text-red-500 cursor-pointer"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
                </button>

                <Link href={`/products/${p.id}`} className="block space-y-3">
                  <div className="w-full h-44 bg-slate-50 rounded-xl flex items-center justify-center">
                    <PackageCheck className="w-12 h-12 text-slate-300 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase">F&B INGREDIENT</span>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mt-1 group-hover:text-blue-600">{p.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Quy cách: 1 {p.unit} = {p.conversion_rate} {p.base_unit}</p>
                  </div>
                </Link>

                <div className="border-t border-slate-100 pt-3 space-y-2 mt-4">
                  <div className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-xl">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Sỉ ({p.unit}):</span>
                      <strong className="text-emerald-600 font-bold">{Number(p.price).toLocaleString('vi-VN')} đ</strong>
                    </div>
                    <button onClick={() => addToCart(p, 'UNIT')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
                      + Sỉ
                    </button>
                  </div>

                  <div className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-xl">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Lẻ ({p.base_unit}):</span>
                      <strong className="text-emerald-600 font-bold">{Math.round(basePrice).toLocaleString('vi-VN')} đ</strong>
                    </div>
                    <button onClick={() => addToCart(p, 'BASE')} className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
                      + Lẻ
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}