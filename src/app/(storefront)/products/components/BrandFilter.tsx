'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

interface BrandFilterProps {
  brands: string[]
  selectedBrands: string[]
  onToggleBrand: (brand: string) => void
}

export default function BrandFilter({
  brands,
  selectedBrands,
  onToggleBrand,
}: BrandFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredBrands = brands.filter((b) =>
    b.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-3 pt-2">
      {/* Ô tìm kiếm tên Hãng */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm tên thương hiệu (Boduo, Rich's...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Danh sách Checkbox Hãng */}
      <div className="max-h-44 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {filteredBrands.length === 0 ? (
          <p className="text-[11px] text-slate-400 py-1">Không tìm thấy hãng phù hợp</p>
        ) : (
          filteredBrands.map((brand) => {
            const isChecked = selectedBrands.includes(brand)
            return (
              <label
                key={brand}
                className="flex items-center gap-2.5 text-xs text-slate-700 hover:text-emerald-600 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleBrand(brand)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />
                <span className={isChecked ? 'font-bold text-emerald-700' : ''}>{brand}</span>
              </label>
            )
          })
        )}
      </div>
    </div>
  )
}