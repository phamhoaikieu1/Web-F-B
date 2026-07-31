'use client'

import Link from 'next/link'
import { Heart, PackageCheck } from 'lucide-react'
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3 md:p-4 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between relative group">
      <button
        type="button"
        onClick={() => onToggleWishlist(p.id)}
        className="absolute top-2 right-2 md:top-3 md:right-3 z-10 p-1.5 bg-white/90 rounded-full shadow-xs text-slate-400 hover:text-red-500 cursor-pointer"
      >
        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
      </button>

      <Link href={`/products/${p.id}`} className="block space-y-2">
        <div className="w-full h-32 md:h-40 bg-slate-50 rounded-xl flex items-center justify-center">
          <PackageCheck className="w-8 h-8 md:w-10 md:h-10 text-slate-300 group-hover:scale-110 transition-transform" />
        </div>

        <div>
          <span className="text-[9px] font-bold text-emerald-600 uppercase block">F&B INGREDIENT</span>
          <h3 className="font-bold text-slate-900 text-xs md:text-sm line-clamp-2 group-hover:text-emerald-600">{p.name}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">1 {p.unit} = {p.conversion_rate} {p.base_unit}</p>
        </div>
      </Link>

      <div className="border-t border-slate-100 pt-2 space-y-1.5 mt-3">
        <div className="flex justify-between items-center text-[11px] bg-slate-50 p-1.5 rounded-xl">
          <div className="min-w-0 pr-1">
            <span className="text-[9px] text-slate-400 block truncate">Sỉ ({p.unit}):</span>
            <strong className="text-emerald-600 font-bold block truncate">{Number(p.price).toLocaleString('vi-VN')} đ</strong>
          </div>
          <button onClick={() => onAddToCart(p, 'UNIT')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer shrink-0">
            + Sỉ
          </button>
        </div>

        <div className="flex justify-between items-center text-[11px] bg-slate-50 p-1.5 rounded-xl">
          <div className="min-w-0 pr-1">
            <span className="text-[9px] text-slate-400 block truncate">Lẻ ({p.base_unit}):</span>
            <strong className="text-emerald-600 font-bold block truncate">{Math.round(basePrice).toLocaleString('vi-VN')} đ</strong>
          </div>
          <button onClick={() => onAddToCart(p, 'BASE')} className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer shrink-0">
            + Lẻ
          </button>
        </div>
      </div>
    </div>
  )
}