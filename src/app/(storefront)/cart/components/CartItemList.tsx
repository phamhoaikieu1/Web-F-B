'use client'

import { Trash2, Plus, Minus, Package } from 'lucide-react'
import { CartItem } from '../page'

interface CartItemListProps {
  cart: CartItem[]
  onUpdateQuantity: (cartKey: string, delta: number) => void
  onRemoveItem: (cartKey: string) => void
}

export default function CartItemList({
  cart,
  onUpdateQuantity,
  onRemoveItem,
}: CartItemListProps) {
  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
        <Package className="w-10 h-10 text-slate-300 mx-auto" />
        <p className="text-xs text-slate-400">Không có mặt hàng nào trong danh sách</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
      <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b pb-3">
        1. Danh Sách Nguyên Liệu Chọn Đặt ({cart.length} mặt hàng)
      </h2>

      <div className="divide-y divide-slate-100 space-y-3">
        {cart.map((item) => {
          const cartKey = `${item.product.id}-${item.selectedUnit}`
          const itemTotal = item.unitPrice * item.quantity

          return (
            <div key={cartKey} className="pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                  {item.product.id}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-1">{item.product.name}</h3>
                <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                  {Math.round(item.unitPrice).toLocaleString('vi-VN')} đ / <span className="text-blue-600 font-bold">{item.selectedUnit}</span>
                </p>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(cartKey, -1)}
                    className="p-1 hover:bg-white rounded-lg text-slate-600 cursor-pointer shadow-xs"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-xs w-8 text-center">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(cartKey, 1)}
                    className="p-1 hover:bg-white rounded-lg text-slate-600 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <p className="font-bold text-slate-900 text-sm">
                    {Math.round(itemTotal).toLocaleString('vi-VN')} đ
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveItem(cartKey)}
                  className="text-slate-300 hover:text-red-600 p-1 transition-colors cursor-pointer"
                  title="Xóa món này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}