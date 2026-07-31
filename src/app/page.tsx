'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Product, Category } from '@/types/database'
import { 
  ArrowRight, ShieldCheck, Truck, Clock, Sparkles, PackageCheck, 
  Heart, ChevronLeft, ChevronRight, Store, Award, PhoneCall 
} from 'lucide-react'

export default function HomePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [categories, setCategories] = useState<Category[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)

  // BỘ 3 SLIDE TRUYỀN THÔNG HERO BANNER B2B
  const slides = [
    {
      id: 1,
      badge: 'GIẢI PHÁP NGUYÊN LIỆU F&B GIÁ SỈ',
      title: 'TỔNG KHO PHÂN PHỐI NGUYÊN LIỆU PHA CHẾ B2B',
      desc: 'Cung cấp nguyên liệu chính hãng giá sỉ tận gốc cho Chuỗi Trà Sữa, Cafe & Bánh Ngọt. Chốt đơn trực tiếp qua Zalo Doanh Nghiệp nhanh chóng.',
      btnText: 'XEM TẤT CẢ NGUYÊN LIỆU',
      btnLink: '/products',
      icon: <Store className="w-4 h-4 text-emerald-400" />,
      bgGradient: 'from-slate-900 via-slate-800 to-emerald-950'
    },
    {
      id: 2,
      badge: 'ƯU ĐÃI ĐẶC BIỆT CHO CHUỖI QUÁN',
      title: 'CHÍNH SÁCH GIÁ SỈ THEO THÙNG & CHIẾT KHẤU TỐT NHẤT',
      desc: 'Chiết khấu hấp dẫn theo giá trị đơn hàng. Nguồn hàng ổn định, đầy đủ giấy chứng nhận ATVSTP & hóa đơn VAT cho chủ doanh nghiệp.',
      btnText: 'NHẬN BÁO GIÁ SỈ THEO THÙNG',
      btnLink: '/products?sort=bestseller',
      icon: <Award className="w-4 h-4 text-amber-400" />,
      bgGradient: 'from-slate-900 via-emerald-950 to-slate-900'
    },
    {
      id: 3,
      badge: 'GIAO HÀNG HỎA TỐC TOÀN QUỐC',
      title: 'ĐỒNG HÀNH CÙNG HƠN 1.000+ QUÁN MỞ MỚI',
      desc: 'Giao hàng hỏa tốc trong ngày tại Hà Nội & TP.HCM. Hỗ trợ gửi chành xe toàn quốc, cam kết không đứt hàng trong mùa cao điểm.',
      btnText: 'TƯ VẤN ZALO HỎA TỐC',
      btnLink: 'https://zalo.me/0989830347',
      icon: <PhoneCall className="w-4 h-4 text-cyan-400" />,
      bgGradient: 'from-slate-900 via-slate-900 to-teal-950'
    }
  ]

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

    // Tự động chuyển slide Hero Banner 5 giây / lần
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  const toggleWishlist = (productId: string) => {
    let updated: string[]
    if (wishlist.includes(productId)) {
      updated = wishlist.filter((id) => id !== productId)
    } else {
      updated = [...wishlist, productId]
    }
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
  }

  return (
    <main className="space-y-12 pb-16 bg-slate-50 min-h-screen">
      
      {/* 1. HERO SLIDER BANNER B2B (3 SLIDES TỰ ĐỘNG CHUYỂN) */}
      <section className="relative overflow-hidden bg-slate-900 text-white min-h-[380px] md:min-h-[440px] flex items-center">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out bg-gradient-to-r ${slide.bgGradient} flex items-center justify-center px-6 md:px-12 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <div className="max-w-[1600px] w-full mx-auto py-10 md:py-16 space-y-4 md:space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] md:text-xs font-bold text-emerald-300">
                {slide.icon}
                <span>{slide.badge}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight max-w-4xl uppercase">
                {slide.title}
              </h1>

              {/* Description */}
              <p className="text-xs md:text-base text-slate-300 max-w-2xl leading-relaxed">
                {slide.desc}
              </p>

              {/* CTA Button */}
              <div className="pt-2">
                {slide.btnLink.startsWith('http') ? (
                  <a
                    href={slide.btnLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3.5 rounded-2xl text-xs md:text-sm shadow-xl transition-all cursor-pointer"
                  >
                    <span>{slide.btnText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <Link
                    href={slide.btnLink}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3.5 rounded-2xl text-xs md:text-sm shadow-xl transition-all cursor-pointer"
                  >
                    <span>{slide.btnText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Nút Prev / Next Slider */}
        <button
          onClick={prevSlide}
          className="absolute left-2 md:left-6 z-20 p-2.5 bg-black/30 hover:bg-emerald-600 text-white rounded-full backdrop-blur-md transition-colors cursor-pointer"
          aria-label="Slide trước"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 md:right-6 z-20 p-2.5 bg-black/30 hover:bg-emerald-600 text-white rounded-full backdrop-blur-md transition-colors cursor-pointer"
          aria-label="Slide sau"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots Chỉ Số Slide */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentSlide ? 'w-8 bg-emerald-500' : 'w-2 bg-white/40 hover:bg-white'
              }`}
              aria-label={`Chuyển tới slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. CAM KẾT DỊCH VỤ */}
      <section className="max-w-[1600px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><ShieldCheck className="w-6 h-6" /></div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Chính Hãng 100%</h3>
              <p className="text-xs text-slate-400">Đầy đủ chứng từ ATVSTP</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl"><Truck className="w-6 h-6" /></div>
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

      {/* 3. SẢN PHẨM NỔI BẬT NGUYÊN LIỆU (TỪ SUPABASE) */}
      <section className="max-w-[1600px] mx-auto px-6 space-y-6">
        <div className="flex justify-between items-end border-b pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Sản Phẩm Bán Chạy Cho Chuỗi Quán</h2>
            <p className="text-xs text-slate-500 mt-1">Các dòng nguyên liệu trà, siro, bột pha chế bán chạy nhất tháng</p>
          </div>
          <Link href="/products" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
            Xem tất cả ({featuredProducts.length}+ món) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {featuredProducts.map((p) => {
            const basePrice = Number(p.price) / p.conversion_rate
            const isLiked = wishlist.includes(p.id)

            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200/80 p-3 md:p-4 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between relative group">
                <button
                  type="button"
                  onClick={() => toggleWishlist(p.id)}
                  className="absolute top-2 right-2 md:top-3 md:right-3 z-10 p-1.5 bg-white/90 rounded-full shadow-xs text-slate-400 hover:text-red-500 cursor-pointer"
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
                </button>

                <Link href={`/products/${p.id}`} className="block space-y-2 md:space-y-3">
                  <div className="w-full h-32 md:h-44 bg-slate-50 rounded-xl flex items-center justify-center">
                    <PackageCheck className="w-8 h-8 md:w-12 md:h-12 text-slate-300 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <span className="text-[9px] md:text-[10px] font-bold text-emerald-600 uppercase">F&B INGREDIENT</span>
                    <h3 className="font-bold text-slate-900 text-xs md:text-sm line-clamp-2 mt-0.5 group-hover:text-emerald-600">{p.name}</h3>
                    <p className="text-[10px] md:text-[11px] text-slate-400 mt-0.5">Quy cách: 1 {p.unit} = {p.conversion_rate} {p.base_unit}</p>
                  </div>
                </Link>

                <div className="border-t border-slate-100 pt-2 md:pt-3 space-y-1.5 md:space-y-2 mt-3">
                  <div className="flex justify-between items-center text-[11px] md:text-xs bg-slate-50 p-1.5 md:p-2 rounded-xl">
                    <div className="min-w-0 pr-1">
                      <span className="text-[9px] text-slate-500 block truncate">Sỉ ({p.unit}):</span>
                      <strong className="text-emerald-600 font-bold block truncate">{Number(p.price).toLocaleString('vi-VN')} đ</strong>
                    </div>
                    <button onClick={() => addToCart(p, 'UNIT')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold cursor-pointer shrink-0">
                      + Sỉ
                    </button>
                  </div>

                  <div className="flex justify-between items-center text-[11px] md:text-xs bg-slate-50 p-1.5 md:p-2 rounded-xl">
                    <div className="min-w-0 pr-1">
                      <span className="text-[9px] text-slate-500 block truncate">Lẻ ({p.base_unit}):</span>
                      <strong className="text-emerald-600 font-bold block truncate">{Math.round(basePrice).toLocaleString('vi-VN')} đ</strong>
                    </div>
                    <button onClick={() => addToCart(p, 'BASE')} className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold cursor-pointer shrink-0">
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