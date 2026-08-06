'use client'

import { Product } from '@/types/database'
import { Plus, Search } from 'lucide-react'

interface OrderProductSelectorProps {
  products: Product[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedUnits: { [productId: string]: 'UNIT' | 'BASE' }
  onUnitChange: (productId: string, unitType: 'UNIT' | 'BASE') => void
  onAddToCart: (p: Product) => void
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
      (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
          Chọn Sản Phẩm Vào Giỏ (B2B)
        </h2>
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên sản phẩm hoặc mã SKU..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[650px] overflow-y-auto pr-1">
        {filteredProducts.map((p) => {
          const currentUnitType = selectedUnits[p.id] || 'UNIT'
          const isBaseSelected = currentUnitType === 'BASE'
          const rPrice = Number(p.retail_price ?? (p as any).price ?? 0)
          const wPrice = Number(p.wholesale_price ?? rPrice)

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
                        ? `${Math.round(rPrice).toLocaleString('vi-VN')} đ / ${p.base_unit}`
                        : `${(wPrice * p.conversion_rate).toLocaleString('vi-VN')} đ / ${p.unit}`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAddToCart(p)}
                    className="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 p-2 rounded-lg transition-colors cursor-pointer"
                    title="Thêm vào giỏ"
                  >
                    <Plus className="w-4 h-4" />
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