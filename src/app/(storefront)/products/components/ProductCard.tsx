'use client'

import Link from 'next/link'
import { PackageCheck, AlertTriangle } from 'lucide-react'
import { Product } from '@/types/database'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, unitType: 'UNIT' | 'BASE') => void
}

export default function ProductCard({
  product: p,
  onAddToCart,
}: ProductCardProps) {
  const isOutOfStock = p.stock_quantity <= 0
  const isLowStock = !isOutOfStock && p.stock_quantity <= p.min_stock_alert

  const rPrice = Number(p.retail_price ?? (p as any).price ?? 0)
  const wPrice = Number(p.wholesale_price ?? rPrice)
  const minQty = Number(p.wholesale_min_qty ?? 1)

  return (
    <div className={`bg-white rounded-2xl border p-3.5 md:p-4 shadow-2xs transition-all duration-200 flex flex-col justify-between relative group hover:shadow-xl ${
      isOutOfStock
        ? 'border-slate-300 opacity-75'
        : 'border-slate-200/90 hover:border-emerald-300'
    }`}>
      <Link href={`/products/${p.id}`} className="block space-y-2 md:space-y-2.5">
        <div className="w-full h-32 md:h-44 bg-slate-50 rounded-xl flex items-center justify-center relative overflow-hidden group-hover:bg-emerald-50/40 transition-colors">
          <PackageCheck className={`w-9 h-9 md:w-12 md:h-12 transition-transform duration-300 ${
            isOutOfStock ? 'text-slate-200' : 'text-slate-300 group-hover:text-[#006838] group-hover:scale-105'
          }`} />

          {/* BADGE HẾT HÀNG / GIÁ SỈ GÓC ẢNH */}
          {isOutOfStock ? (
            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-2xs">
              <span className="bg-slate-800 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                Tạm hết hàng
              </span>
            </div>
          ) : (
            minQty > 1 && (
              <span className="absolute top-2 left-2 bg-[#006838] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase shadow-2xs">
                Giá Sỉ ≥ {minQty} {p.unit}
              </span>
            )
          )}
        </div>

        <div>
          <span className="text-[9px] md:text-[10px] font-extrabold text-[#006838] uppercase tracking-wider block">
            F&B INGREDIENT
          </span>
          <h3 className={`font-bold text-xs md:text-sm line-clamp-2 mt-0.5 leading-snug transition-colors ${
            isOutOfStock ? 'text-slate-400' : 'text-slate-900 group-hover:text-[#006838]'
          }`}>
            {p.name}
          </h3>
          <p className="text-[10px] md:text-[11px] text-slate-400 mt-1 font-medium">
            Quy cách: 1 {p.unit} = {p.conversion_rate} {p.base_unit}
          </p>
        </div>
      </Link>

      {/* CẢNH BÁO SẮP HẾT HÀNG */}
      {isLowStock && (
        <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-700 px-2 py-1 rounded-lg text-[10px] font-bold mt-2">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span>⚠️ Chỉ còn {p.stock_quantity} {p.base_unit} trong kho</span>
        </div>
      )}

      <div className="border-t border-slate-100 pt-2.5 space-y-1.5 md:space-y-2 mt-3">
        {/* GIÁ LẺ */}
        <div className="flex justify-between items-center text-[11px] md:text-xs bg-slate-50 p-1.5 md:p-2 rounded-xl">
          <div className="min-w-0 pr-1">
            <span className="text-[9px] text-slate-500 block truncate">Giá Lẻ (&lt; {minQty}):</span>
            <strong className="text-slate-800 font-bold block truncate">{rPrice.toLocaleString('vi-VN')} đ</strong>
          </div>
          {isOutOfStock ? (
            <span className="bg-slate-200 text-slate-500 px-2 py-1 rounded-lg text-[10px] font-bold shrink-0">
              Hết hàng
            </span>
          ) : (
            <button 
              onClick={() => onAddToCart(p, 'BASE')} 
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-2.5 md:px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold cursor-pointer shrink-0 transition-colors"
            >
              + Mua
            </button>
          )}
        </div>

        {/* GIÁ SỈ B2B BR-01 */}
        <div className="flex justify-between items-center text-[11px] md:text-xs bg-emerald-50/90 border border-emerald-200/80 p-1.5 md:p-2 rounded-xl">
          <div className="min-w-0 pr-1">
            <span className="text-[9px] text-[#006838] font-bold block truncate">Giá Sỉ (≥ {minQty}):</span>
            <strong className="text-[#006838] font-extrabold block truncate">{wPrice.toLocaleString('vi-VN')} đ</strong>
          </div>
          {isOutOfStock ? (
            <span className="bg-slate-200 text-slate-500 px-2 py-1 rounded-lg text-[10px] font-bold shrink-0">
              Hết hàng
            </span>
          ) : (
            <button 
              onClick={() => onAddToCart(p, 'UNIT')} 
              className="bg-[#006838] hover:bg-emerald-700 text-white px-2.5 md:px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold cursor-pointer shrink-0 transition-colors shadow-2xs"
            >
              + Giá Sỉ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}