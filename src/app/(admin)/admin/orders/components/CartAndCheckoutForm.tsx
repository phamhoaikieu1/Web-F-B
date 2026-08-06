'use client'

import { ShoppingCart, Plus, Minus } from 'lucide-react'
import { Product } from '@/types/database'
import { formatUnitQuantityBreakdown } from '@/lib/pricing'

export interface CartItem {
  product: Product
  quantity: number
  unitPrice: number
}

interface CartAndCheckoutFormProps {
  cart: CartItem[]
  onUpdateQuantity: (productId: string, delta: number) => void
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
                const productId = item.product.id
                const breakdownText = formatUnitQuantityBreakdown(item.product, item.quantity)
                return (
                  <div
                    key={productId}
                    className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-emerald-600 font-medium">
                        {Math.round(item.unitPrice).toLocaleString('vi-VN')} đ /{' '}
                        <span className="font-bold text-slate-700">{item.product.base_unit}</span>
                      </p>
                      <p className="text-[10px] text-blue-700 font-bold truncate">
                        📦 {breakdownText}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(productId, -1)}
                        className="p-1 text-slate-500 hover:bg-slate-200 rounded cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold w-8 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(productId, 1)}
                        className="p-1 text-slate-500 hover:bg-slate-200 rounded cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="border-t border-slate-100 pt-3 mt-4 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500">Tổng tiền tạm tính:</span>
            <span className="text-lg font-bold text-blue-600">
              {Math.round(totalAmount).toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h3 className="font-semibold text-xs text-slate-700 uppercase tracking-wider">
            Thông tin nhận hàng (Khách B2B)
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Tên khách hàng *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Tên quán / Chuỗi</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Trà Sữa Mixue..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-500 block mb-1">Số điện thoại Zalo *</label>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="0989..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-500 block mb-1">Địa chỉ giao hàng *</label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="123 Đường ABC, Quận 1..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-500 block mb-1">Ghi chú đơn hàng</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú giao hàng..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || cart.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 text-xs shadow-md cursor-pointer"
          >
            {isSubmitting ? 'ĐANG TẠO ĐƠN HÀNG...' : 'XÁC NHẬN TẠO ĐƠN HÀNG (POS)'}
          </button>
        </div>
      </form>
    </div>
  )
}