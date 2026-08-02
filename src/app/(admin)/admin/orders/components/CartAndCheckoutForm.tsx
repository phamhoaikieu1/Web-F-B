'use client'

import { ShoppingCart, Plus, Minus } from 'lucide-react'
import { Product } from '@/types/database'

export interface CartItem {
  product: Product
  selectedUnit: string
  isBaseUnit: boolean
  quantity: number
  unitPrice: number
}

interface CartAndCheckoutFormProps {
  cart: CartItem[]
  onUpdateQuantity: (cartKey: string, delta: number) => void
  totalAmount: number
  customerName: string
  setCustomerName: (v: string) => void
  storeName: string
  setStoreName: (v: string) => void
  customerPhone: string
  setCustomerPhone: (v: string) => void
  customerAddress: string
  setCustomerAddress: (v: string) => void
  notes: string
  setNotes: (v: string) => void
  isSubmitting: boolean
  onSubmitOrder: (e: React.FormEvent) => void
}

export default function CartAndCheckoutForm({
  cart,
  onUpdateQuantity,
  totalAmount,
  customerName,
  setCustomerName,
  storeName,
  setStoreName,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
  notes,
  setNotes,
  isSubmitting,
  onSubmitOrder,
}: CartAndCheckoutFormProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <form onSubmit={onSubmitOrder} className="space-y-6">
        <div>
          <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-blue-600" /> Giỏ Hàng B2B
          </h2>

          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-sm">
                Chưa có sản phẩm nào được chọn
              </p>
            ) : (
              cart.map((item) => {
                const cartKey = `${item.product.id}-${item.selectedUnit}`
                return (
                  <div
                    key={cartKey}
                    className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-emerald-600 font-medium">
                        {Math.round(item.unitPrice).toLocaleString('vi-VN')} đ /{' '}
                        <span className="font-bold text-blue-600">{item.selectedUnit}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(cartKey, -1)}
                        className="p-1 text-slate-500 hover:bg-slate-200 rounded cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(cartKey, 1)}
                        className="p-1 text-slate-500 hover:bg-slate-200 rounded cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <p className="text-xs font-bold text-slate-900">
                        {Math.round(item.unitPrice * item.quantity).toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-3">
          <h3 className="font-semibold text-slate-900 text-sm">Thông Tin Khách Hàng & Giao Hàng</h3>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Tên chủ quán / Khách hàng"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Tên quán / Thương hiệu"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Số điện thoại Zalo *"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="text"
              required
              placeholder="Địa chỉ giao hàng chi tiết *"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <textarea
            placeholder="Ghi chú đơn hàng (nếu có)..."
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-700">Tổng Thành Tiền:</span>
            <span className="text-xl font-bold text-blue-600">
              {Math.round(totalAmount).toLocaleString('vi-VN')} đ
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || cart.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-colors text-sm cursor-pointer"
          >
            {isSubmitting ? 'Đang tạo đơn...' : 'XÁC NHẬN TẠO ĐƠN HÀNG'}
          </button>
        </div>
      </form>
    </div>
  )
}