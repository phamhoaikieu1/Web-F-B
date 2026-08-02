'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Product } from '@/types/database'
import { Heart, PackageCheck, Plus, Check, ArrowLeft, Trash2 } from 'lucide-react'

export default function WishlistPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [addedItemKey, setAddedItemKey] = useState<string | null>(null)

  useEffect(() => {
    const savedWishlist = localStorage.getItem('b2b_wishlist')
    if (savedWishlist) {
      try {
        const ids: string[] = JSON.parse(savedWishlist)
        setWishlistIds(ids)
        if (ids.length > 0) {
          supabase.from('products').select('*').in('id', ids).then(({ data }) => {
            if (data) setWishlistProducts(data)
          })
        }
      } catch (e) {}
    }
  }, [])

  const removeFromWishlist = (productId: string) => {
    const updatedIds = wishlistIds.filter((id) => id !== productId)
    setWishlistIds(updatedIds)
    setWishlistProducts(wishlistProducts.filter((p) => p.id !== productId))
    localStorage.setItem('b2b_wishlist', JSON.stringify(updatedIds))
    window.dispatchEvent(new Event('storage'))
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
    <main className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 bg-slate-50 min-h-[80vh]">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <Link href="/products" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quay lại xem tất cả nguyên liệu
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-7 h-7 text-red-500 fill-red-500" /> Danh Sách Nguyên Liệu Yêu Thích
          </h1>
        </div>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-400">Bạn chưa thả tim nguyên liệu nào.</p>
          <Link href="/products" className="inline-block bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md">
            Khám phá danh mục ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {wishlistProducts.map((p) => {
            const basePrice = Number(p.price) / p.conversion_rate
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between relative group">
                <button
                  onClick={() => removeFromWishlist(p.id)}
                  className="absolute top-3 right-3 z-10 p-2 bg-white/80 rounded-full shadow-xs text-slate-400 hover:text-red-600 cursor-pointer"
                  title="Xóa khỏi danh sách yêu thích"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <Link href={`/products/${p.id}`} className="block space-y-3">
                  <div className="w-full h-40 bg-slate-50 rounded-xl flex items-center justify-center">
                    <PackageCheck className="w-10 h-10 text-slate-300" />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">F&B INGREDIENT</span>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mt-1">{p.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Quy cách: 1 {p.unit} = {p.conversion_rate} {p.base_unit}</p>
                  </div>
                </Link>

                <div className="border-t border-slate-100 pt-3 space-y-2 mt-4">
                  <div className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-xl">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Sỉ ({p.unit}):</span>
                      <strong className="text-emerald-600 font-bold">{Number(p.price).toLocaleString('vi-VN')} đ</strong>
                    </div>
                    <button onClick={() => addToCart(p, 'UNIT')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
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
      )}
    </main>
  )
}