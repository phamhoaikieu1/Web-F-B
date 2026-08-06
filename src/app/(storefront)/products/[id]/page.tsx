'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Product } from '@/types/database'
import { ArrowLeft, ShoppingBag, Plus, Minus, Check, Package, ShieldCheck, Truck, Eye, PackageCheck } from 'lucide-react'
import { getB2BUnitPrice } from '@/lib/pricing'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const productId = resolvedParams.id

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedUnitType, setSelectedUnitType] = useState<'UNIT' | 'BASE'>('UNIT')
  const [isAdded, setIsAdded] = useState(false)

  // STATE ĐÃ XEM GẦN ĐÂY (RECENTLY VIEWED PRODUCTS)
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true)
      const { data } = await supabase.from('products').select('*').eq('id', productId).single()
      if (data) {
        setProduct(data)

        // 👁️ THÊM SẢN PHẨM VÀO LOCALSTORAGE ĐÃ XEM GẦN ĐÂY
        const savedViewed = localStorage.getItem('b2b_recently_viewed')
        let viewedList: Product[] = []
        if (savedViewed) {
          try { viewedList = JSON.parse(savedViewed) } catch (e) {}
        }
        const filteredList = viewedList.filter((p) => p.id !== data.id)
        const updatedList = [data, ...filteredList].slice(0, 6)
        setRecentlyViewed(updatedList)
        localStorage.setItem('b2b_recently_viewed', JSON.stringify(updatedList))
      }
      setLoading(false)
    }
    fetchProduct()
  }, [productId])

  if (loading) {
    return <div className="p-12 text-center text-xs font-semibold text-slate-400">Đang tải chi tiết sản phẩm...</div>
  }

  if (!product) {
    return (
      <main className="p-8 text-center space-y-4">
        <p className="text-slate-500 font-bold text-sm">Không tìm thấy sản phẩm nguyên liệu này!</p>
        <Link href="/products" className="text-xs text-emerald-600 font-bold hover:underline">
          Quay lại danh mục sản phẩm
        </Link>
      </main>
    )
  }

  const isBase = selectedUnitType === 'BASE'
  const rPrice = Number(product.retail_price ?? (product as any).price ?? 0)
  const wPrice = Number(product.wholesale_price ?? rPrice)
  const minQty = Number(product.wholesale_min_qty ?? 1)
  const conversion = Number(product.conversion_rate || 1)

  const addedBaseQuantity = isBase ? quantity : quantity * conversion
  const currentUnitPrice = getB2BUnitPrice(product, addedBaseQuantity)
  const totalPrice = addedBaseQuantity * currentUnitPrice
  const isWholesaleApplied = minQty > 0 && addedBaseQuantity >= minQty

  const handleAddToCart = () => {
    const savedCart = localStorage.getItem('b2b_cart')
    let currentCart: any[] = []
    if (savedCart) {
      try { currentCart = JSON.parse(savedCart) } catch (e) {}
    }

    const existingIndex = currentCart.findIndex((i) => i.product.id === product.id)
    let newQty = addedBaseQuantity
    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += addedBaseQuantity
      newQty = currentCart[existingIndex].quantity
      currentCart[existingIndex].product = product
      currentCart[existingIndex].unitPrice = getB2BUnitPrice(product, newQty)
    } else {
      currentCart.push({ product, quantity: addedBaseQuantity, unitPrice: getB2BUnitPrice(product, addedBaseQuantity) })
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
        {/* HÌNH ẢNH SẢN PHẨM VỚI KHUNG OVERFLOW-HIDDEN & KÍNH LÚP HOVER SCALE-105 */}
        <div className="md:col-span-5 bg-slate-50 rounded-2xl h-80 md:h-96 flex items-center justify-center p-8 relative overflow-hidden border border-slate-200/80 group cursor-pointer">
          <Package className="w-28 h-28 text-slate-300 group-hover:text-[#006838] group-hover:scale-105 transition-transform duration-300 ease-out" />
          <span className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-xs text-[10px] font-bold text-slate-500 px-2.5 py-1 rounded-full border border-slate-200/60">
            🔍 Rê chuột để xem ảnh lớn
          </span>
        </div>

        <div className="md:col-span-7 space-y-6">
          <div>
            <span className="text-xs font-black text-[#006838] uppercase tracking-wider block mb-1">
              NGUYÊN LIỆU PHẠM VI B2B CHÍNH HÃNG
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">{product.name}</h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">Tỷ lệ quy đổi chuẩn: 1 {product.unit} = {product.conversion_rate} {product.base_unit}</p>
          </div>

          {/* TIERED PRICING VISUAL (SO SÁNH GIÁ LẺ VS GIÁ SỈ THEO BR-01) */}
          <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-xs font-black text-slate-800 uppercase">Bảng Giá Phân Phối Sỉ & Lẻ</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">Thuật Toán BR-01</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Giá Lẻ */}
              <button
                type="button"
                onClick={() => setSelectedUnitType('BASE')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  !isWholesaleApplied && isBase ? 'border-[#006838] bg-white text-slate-900 font-bold shadow-xs ring-2 ring-emerald-600/20' : 'border-slate-200 bg-slate-50/80 text-slate-600 hover:bg-white'
                }`}
              >
                <span className="text-[10px] block font-extrabold text-slate-500 uppercase">GIÁ BÁN LẺ (&lt; {minQty} {product.base_unit})</span>
                <strong className="text-base text-slate-900 block mt-1">{rPrice.toLocaleString('vi-VN')} đ <span className="text-xs font-normal text-slate-500">/{product.base_unit}</span></strong>
              </button>

              {/* Giá Sỉ */}
              <button
                type="button"
                onClick={() => setSelectedUnitType('UNIT')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isWholesaleApplied || !isBase ? 'border-[#006838] bg-emerald-50 text-emerald-950 font-bold shadow-xs ring-2 ring-emerald-600/30' : 'border-slate-200 bg-white text-slate-600 hover:bg-emerald-50/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] block font-extrabold text-[#006838] uppercase">GIÁ SỈ B2B (≥ {minQty} {product.base_unit})</span>
                  {minQty > 0 && rPrice > wPrice && (
                    <span className="text-[9px] font-black text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                      Tiết kiệm {Math.round(((rPrice - wPrice) / rPrice) * 100)}%
                    </span>
                  )}
                </div>
                <strong className="text-base text-[#006838] block mt-1">{wPrice.toLocaleString('vi-VN')} đ <span className="text-xs font-normal text-emerald-700">/{product.base_unit}</span></strong>
              </button>
            </div>

            {/* DÒNG GỢI Ý MUA THÊM VÀ TÍNH TOÁN COST SAVINGS */}
            <div className="text-xs font-semibold pt-1">
              {!isWholesaleApplied ? (
                <span className="text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/80 block">
                  💡 Mua thêm <strong>{minQty - addedBaseQuantity} {product.base_unit}</strong> nữa để tự động nhận Giá Sỉ ưu đãi (<strong>{wPrice.toLocaleString('vi-VN')}đ</strong>/{product.base_unit})!
                </span>
              ) : (
                <span className="text-[#006838] bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 block font-bold">
                  🎉 Đã áp dụng Chiết Khấu Giá Sỉ B2B (Tiết kiệm {( (rPrice - wPrice) * addedBaseQuantity ).toLocaleString('vi-VN')} đ cho đơn này)!
                </span>
              )}
            </div>
          </div>

          {/* SỐ LƯỢNG VÀ THÀNH TIỀN */}
          <div className="flex items-center gap-6">
            <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 p-1">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-white rounded-lg text-slate-700 cursor-pointer transition-colors">
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-sm w-12 text-center text-slate-900">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-white rounded-lg text-slate-700 cursor-pointer transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="text-right flex-1">
              <span className="text-xs text-slate-400 block font-medium">Thành tiền tạm tính:</span>
              <span className="text-2xl font-black text-[#006838]">{Math.round(totalPrice).toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          {/* NÚT HÀNH ĐỘNG CỤM THÊM GIỎ HÀNG & CHỐT ZALO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleAddToCart}
              className={`w-full py-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95 ${
                isAdded ? 'bg-emerald-700 text-white' : 'bg-[#006838] hover:bg-emerald-700 text-white'
              }`}
            >
              {isAdded ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
              <span>{isAdded ? 'ĐÃ THÊM VÀO GIỎ HÀNG!' : 'THÊM VÀO GIỎ HÀNG B2B'}</span>
            </button>

            <a
              href="https://zalo.me/0989830347"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 bg-emerald-50 hover:bg-emerald-100 text-[#006838] border border-emerald-300 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs active:scale-95"
            >
              <span>📞 CHÁT ZALO BÁO GIÁ THÙNG</span>
            </a>
          </div>

          {/* ONEFOOD STYLE B2B COMMITMENT BOX (KHUNG CAM KẾT VẬN HÀNH B2B TRUYỀN THÔNG) */}
          <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 text-xs space-y-2.5 shadow-2xs">
            <h4 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider border-b border-emerald-200/60 pb-1.5 text-[#006838]">
              🛡️ Cam Kết Dịch Vụ B2B Dành Cho Chuỗi Quán
            </h4>
            <ul className="space-y-2 text-slate-700 font-medium">
              <li className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-[#006838] shrink-0 mt-0.5" />
                <span><strong>Giao hàng chành xe toàn quốc:</strong> Đóng thùng chống móp vỡ, hỗ trợ gửi chành xe đi tỉnh an toàn trong ngày.</span>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span><strong>Hỏa tốc nội thành:</strong> Freeship nội thành Hà Nội & TP.HCM cho đơn sỉ nguyên liệu đạt ngưỡng quy định.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#006838] shrink-0 mt-0.5" />
                <span><strong>Uy tín & Pháp lý:</strong> Cam kết 100% đầy đủ chứng nhận ATVSTP & xuất Hóa đơn VAT điện tử cho chủ quán.</span>
              </li>
            </ul>
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
            {recentlyViewed.filter(p => p.id !== product.id).map((p) => {
              const rP = Number(p.retail_price ?? (p as any).price ?? 0)
              return (
                <Link key={p.id} href={`/products/${p.id}`} className="bg-white p-3 rounded-2xl border border-slate-200 text-xs space-y-1.5 hover:border-emerald-500 transition-colors block">
                  <div className="w-full h-20 bg-slate-50 rounded-xl flex items-center justify-center">
                    <PackageCheck className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="font-bold text-slate-900 truncate">{p.name}</p>
                  <p className="text-emerald-600 font-bold text-[11px]">{rP.toLocaleString('vi-VN')} đ / {p.base_unit || p.unit}</p>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}