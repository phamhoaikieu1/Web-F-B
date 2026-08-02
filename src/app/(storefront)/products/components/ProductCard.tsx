'use client'

import Link from 'next/link'
import { Heart, PackageCheck, AlertTriangle } from 'lucide-react'
import { Product } from '@/types/database'

interface ProductCardProps {
  product: Product
  isLiked: boolean
  onToggleWishlist: (id: string) => void
  onAddToCart: (product: Product, unitType: 'UNIT' | 'BASE') => void
}

export default function ProductCard({
  product: p,
  isLiked,
  onToggleWishlist,
  onAddToCart,
}: ProductCardProps) {
  const basePrice = Number(p.price) / p.conversion_rate
  const isOutOfStock = p.stock_quantity <= 0
  const isLowStock = !isOutOfStock && p.stock_quantity <= p.min_stock_alert

  return (
    <div className={`bg-white rounded-2xl border p-3 md:p-4 shadow-2xs transition-all flex flex-col justify-between relative group ${
      isOutOfStock
        ? 'border-slate-300 opacity-75'
        : 'border-slate-200/80 hover:border-emerald-300'
    }`}>
      <button
        type="button"
        onClick={() => onToggleWishlist(p.id)}
        className="absolute top-2 right-2 md:top-3 md:right-3 z-10 p-1.5 bg-white/90 rounded-full shadow-xs text-slate-400 hover:text-red-500 cursor-pointer"
      >
        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
      </button>

      <Link href={`/products/${p.id}`} className="block space-y-2">
        <div className="w-full h-32 md:h-40 bg-slate-50 rounded-xl flex items-center justify-center relative overflow-hidden">
          <PackageCheck className={`w-8 h-8 md:w-10 md:h-10 transition-transform ${
            isOutOfStock ? 'text-slate-200' : 'text-slate-300 group-hover:scale-110'
          }`} />

          {/* BADGE HẾT HÀNG GÓC ẢNH */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
              <span className="bg-slate-800 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                Tạm hết hàng
              </span>
            </div>
          )}
        </div>

        <div>
          <span className="text-[9px] font-bold text-emerald-600 uppercase block">F&B INGREDIENT</span>
          <h3 className={`font-bold text-xs md:text-sm line-clamp-2 ${
            isOutOfStock ? 'text-slate-400' : 'text-slate-900 group-hover:text-emerald-600'
          }`}>{p.name}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">1 {p.unit} = {p.conversion_rate} {p.base_unit}</p>
        </div>
      </Link>

      {/* CẢNH BÁO SẮP HẾT HÀNG */}
      {isLowStock && (
        <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-700 px-2 py-1 rounded-lg text-[10px] font-bold mt-2">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span>⚠️ Chỉ còn {p.stock_quantity} {p.base_unit} trong kho</span>
        </div>
      )}

      <div className="border-t border-slate-100 pt-2 space-y-1.5 mt-3">
        <div className="flex justify-between items-center text-[11px] bg-slate-50 p-1.5 rounded-xl">
          <div className="min-w-0 pr-1">
            <span className="text-[9px] text-slate-400 block truncate">Sỉ ({p.unit}):</span>
            <strong className="text-emerald-600 font-bold block truncate">{Number(p.price).toLocaleString('vi-VN')} đ</strong>
          </div>
          {isOutOfStock ? (
            <span className="bg-slate-200 text-slate-500 px-2 py-1 rounded-lg text-[10px] font-bold shrink-0">
              Hết hàng
            </span>
          ) : (
            <button onClick={() => onAddToCart(p, 'UNIT')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer shrink-0">
              + Sỉ
            </button>
          )}
        </div>

        <div className="flex justify-between items-center text-[11px] bg-slate-50 p-1.5 rounded-xl">
          <div className="min-w-0 pr-1">
            <span className="text-[9px] text-slate-400 block truncate">Lẻ ({p.base_unit}):</span>
            <strong className="text-emerald-600 font-bold block truncate">{Math.round(basePrice).toLocaleString('vi-VN')} đ</strong>
          </div>
          {isOutOfStock ? (
            <span className="bg-slate-200 text-slate-500 px-2 py-1 rounded-lg text-[10px] font-bold shrink-0">
              Hết hàng
            </span>
          ) : (
            <button onClick={() => onAddToCart(p, 'BASE')} className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer shrink-0">
              + Lẻ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}