'use client'

import { Search } from 'lucide-react'
import { Product } from '@/types/database'

interface ProductImportSelectorProps {
  products: Product[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedProduct: Product | null
  onSelectProduct: (product: Product) => void
}

export default function ProductImportSelector({
  products,
  searchTerm,
  setSearchTerm,
  selectedProduct,
  onSelectProduct,
}: ProductImportSelectorProps) {
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
          placeholder="Gõ tên hoặc mã SKU để chọn mặt hàng cần nhập kho..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100">
          {filteredProducts.map((p) => {
            const isSelected = selectedProduct?.id === p.id
            return (
              <div
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-semibold text-blue-600">{p.id}</span>
                    <span className="text-xs font-mono text-slate-400">{p.sku}</span>
                  </div>
                  <h3 className="font-medium text-slate-900 text-sm">{p.name}</h3>
                  <div className="text-xs text-slate-500 mt-1">
                    Quy đổi: 1 {p.unit} = {p.conversion_rate} {p.base_unit}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400 mb-1">Tồn hiện tại</div>
                  <span className="text-sm font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {p.stock_quantity} {p.base_unit}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}