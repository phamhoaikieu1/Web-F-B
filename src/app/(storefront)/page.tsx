'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Product, Category } from '@/types/database'
import { 
  ArrowRight, ShieldCheck, Truck, Clock, PackageCheck, 
  ChevronLeft, ChevronRight, Store, Award, PhoneCall, Sparkles, CheckCircle2
} from 'lucide-react'
import { getB2BUnitPrice } from '@/lib/pricing'

export default function HomePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [, setCategories] = useState<Category[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)

  // BỘ 3 SLIDE TRUYỀN THÔNG HERO BANNER B2B VỚI HÌNH ẢNH NGUYÊN LIỆU F&B
  const slides = [
    {
      id: 1,
      badge: 'GIẢI PHÁP NGUYÊN LIỆU F&B GIÁ SỈ TẬN GỐC',
      title: 'TỔNG KHO NGUYÊN LIỆU PHA CHẾ B2B HÀ NỘI & TP.HCM',
      desc: 'Cung cấp siro, mứt, trà, bột pha chế chính hãng cho Chuỗi Trà Sữa, Cafe & Bánh Ngọt. Chốt đơn nhanh qua Zalo Doanh Nghiệp.',
      btnText: 'XEM TẤT CẢ NGUYÊN LIỆU',
      btnLink: '/products',
      icon: <Store className="w-4 h-4 text-emerald-400" />,
      bgImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1600&auto=format&fit=crop'
    },
    {
      id: 2,
      badge: 'ƯU ĐÃI ĐẶC BIỆT DÀNH CHO CHUỖI QUÁN',
      title: 'CHÍNH SÁCH GIÁ SỈ THEO THÙNG & CHIẾT KHẤU CAO',
      desc: 'Chiết khấu hấp dẫn theo số lượng thùng. Nguồn hàng ổn định 100%, đầy đủ giấy chứng nhận ATVSTP & xuất hóa đơn VAT.',
      btnText: 'NHẬN BÁO GIÁ SỈ THEO THÙNG',
      btnLink: '/products?sort=bestseller',
      icon: <Award className="w-4 h-4 text-amber-400" />,
      bgImage: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1600&auto=format&fit=crop'
    },
    {
      id: 3,
      badge: 'GIAO HÀNG HỎA TỐC & VẬN CHUYỂN CHÀNH XE',
      title: 'ĐỒNG HÀNH CÙNG HƠN 1.000+ QUÁN VẬN HÀNH THÀNH CÔNG',
      desc: 'Giao hàng hỏa tốc trong ngày tại Hà Nội & TP.HCM. Hỗ trợ gửi chành xe đi tỉnh toàn quốc, đảm bảo không đứt hàng mùa cao điểm.',
      btnText: 'TƯ VẤN ZALO HỎA TỐC 24/7',
      btnLink: 'https://zalo.me/0989830347',
      icon: <PhoneCall className="w-4 h-4 text-cyan-400" />,
      bgImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1600&auto=format&fit=crop'
    }
  ]

  // DANH SÁCH 8 THƯƠNG HIỆU F&B UY TÍN (BRAND AUTHORITY GRID)
  const brandGrid = [
    { name: 'Monin', desc: 'Siro & Sốt Pha Chế Pháp', tag: 'Chính Hãng', borderHover: 'hover:border-[#82C341]' },
    { name: 'Boduo', desc: 'Siro & Trà Sữa Chuyên Nghiệp', tag: 'Bán Chạy', borderHover: 'hover:border-emerald-400' },
    { name: "Rich's", desc: 'Kem Béo Thực Vật & Kem Pha Chế', tag: 'Top 1 Quán', borderHover: 'hover:border-[#82C341]' },
    { name: 'Onefood', desc: 'Bột Pha Chế & Trà Cao Cấp', tag: 'Giá Sỉ Tốt', borderHover: 'hover:border-emerald-400' },
    { name: 'Osterberg', desc: 'Mứt Sinh Tố Đan Mạch', tag: 'Đậm Vị Trái Cây', borderHover: 'hover:border-[#82C341]' },
    { name: 'Golden Farm', desc: 'Mứt, Siro & Sốt Trái Cây', tag: 'Phổ Biến', borderHover: 'hover:border-emerald-400' },
    { name: 'Lộc Phát', desc: 'Trà Đen & Trà Oolong Chuyên Quán', tag: 'Hương Vị Chuẩn', borderHover: 'hover:border-[#82C341]' },
    { name: 'Torani', desc: 'Siro Cà Phê & Soda Chuẩn Mỹ', tag: 'Nhập Khẩu Mỹ', borderHover: 'hover:border-emerald-400' }
  ]

  useEffect(() => {
    async function fetchData() {
      const { data: catData } = await supabase.from('categories').select('*').order('display_order')
      const { data: prodData } = await supabase.from('products').select('*').limit(8)
      if (catData) setCategories(catData)
      if (prodData) setFeaturedProducts(prodData)
    }
    fetchData()

    // Tự động chuyển slide Hero Banner 5 giây / lần
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  // TOUCH SWIPE GESTURE HANDLERS CHO MOBILE
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
  }

  const addToCart = (product: Product, unitType: 'UNIT' | 'BASE') => {
    const isBase = unitType === 'BASE'
    const addQty = isBase ? 1 : Math.max(1, product.conversion_rate || 1)

    const savedCart = localStorage.getItem('b2b_cart')
    let currentCart: any[] = []
    if (savedCart) {
      try { currentCart = JSON.parse(savedCart) } catch (e) {}
    }

    const existingIndex = currentCart.findIndex((i) => i.product.id === product.id)
    let newQty = addQty
    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += addQty
      newQty = currentCart[existingIndex].quantity
      currentCart[existingIndex].product = product
      currentCart[existingIndex].unitPrice = getB2BUnitPrice(product, newQty)
    } else {
      currentCart.push({ product, quantity: addQty, unitPrice: getB2BUnitPrice(product, addQty) })
    }

    localStorage.setItem('b2b_cart', JSON.stringify(currentCart))
    window.dispatchEvent(new Event('storage'))
  }

  return (
    <main className="space-y-12 pb-16 bg-slate-50 min-h-screen">
      
      {/* SECTION 1: HERO SLIDER BANNER B2B (TOUCH SWIPE MOBILE + OVERLAY DARK/EMERALD GRADIENT) */}
      <section 
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative overflow-hidden bg-slate-950 text-white min-h-[380px] md:min-h-[460px] flex items-center shadow-lg select-none"
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center justify-center ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Hình nền F&B với Fallback & Overlay Gradient tối ưu tương phản */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
              style={{ backgroundImage: `url(${slide.bgImage})` }}
            />
            {/* Gradient Overlay từ Slate-950 qua Emerald-950 giữ độ rõ chữ */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-emerald-950/90 to-slate-950/85" />

            <div className="relative max-w-[1600px] w-full mx-auto px-6 md:px-12 py-10 md:py-16 space-y-4 md:space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] md:text-xs font-bold text-emerald-300 shadow-xs">
                {slide.icon}
                <span>{slide.badge}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight max-w-4xl uppercase text-white drop-shadow-md">
                {slide.title}
              </h1>

              {/* Description */}
              <p className="text-xs md:text-base text-slate-200 max-w-2xl leading-relaxed font-normal">
                {slide.desc}
              </p>

              {/* CTA Button */}
              <div className="pt-2">
                {slide.btnLink.startsWith('http') ? (
                  <a
                    href={slide.btnLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-[#006838] hover:bg-emerald-700 text-white font-black px-6 py-3.5 rounded-2xl text-xs md:text-sm shadow-xl transition-all cursor-pointer border border-emerald-400/30 active:scale-95"
                  >
                    <span>{slide.btnText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <Link
                    href={slide.btnLink}
                    className="inline-flex items-center gap-2 bg-[#006838] hover:bg-emerald-700 text-white font-black px-6 py-3.5 rounded-2xl text-xs md:text-sm shadow-xl transition-all cursor-pointer border border-emerald-400/30 active:scale-95"
                  >
                    <span>{slide.btnText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Nút Prev / Next Slider (ẨN TRÊN MOBILE hidden md:flex CẤM CHE CHỮ VÀ ẢNH) */}
        <button
          onClick={prevSlide}
          className="hidden md:flex absolute left-6 z-20 p-3 bg-black/40 hover:bg-[#006838] text-white rounded-full backdrop-blur-md transition-colors cursor-pointer border border-white/10"
          aria-label="Slide trước"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="hidden md:flex absolute right-6 z-20 p-3 bg-black/40 hover:bg-[#006838] text-white rounded-full backdrop-blur-md transition-colors cursor-pointer border border-white/10"
          aria-label="Slide sau"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots Chỉ Số Slide ở bottom-3 với tone màu #82C341 */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentSlide ? 'w-8 bg-[#82C341]' : 'w-2 bg-white/40 hover:bg-white'
              }`}
              aria-label={`Chuyển tới slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* SECTION 2: BỘ 3 CAM KẾT DỊCH VỤ B2B (ĐẶT NGAY DƯỚI HERO BANNER) */}
      <section className="max-w-[1600px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 bg-white p-5 md:p-6 rounded-3xl border border-emerald-100 shadow-sm">
          {/* Cam kết 1 */}
          <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-emerald-50/50 transition-colors">
            <div className="p-3.5 bg-emerald-100/80 text-[#006838] rounded-2xl shrink-0 shadow-2xs">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm md:text-base flex items-center gap-1.5">
                🚚 Giao Hỏa Tốc Trong Ngày
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Đáp ứng đơn hàng gấp cho quán tại HN & TP.HCM, gửi chành xe toàn quốc.
              </p>
            </div>
          </div>

          {/* Cam kết 2 */}
          <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-emerald-50/50 transition-colors">
            <div className="p-3.5 bg-amber-100/80 text-amber-800 rounded-2xl shrink-0 shadow-2xs">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm md:text-base flex items-center gap-1.5">
                🏷️ Bảng Giá Sỉ Tận Gốc
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Giá sỉ cực tốt theo Thùng/Chai, chiết khấu cao cho chủ chuỗi quán.
              </p>
            </div>
          </div>

          {/* Cam kết 3 */}
          <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-emerald-50/50 transition-colors">
            <div className="p-3.5 bg-cyan-100/80 text-cyan-800 rounded-2xl shrink-0 shadow-2xs">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm md:text-base flex items-center gap-1.5">
                📞 Hỗ Trợ Zalo B2B 24/7
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Báo giá tự động, chốt đơn siêu tốc qua Zalo Doanh Nghiệp hotline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THƯƠNG HIỆU UY TÍN (BRAND AUTHORITY GRID - 8 THƯƠNG HIỆU HÀNG ĐẦU F&B) */}
      <section className="max-w-[1600px] mx-auto px-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-200/80 pb-4 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#006838] bg-emerald-100/70 px-2.5 py-1 rounded-full mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ĐỐI TÁC THƯƠNG HIỆU CHÍNH HÃNG</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">
              Thương Hiệu Nguyên Liệu Hàng Đầu
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân phối trực tiếp các nhãn hàng siro, mứt, trà & bột pha chế danh tiếng cho quán
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">Cam kết 100% xuất xứ rõ ràng</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
          {brandGrid.map((brand, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-2xl p-3.5 text-center border border-slate-200/80 shadow-2xs hover:shadow-md ${brand.borderHover} transition-all duration-200 group cursor-pointer flex flex-col justify-between items-center`}
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50/80 text-[#006838] flex items-center justify-center font-black text-base group-hover:scale-110 transition-transform mb-2 border border-emerald-100">
                {brand.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 text-xs group-hover:text-[#006838] transition-colors">
                  {brand.name}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-1 leading-tight">
                  {brand.desc}
                </p>
              </div>
              <span className="mt-2 text-[9px] font-bold text-[#006838] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 inline-flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                {brand.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: SẢN PHẨM NỔI BẬT NGUYÊN LIỆU (SUPABASE FETCH + BR-01 PRICING + ADD TO CART) */}
      <section className="max-w-[1600px] mx-auto px-6 space-y-6">
        <div className="flex justify-between items-end border-b border-slate-200/80 pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">
              Sản Phẩm Bán Chạy Cho Chuỗi Quán
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Các dòng nguyên liệu trà, siro, bột pha chế bán chạy nhất được chốt đơn nhiều nhất tháng
            </p>
          </div>
          <Link href="/products" className="text-xs font-bold text-[#006838] hover:underline flex items-center gap-1">
            Xem tất cả ({featuredProducts.length}+ món) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {featuredProducts.map((p) => {
            const rPrice = Number(p.retail_price ?? (p as any).price ?? 0)
            const wPrice = Number(p.wholesale_price ?? rPrice)
            const minQty = Number(p.wholesale_min_qty ?? 1)

            return (
              <div 
                key={p.id} 
                className="bg-white rounded-2xl border border-slate-200/90 p-3.5 md:p-4 shadow-2xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between relative group hover:border-emerald-300"
              >
                <Link href={`/products/${p.id}`} className="block space-y-2 md:space-y-3">
                  <div className="w-full h-32 md:h-44 bg-slate-50 rounded-xl flex items-center justify-center relative overflow-hidden group-hover:bg-emerald-50/40 transition-colors">
                    <PackageCheck className="w-10 h-10 md:w-14 md:h-14 text-slate-300 group-hover:text-[#006838] group-hover:scale-110 transition-all duration-300" />
                    {minQty > 1 && (
                      <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase shadow-2xs">
                        Giá Sỉ ≥ {minQty} {p.unit}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[9px] md:text-[10px] font-extrabold text-[#006838] uppercase tracking-wider">
                      F&B INGREDIENT
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs md:text-sm line-clamp-2 mt-0.5 group-hover:text-[#006838] transition-colors leading-snug">
                      {p.name}
                    </h3>
                    <p className="text-[10px] md:text-[11px] text-slate-400 mt-1 font-medium">
                      Quy cách: 1 {p.unit} = {p.conversion_rate} {p.base_unit}
                    </p>
                  </div>
                </Link>

                <div className="border-t border-slate-100 pt-2.5 md:pt-3 space-y-1.5 md:space-y-2 mt-3">
                  {/* Khung Giá Lẻ */}
                  <div className="flex justify-between items-center text-[11px] md:text-xs bg-slate-50 p-2 rounded-xl">
                    <div className="min-w-0 pr-1">
                      <span className="text-[9px] text-slate-500 block truncate">Giá Lẻ (&lt; {minQty}):</span>
                      <strong className="text-slate-800 font-bold block truncate">{rPrice.toLocaleString('vi-VN')} đ</strong>
                    </div>
                    <button 
                      onClick={() => addToCart(p, 'BASE')} 
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-2.5 md:px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold cursor-pointer shrink-0 transition-colors"
                    >
                      + Mua
                    </button>
                  </div>

                  {/* Khung Giá Sỉ BR-01 */}
                  <div className="flex justify-between items-center text-[11px] md:text-xs bg-emerald-50/90 border border-emerald-200/80 p-2 rounded-xl">
                    <div className="min-w-0 pr-1">
                      <span className="text-[9px] text-[#006838] font-bold block truncate">Giá Sỉ (≥ {minQty}):</span>
                      <strong className="text-[#006838] font-extrabold block truncate">{wPrice.toLocaleString('vi-VN')} đ</strong>
                    </div>
                    <button 
                      onClick={() => addToCart(p, 'UNIT')} 
                      className="bg-[#006838] hover:bg-emerald-700 text-white px-2.5 md:px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold cursor-pointer shrink-0 transition-colors shadow-2xs"
                    >
                      + Giá Sỉ
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