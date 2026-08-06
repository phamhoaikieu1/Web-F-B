'use client'

import { Trash2, Plus, Minus, Package } from 'lucide-react'
import { CartItem } from '../page'
import { getB2BUnitPrice, formatUnitQuantityBreakdown } from '@/lib/pricing'

interface CartItemListProps {
  cart: CartItem[]
  onUpdateQuantity: (productId: string, delta: number) => void
  onRemoveItem: (productId: string) => void
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
        1. Danh Sách Nguyên Liệu Chọn Đặt ({cart.length} sản phẩm)
      </h2>

      <div className="divide-y divide-slate-100 space-y-4">
        {cart.map((item) => {
          const productId = item.product.id
          const computedUnitPrice = getB2BUnitPrice(item.product, item.quantity)
          const itemTotal = computedUnitPrice * item.quantity

          const minQty = Number(item.product.wholesale_min_qty || 0)
          const retailBase = Number(item.product.retail_price ?? (item.product as any).price ?? 0)
          const wholesaleBase = Number(item.product.wholesale_price ?? retailBase)

          const isWholesaleApplied = minQty > 0 && item.quantity >= minQty
          const neededMoreBase = minQty - item.quantity

          const quantityBreakdownText = formatUnitQuantityBreakdown(item.product, item.quantity)

          return (
            <div key={productId} className="pt-4 flex flex-col space-y-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                    {item.product.sku || item.product.id.slice(0, 8)}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{item.product.name}</h3>
                  <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                    {Math.round(computedUnitPrice).toLocaleString('vi-VN')} đ / <span className="text-slate-700 font-bold">{item.product.base_unit}</span>
                  </p>
                  <p className="text-[11px] text-blue-700 font-bold mt-0.5 bg-blue-50/80 px-2 py-0.5 rounded-md inline-block">
                    📦 Quy đổi: {quantityBreakdownText}
                  </p>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(productId, -1)}
                      className="p-1 hover:bg-white rounded-lg text-slate-600 cursor-pointer shadow-xs"
                      title="Giảm 1 đơn vị"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-xs w-10 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(productId, 1)}
                      className="p-1 hover:bg-white rounded-lg text-slate-600 cursor-pointer shadow-xs"
                      title="Tăng 1 đơn vị"
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
                    onClick={() => onRemoveItem(productId)}
                    className="text-slate-300 hover:text-red-600 p-1 transition-colors cursor-pointer"
                    title="Xóa sản phẩm này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* DÒNG GỢI Ý ĐẶT SỈ THEO BR-01 */}
              {minQty > 0 && (
                <div className="text-[11px] pt-1">
                  {!isWholesaleApplied ? (
                    <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 inline-flex items-center gap-1 font-medium">
                      💡 Mua thêm <strong>{neededMoreBase} {item.product.base_unit}</strong> nữa để nhận giá sỉ <strong>{Number(wholesaleBase).toLocaleString('vi-VN')}đ/{item.product.base_unit}</strong>!
                    </span>
                  ) : (
                    <span className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 inline-flex items-center gap-1 font-semibold">
                      🎉 Đã áp dụng giá sỉ B2B: <strong>{Number(wholesaleBase).toLocaleString('vi-VN')}đ/{item.product.base_unit}</strong> cho toàn bộ dòng này!
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}