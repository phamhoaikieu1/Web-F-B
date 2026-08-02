'use client'

import { ArrowDownLeft, Package } from 'lucide-react'
import { Product } from '@/types/database'

interface ImportFormProps {
  selectedProduct: Product | null
  importQty: number
  setImportQty: (qty: number) => void
  importCostPrice: number
  setImportCostPrice: (price: number) => void
  notes: string
  setNotes: (notes: string) => void
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
}

export default function ImportForm({
  selectedProduct,
  importQty,
  setImportQty,
  importCostPrice,
  setImportCostPrice,
  notes,
  setNotes,
  isSubmitting,
  onSubmit,
}: ImportFormProps) {
  if (!selectedProduct) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[500px] text-slate-400 text-sm space-y-2 py-20">
        <Package className="w-12 h-12 text-slate-300" />
        <p>Bấm chọn 1 mặt hàng ở danh sách bên trái để lập phiếu nhập kho</p>
      </div>
    )
  }

  const baseQtyImport = importQty * selectedProduct.conversion_rate
  const newStockQuantity = selectedProduct.stock_quantity + baseQtyImport
  const currentImportCostPerBaseUnit = importCostPrice / selectedProduct.conversion_rate
  const oldTotalValue = selectedProduct.stock_quantity * Number(selectedProduct.cost_price || 0)
  const newImportValue = baseQtyImport * currentImportCostPerBaseUnit
  const previewMovingAverage = newStockQuantity > 0 
    ? (oldTotalValue + newImportValue) / newStockQuantity 
    : currentImportCostPerBaseUnit

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[500px]">
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-lg mb-2">
            <ArrowDownLeft className="w-6 h-6" /> PHIẾU NHẬP KHO
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-mono text-blue-600 font-bold">{selectedProduct.id}</span>
            <h3 className="font-bold text-slate-900 text-base">{selectedProduct.name}</h3>
            <div className="text-xs text-slate-500 mt-1">
              Tồn kho hiện tại: <strong className="text-slate-900">{selectedProduct.stock_quantity} {selectedProduct.base_unit}</strong>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số Lượng Nhập Kho (Theo {selectedProduct.unit}):
            </label>
            <input
              type="number"
              min="1"
              required
              value={importQty}
              onChange={(e) => setImportQty(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-400 mt-1 block">
              Sẽ quy đổi cộng vào kho: <strong>+{baseQtyImport} {selectedProduct.base_unit}</strong>
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Giá Nhập Vốn Nguyên {selectedProduct.unit} (VNĐ):
            </label>
            <input
              type="number"
              min="0"
              required
              value={importCostPrice}
              onChange={(e) => setImportCostPrice(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-emerald-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-xs space-y-1">
            <p className="text-blue-800 font-medium">📐 Thuật toán Bình quân gia quyền di động:</p>
            <p className="text-slate-600">
              Giá vốn BQ dự kiến: <strong className="text-blue-700 font-bold">{Math.round(previewMovingAverage).toLocaleString('vi-VN')} đ / {selectedProduct.base_unit}</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi Chú Nhập Kho:
            </label>
            <textarea
              rows={2}
              placeholder="Tên nhà cung cấp, số hóa đơn chứng từ..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Tổng tồn sau khi nhập:</span>
            <span className="font-bold text-blue-600 text-lg">
              {newStockQuantity} {selectedProduct.base_unit}
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors text-sm cursor-pointer disabled:bg-slate-300"
          >
            {isSubmitting ? 'Đang lưu phiếu nhập...' : 'XÁC NHẬN NHẬP KHO'}
          </button>
        </div>
      </form>
    </div>
  )
}