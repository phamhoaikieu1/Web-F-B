'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Product, Category } from '@/types/database'
import { Filter, ArrowUpDown, Heart, PackageCheck, ChevronRight, Home } from 'lucide-react'

function ProductsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 🎯 LẤY TRỰC TIẾP TỪ URL - KHÔNG QUA STATE TĨNH
  const selectedCategory = searchParams.get('category')
  const searchTerm = searchParams.get('search') || ''

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default')
  
  const [wishlist, setWishlist] = useState<string[]>([])
  const [addedItemKey, setAddedItemKey] = useState<string | null>(null)

  // 1. Fetch dữ liệu sản phẩm & danh mục từ Database
  useEffect(() => {
    async function fetchData() {
      const { data: catData } = await supabase.from('categories').select('*').order('display_order')
      const { data: prodData } = await supabase.from('products').select('*')
      if (catData) setCategories(catData)
      if (prodData) setProducts(prodData)
    }
    fetchData()

    const savedWishlist = localStorage.getItem('b2b_wishlist')
    if (savedWishlist) {
      try { setWishlist(JSON.parse(savedWishlist)) } catch (e) {}
    }
  }, [])

  // 2. Hàm chuyển danh mục bằng cách push URL chuẩn Next.js
  const handleSelectCategory = (catId: string | null) => {
    if (catId) {
      router.push(`/products?category=${catId}`)
    } else {
      router.push(`/products`)
    }
  }

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

  // 3. Lọc danh sách sản phẩm động theo URL params
  let filtered = products.filter((p) => {
    const matchCat = selectedCategory ? p.category_id === selectedCategory : true
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    return matchCat && matchSearch
  })

  if (sortBy === 'price-asc') {
    filtered.sort((a, b) => Number(a.price) - Number(b.price))
  } else if (sortBy === 'price-desc') {
    filtered.sort((a, b) => Number(b.price) - Number(a.price))
  } else if (sortBy === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name))
  }

  return (
    <main className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 bg-slate-50 min-h-screen">
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-blue-600 flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Trang chủ</Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="font-bold text-slate-800">Danh Mục Nguyên Liệu</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* BỘ LỌC BÊN TRÁI */}
        <aside className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6 sticky top-32">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" /> BỘ LỌC SẢN PHẨM
            </h2>
            {selectedCategory && (
              <button onClick={() => handleSelectCategory(null)} className="text-[11px] text-blue-600 hover:underline cursor-pointer">
                Xóa lọc
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">DANH MỤC SẢN PHẨM</label>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              <button
                onClick={() => handleSelectCategory(null)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  !selectedCategory ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                Tất cả ({products.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    selectedCategory === cat.id ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* DANH SÁCH SẢN PHẨM PHẢI */}
        <div className="lg:col-span-9 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
            <span className="text-slate-500">
              Hiển thị <strong className="text-slate-900">{filtered.length}</strong> nguyên liệu phù hợp
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600 font-medium">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:outline-none"
              >
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
                <option value="name">Tên A - Z</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => {
              const basePrice = Number(p.price) / p.conversion_rate
              const isLiked = wishlist.includes(p.id)

              return (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between relative group">
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="absolute top-3 right-3 z-10 p-2 bg-white/80 rounded-full shadow-xs text-slate-400 hover:text-red-500 cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
                  </button>

                  <Link href={`/products/${p.id}`} className="block space-y-3">
                    <div className="w-full h-40 bg-slate-50 rounded-xl flex items-center justify-center">
                      <PackageCheck className="w-10 h-10 text-slate-300 group-hover:scale-110 transition-transform" />
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
        </div>
      </div>
    </main>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Đang tải danh sách sản phẩm...</div>}>
      <ProductsContent />
    </Suspense>
  )
}