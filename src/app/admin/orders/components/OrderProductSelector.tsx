'use client'

import { Search, Plus } from 'lucide-react'
import { Product } from '@/types/database'

interface OrderProductSelectorProps {
  products: Product[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedUnits: { [productId: string]: 'UNIT' | 'BASE' }
  onUnitChange: (productId: string, unitType: 'UNIT' | 'BASE') => void
  onAddToCart: (product: Product) => void
}

export default function OrderProductSelector({
  products,
  searchTerm,
  setSearchTerm,
  selectedUnits,
  onUnitChange,
  onAddToCart,
}: OrderProductSelectorProps) {
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Gõ tên hoặc mã SKU để tìm chọn nhanh..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[650px] overflow-y-auto pr-1">
        {filteredProducts.map((p) => {
          const currentUnitType = selectedUnits[p.id] || 'UNIT'
          const isBaseSelected = currentUnitType === 'BASE'
          const basePrice = Number(p.price) / p.conversion_rate

          return (
            <div
              key={p.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-400 transition-colors"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-1">
                  <span className="font-mono text-xs text-blue-600 font-semibold">{p.id}</span>
                  <span className="text-xs text-slate-400 font-mono">{p.sku}</span>
                </div>
                <h3 className="font-medium text-slate-900 text-sm line-clamp-2">{p.name}</h3>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Đơn vị đặt:</span>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => onUnitChange(p.id, 'UNIT')}
                      className={`px-2.5 py-1 rounded-md transition-all font-semibold cursor-pointer ${
                        !isBaseSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {p.unit} (Sỉ)
                    </button>
                    <button
                      type="button"
                      onClick={() => onUnitChange(p.id, 'BASE')}
                      className={`px-2.5 py-1 rounded-md transition-all font-semibold cursor-pointer ${
                        isBaseSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {p.base_unit} (Lẻ)
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">
                      Quy đổi: 1 {p.unit} = {p.conversion_rate} {p.base_unit}
                    </div>
                    <div className="text-sm font-bold text-emerald-600">
                      {isBaseSelected
                        ? `${Math.round(basePrice).toLocaleString('vi-VN')} đ / ${p.base_unit}`
                        : `${Number(p.price).toLocaleString('vi-VN')} đ / ${p.unit}`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAddToCart(p)}
                    className="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 p-2 rounded-lg transition-colors cursor-pointer"
                    title="Thêm vào giỏ"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}