'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Product, Category } from '@/types/database'
import { ArrowUpDown, ChevronRight, Home, Filter, X, CheckCircle2 } from 'lucide-react'

import FilterDrawer from './components/FilterDrawer'
import FilterAccordion from './components/FilterAccordion'
import PriceRangeFilter from './components/PriceRangeFilter'
import BrandFilter from './components/BrandFilter'
import ProductCard from './components/ProductCard'
import StickyCartBar from './components/StickyCartBar'
import Pagination from './components/Pagination'

const ITEMS_PER_PAGE = 24

function ProductsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productListRef = useRef<HTMLDivElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [maxDbPrice, setMaxDbPrice] = useState<number>(5000000)

  // PHÂN TRANG STATE
  const [currentPage, setCurrentPage] = useState<number>(1)

  // TOAST & CART STATS
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [cartCount, setCartCount] = useState<number>(0)
  const [cartTotal, setCartTotal] = useState<number>(0)

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>('sort')

  const selectedCategory = searchParams.get('category')
  const searchTerm = searchParams.get('search') || ''
  const sortBy = searchParams.get('sort') || 'default'
  const minPrice = Number(searchParams.get('minPrice')) || 0
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : maxDbPrice
  const selectedBrands = searchParams.get('brands') ? searchParams.get('brands')!.split(',') : []

  useEffect(() => {
    async function fetchData() {
      const { data: catData } = await supabase.from('categories').select('*').order('display_order')
      const { data: prodData } = await supabase.from('products').select('*')
      if (catData) setCategories(catData)
      if (prodData) {
        setProducts(prodData)
        const highest = Math.max(...prodData.map((p) => Number(p.price) || 0))
        if (highest > 0) setMaxDbPrice(highest)
      }
    }
    fetchData()

    const updateCartStats = () => {
      const savedCart = localStorage.getItem('b2b_cart')
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart)
          setCartCount(parsed.reduce((sum: number, i: any) => sum + i.quantity, 0))
          setCartTotal(parsed.reduce((sum: number, i: any) => sum + i.unitPrice * i.quantity, 0))
        } catch (e) {}
      } else {
        setCartCount(0)
        setCartTotal(0)
      }

      const savedWishlist = localStorage.getItem('b2b_wishlist')
      if (savedWishlist) {
        try { setWishlist(JSON.parse(savedWishlist)) } catch (e) {}
      }
    }

    updateCartStats()
    window.addEventListener('storage', updateCartStats)
    return () => window.removeEventListener('storage', updateCartStats)
  }, [])

  const updateQueryParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'default') params.delete(key)
      else params.set(key, value)
    })
    router.push(`/products?${params.toString()}`)
    setCurrentPage(1)
  }

  const availableBrands = ["Boduo", "Monin", "Torani", "Rich's", "Lộc Phát", "Osterberg", "Bensdorp", "EuroDeli"]
  const currentCategoryObj = categories.find((c) => c.id === selectedCategory)

  const toggleBrand = (brand: string) => {
    const nextBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand]
    updateQueryParams({ brands: nextBrands.length > 0 ? nextBrands.join(',') : null })
  }

  const handleResetFilters = () => router.push('/products')

  const hasSortChange = sortBy !== 'default'
  const hasCategoryChange = !!selectedCategory
  const hasPriceChange = minPrice > 0 || (searchParams.get('maxPrice') !== null && maxPrice < maxDbPrice)
  const hasBrandChange = selectedBrands.length > 0

  const totalOptionChanges = (hasSortChange ? 1 : 0) + (hasCategoryChange ? 1 : 0) + (hasPriceChange ? 1 : 0) + selectedBrands.length

  let filtered = products.filter((p) => {
    const matchCat = selectedCategory ? p.category_id === selectedCategory : true
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const priceVal = Number(p.price) || 0
    const matchPrice = priceVal >= minPrice && priceVal <= maxPrice
    const matchBrand = selectedBrands.length === 0 || selectedBrands.some((b) => p.name.toLowerCase().includes(b.toLowerCase()))
    return matchCat && matchSearch && matchPrice && matchBrand
  })

  if (sortBy === 'price-asc') filtered.sort((a, b) => Number(a.price) - Number(b.price))
  else if (sortBy === 'price-desc') filtered.sort((a, b) => Number(b.price) - Number(a.price))
  else if (sortBy === 'name-asc') filtered.sort((a, b) => a.name.localeCompare(b.name))
  else if (sortBy === 'name-desc') filtered.sort((a, b) => b.name.localeCompare(a.name))

  // PHÂN TRANG LOGIC CHUẨN
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedProducts = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // 🎯 TÍNH TOÁN CUỘN LÊN ĐẦU DANH SÁCH SẢN PHẨM CHUẨN XÁC KHI ĐỔI TRANG
  const handlePageChange = (page: number) => {
    setCurrentPage(page)

    if (productListRef.current) {
      const yOffset = -100 // Khoảng đệm trừ đi độ cao Header
      const element = productListRef.current
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset

      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const toggleWishlist = (productId: string) => {
    let updated = wishlist.includes(productId) ? wishlist.filter((id) => id !== productId) : [...wishlist, productId]
    setWishlist(updated)
    localStorage.setItem('b2b_wishlist', JSON.stringify(updated))
    window.dispatchEvent(new Event('storage'))
  }

  const addToCart = (product: Product, unitType: 'UNIT' | 'BASE') => {
    const isBase = unitType === 'BASE'
    const unitName = isBase ? product.base_unit : product.unit
    const price = isBase ? Number(product.price) / product.conversion_rate : Number(product.price)
    const cartKey = `${product.id}-${unitName}`

    const savedCart = localStorage.getItem('b2b_cart')
    let currentCart: any[] = []
    if (savedCart) { try { currentCart = JSON.parse(savedCart) } catch (e) {} }

    const existingIndex = currentCart.findIndex((i) => `${i.product.id}-${i.selectedUnit}` === cartKey)
    if (existingIndex > -1) currentCart[existingIndex].quantity += 1
    else currentCart.push({ product, selectedUnit: unitName, quantity: 1, unitPrice: price })

    localStorage.setItem('b2b_cart', JSON.stringify(currentCart))
    window.dispatchEvent(new Event('storage'))

    setToastMessage(`Đã thêm 1 x ${product.name} (${unitName})!`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <main className="p-3 md:p-8 max-w-[1600px] mx-auto space-y-4 md:space-y-5 bg-slate-50 min-h-screen relative pb-24">
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* BREADCRUMB */}
      <nav className="flex items-center flex-wrap gap-1.5 text-[11px] md:text-xs text-slate-500 py-1">
        <Link href="/" className="hover:text-emerald-600 flex items-center gap-1 font-medium"><Home className="w-3.5 h-3.5" /> Trang chủ</Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <Link href="/products" className={`hover:text-emerald-600 font-medium ${!selectedCategory ? 'text-slate-900 font-bold' : ''}`}>Danh Mục Nguyên Liệu</Link>
        {currentCategoryObj && (<><ChevronRight className="w-3 h-3 text-slate-300" /><span className="font-black text-emerald-600 uppercase">{currentCategoryObj.name}</span></>)}
      </nav>

      <div className="border-b border-slate-200 pb-2">
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">
          {currentCategoryObj ? currentCategoryObj.name : 'TẤT CẢ NGUYÊN LIỆU F&B'}
        </h1>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="grid grid-cols-2 md:flex md:items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs md:w-auto">
          <button type="button" onClick={() => { setOpenSection('category'); setIsFilterDrawerOpen(true); }} className="py-2.5 md:py-2 px-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-800 border-r border-slate-200 hover:bg-slate-50 cursor-pointer">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>TẤT CẢ BỘ LỌC</span>
            {totalOptionChanges > 0 && <span className="bg-red-600 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{totalOptionChanges}</span>}
          </button>
          <button type="button" onClick={() => { setOpenSection('sort'); setIsFilterDrawerOpen(true); }} className="py-2.5 md:py-2 px-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer">
            <ArrowUpDown className="w-4 h-4 text-emerald-600" />
            <span>SẮP XẾP</span>
            {hasSortChange && <span className="w-2 h-2 rounded-full bg-red-500" />}
          </button>
        </div>

        <div className="text-xs font-bold text-slate-500 md:text-right">{filtered.length} Nguyên liệu</div>
      </div>

      {/* FILTER PILLS */}
      {totalOptionChanges > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {selectedCategory && (
            <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 shrink-0">
              <span>{currentCategoryObj?.name}</span>
              <button onClick={() => updateQueryParams({ category: null })} className="ml-2 text-slate-400 hover:text-slate-800"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}
          {hasPriceChange && (
            <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 shrink-0">
              <span>Giá: {minPrice.toLocaleString('vi-VN')}đ - {maxPrice.toLocaleString('vi-VN')}đ</span>
              <button onClick={() => updateQueryParams({ minPrice: null, maxPrice: null })} className="ml-2 text-slate-400 hover:text-slate-800"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}
          {selectedBrands.map((brand) => (
            <div key={brand} className="flex items-center bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 shrink-0">
              <span>Hãng: {brand}</span>
              <button onClick={() => toggleBrand(brand)} className="ml-2 text-slate-400 hover:text-slate-800"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          <button onClick={handleResetFilters} className="text-xs font-bold text-slate-500 hover:text-red-600 underline shrink-0 ml-1 cursor-pointer">Xóa tất cả bộ lọc</button>
        </div>
      )}

      {/* LƯỚI SẢN PHẨM (GẮN TARGET REF ĐỂ TÍNH VỊ TRÍ CUỘN CHÍNH XÁC) */}
      <div ref={productListRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 pt-2">
        {paginatedProducts.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            isLiked={wishlist.includes(p.id)}
            onToggleWishlist={toggleWishlist}
            onAddToCart={addToCart}
          />
        ))}
      </div>

      {/* CỤM PHÂN TRANG */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={handlePageChange}
      />

      {/* STICKY CART BAR & NÚT SCROLL TO TOP KHÔNG BAO GIỜ BỊ ĐÈ MẤT */}
      <StickyCartBar cartCount={cartCount} cartTotal={cartTotal} targetRef={productListRef} />

      {/* DRAWER MODAL */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        totalChanges={totalOptionChanges}
        filteredCount={filtered.length}
        onClose={() => setIsFilterDrawerOpen(false)}
        onReset={handleResetFilters}
      >
        <FilterAccordion id="sort" title="Thứ Tự Sắp Xếp" hasChange={hasSortChange} isOpen={openSection === 'sort'} onToggle={(id) => setOpenSection(openSection === id ? null : id)}>
          <div className="space-y-2 pt-1">
            {[
              { id: 'default', label: 'Mặc định' },
              { id: 'newest', label: 'Hàng mới nhập về' },
              { id: 'bestseller', label: 'Bán chạy nhất cho chuỗi' },
              { id: 'price-asc', label: 'Giá sỉ: Thấp đến Cao' },
              { id: 'price-desc', label: 'Giá sỉ: Cao đến Thấp' },
              { id: 'name-asc', label: 'Tên nguyên liệu: A - Z' },
              { id: 'name-desc', label: 'Tên nguyên liệu: Z - A' },
            ].map((sort) => (
              <label key={sort.id} className="flex items-center gap-3 text-xs font-semibold text-slate-700 hover:text-emerald-600 cursor-pointer select-none">
                <input type="radio" name="sortByOption" checked={sortBy === sort.id} onChange={() => updateQueryParams({ sort: sort.id })} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                <span className={sortBy === sort.id ? 'text-emerald-600 font-bold' : ''}>{sort.label}</span>
              </label>
            ))}
          </div>
        </FilterAccordion>

        <FilterAccordion id="category" title="Danh Mục Sản Phẩm" hasChange={hasCategoryChange} isOpen={openSection === 'category'} onToggle={(id) => setOpenSection(openSection === id ? null : id)}>
          <div className="space-y-1">
            <button type="button" onClick={() => updateQueryParams({ category: null })} className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors ${!selectedCategory ? 'bg-emerald-600 text-white' : 'hover:bg-slate-50 text-slate-700'}`}>Tất cả ({products.length})</button>
            {categories.map((cat) => (
              <button key={cat.id} type="button" onClick={() => updateQueryParams({ category: cat.id })} className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors ${selectedCategory === cat.id ? 'bg-emerald-600 text-white' : 'hover:bg-slate-50 text-slate-700'}`}>{cat.name}</button>
            ))}
          </div>
        </FilterAccordion>

        <FilterAccordion id="price" title="Khoảng Giá Đặt Sỉ" hasChange={hasPriceChange} isOpen={openSection === 'price'} onToggle={(id) => setOpenSection(openSection === id ? null : id)}>
          <PriceRangeFilter minPrice={minPrice} maxPrice={maxPrice} absoluteMax={maxDbPrice} onPriceChange={(min, max) => updateQueryParams({ minPrice: min > 0 ? String(min) : null, maxPrice: max < maxDbPrice ? String(max) : null })} />
        </FilterAccordion>

        <FilterAccordion id="brand" title="Thương Hiệu Sản Xuất" hasChange={hasBrandChange} isOpen={openSection === 'brand'} onToggle={(id) => setOpenSection(openSection === id ? null : id)}>
          <BrandFilter brands={availableBrands} selectedBrands={selectedBrands} onToggleBrand={toggleBrand} />
        </FilterAccordion>
      </FilterDrawer>
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