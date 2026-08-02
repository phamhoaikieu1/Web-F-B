'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Product } from '@/types/database'
import { ShoppingBag, ArrowLeft, ShieldCheck, Truck, Package, Plus, Minus, Check, Eye, PackageCheck } from 'lucide-react'

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [product, setProduct] = useState<Product | null>(null)
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])
  const [selectedUnitType, setSelectedUnitType] = useState<'UNIT' | 'BASE'>('UNIT')
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase.from('products').select('*').eq('id', productId).single()
      if (data) {
        setProduct(data)

        // Ghi nhận sản phẩm vào danh sách Đã Xem Gần Đây (Recently Viewed)
        const savedRecent = localStorage.getItem('b2b_recently_viewed')
        let recentList: Product[] = []
        if (savedRecent) {
          try { recentList = JSON.parse(savedRecent) } catch (e) {}
        }
        const filtered = recentList.filter((p) => p.id !== data.id)
        const updatedRecent = [data, ...filtered].slice(0, 6)
        setRecentlyViewed(updatedRecent)
        localStorage.setItem('b2b_recently_viewed', JSON.stringify(updatedRecent))
      }
    }
    if (productId) fetchProduct()
  }, [productId])

  if (!product) {
    return (
      <main className="p-12 text-center text-slate-400 text-xs">
        Đang tải thông tin nguyên liệu...
      </main>
    )
  }

  const isBase = selectedUnitType === 'BASE'
  const currentUnitName = isBase ? product.base_unit : product.unit
  const currentUnitPrice = isBase ? Number(product.price) / product.conversion_rate : Number(product.price)
  const totalPrice = currentUnitPrice * quantity

  const handleAddToCart = () => {
    const cartKey = `${product.id}-${currentUnitName}`
    const savedCart = localStorage.getItem('b2b_cart')
    let currentCart: any[] = []
    if (savedCart) {
      try { currentCart = JSON.parse(savedCart) } catch (e) {}
    }

    const existingIndex = currentCart.findIndex((i) => `${i.product.id}-${i.selectedUnit}` === cartKey)
    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += quantity
    } else {
      currentCart.push({ product, selectedUnit: currentUnitName, quantity, unitPrice: currentUnitPrice })
    }

    localStorage.setItem('b2b_cart', JSON.stringify(currentCart))
    window.dispatchEvent(new Event('storage'))

    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1500)
  }

  return (
    <main className="p-4 md:p-8 max-w-[1200px] mx-auto space-y-8 bg-slate-50 min-h-screen">
      <Link href="/products" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách sản phẩm
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-2xs grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 bg-slate-100 rounded-2xl h-80 flex items-center justify-center p-8">
          <Package className="w-24 h-24 text-slate-300" />
        </div>

        <div className="md:col-span-7 space-y-6">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
              NGUYÊN LIỆU PHẠM VI B2B
            </span>
            <h1 className="text-2xl font-black text-slate-900">{product.name}</h1>
            <p className="text-xs text-slate-400 mt-1">Tỷ lệ quy đổi: 1 {product.unit} = {product.conversion_rate} {product.base_unit}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <span className="text-xs font-bold text-slate-700 block">Chọn quy cách đặt hàng:</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedUnitType('UNIT')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  !isBase ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-bold' : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <span className="text-xs block font-semibold">MUA SỈ ({product.unit})</span>
                <strong className="text-sm text-emerald-600 block mt-1">{Number(product.price).toLocaleString('vi-VN')} đ</strong>
              </button>

              <button
                type="button"
                onClick={() => setSelectedUnitType('BASE')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isBase ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-bold' : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <span className="text-xs block font-semibold">MUA LẺ ({product.base_unit})</span>
                <strong className="text-sm text-emerald-600 block mt-1">{Math.round(Number(product.price) / product.conversion_rate).toLocaleString('vi-VN')} đ</strong>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-white rounded-lg text-slate-600 cursor-pointer">
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-sm w-12 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-white rounded-lg text-slate-600 cursor-pointer">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="text-right flex-1">
              <span className="text-xs text-slate-400 block">Thành tiền tạm tính:</span>
              <span className="text-xl font-black text-emerald-600">{Math.round(totalPrice).toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className={`w-full py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
              isAdded ? 'bg-emerald-600 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isAdded ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
            <span>{isAdded ? 'ĐÃ THÊM VÀO GIỎ HÀNG!' : 'THÊM VÀO GIỎ HÀNG B2B'}</span>
          </button>

          <div className="grid grid-cols-2 gap-4 pt-2 text-xs text-slate-500 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Cam kết hàng chính hãng 100%
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-500" /> Giao hàng nhanh toàn quốc
            </div>
          </div>
        </div>
      </div>

      {/* 👁️ MỤC SẢN PHẨM ĐÃ XEM GẦN ĐÂY */}
      {recentlyViewed.length > 1 && (
        <section className="pt-8 border-t border-slate-200 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
            <Eye className="w-4 h-4 text-emerald-600" /> Nguyên Liệu Bạn Đã Xem Gần Đây
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {recentlyViewed.filter(p => p.id !== product.id).map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="bg-white p-3 rounded-2xl border border-slate-200 text-xs space-y-1.5 hover:border-emerald-500 transition-colors block">
                <div className="w-full h-20 bg-slate-50 rounded-xl flex items-center justify-center">
                  <PackageCheck className="w-6 h-6 text-slate-300" />
                </div>
                <p className="font-bold text-slate-900 truncate">{p.name}</p>
                <p className="text-emerald-600 font-bold text-[11px]">{Number(p.price).toLocaleString('vi-VN')} đ / {p.unit}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}