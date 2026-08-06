'use client'

import { useState, useEffect } from 'react'
import { Product, Category } from '@/types/database'
import { X } from 'lucide-react'
import { toast } from 'sonner'

export interface ProductPayload {
  sku: string
  name: string
  category_id: string
  unit: string
  base_unit: string
  conversion_rate: number
  retail_price: number
  wholesale_price: number
  wholesale_min_qty: number
  cost_price: number
  stock_quantity: number
  min_stock_alert: number
}

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  editingProduct: Product | null
  categories: Category[]
  onSubmit: (payload: ProductPayload) => Promise<void>
}

export default function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
  categories,
  onSubmit,
}: ProductFormModalProps) {
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [unit, setUnit] = useState('Chai')
  const [baseUnit, setBaseUnit] = useState('Chai')
  const [conversionRate, setConversionRate] = useState(1)
  
  // 3 CỘT ĐỊNH GIÁ THEO NGƯỠNG BR-01
  const [retailPrice, setRetailPrice] = useState(0)
  const [wholesalePrice, setWholesalePrice] = useState(0)
  const [wholesaleMinQty, setWholesaleMinQty] = useState(24)

  const [costPrice, setCostPrice] = useState(0)
  const [stockQuantity, setStockQuantity] = useState(0)
  const [minStockAlert, setMinStockAlert] = useState(10)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    if (editingProduct) {
      setSku(editingProduct.sku || '')
      setName(editingProduct.name || '')
      setCategoryId(editingProduct.category_id || categories[0]?.id || '')
      setUnit(editingProduct.unit || 'Chai')
      setBaseUnit(editingProduct.base_unit || 'Chai')
      setConversionRate(editingProduct.conversion_rate || 1)
      
      const rPrice = Number(editingProduct.retail_price ?? (editingProduct as any).price ?? 0)
      const wPrice = Number(editingProduct.wholesale_price ?? rPrice)
      const minQty = Number(editingProduct.wholesale_min_qty ?? 24)

      setRetailPrice(rPrice)
      setWholesalePrice(wPrice)
      setWholesaleMinQty(minQty)

      setCostPrice(Number(editingProduct.cost_price) || 0)
      setStockQuantity(editingProduct.stock_quantity || 0)
      setMinStockAlert(editingProduct.min_stock_alert || 10)
    } else {
      setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`)
      setName('')
      setCategoryId(categories[0]?.id || '')
      setUnit('Thùng')
      setBaseUnit('Chai')
      setConversionRate(24)
      setRetailPrice(120000)
      setWholesalePrice(100000)
      setWholesaleMinQty(24)
      setCostPrice(70000)
      setStockQuantity(50)
      setMinStockAlert(10)
    }
  }, [isOpen, editingProduct, categories])

  if (!isOpen) return null

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return toast.warning('Vui lòng nhập tên sản phẩm!')

    setIsSubmitting(true)
    try {
      const payload: ProductPayload = {
        sku: sku.trim(),
        name: name.trim(),
        category_id: categoryId || categories[0]?.id || 'cat-gen',
        unit: unit.trim(),
        base_unit: baseUnit.trim(),
        conversion_rate: Number(conversionRate) || 1,
        retail_price: Number(retailPrice) || 0,
        wholesale_price: Number(wholesalePrice) || 0,
        wholesale_min_qty: Number(wholesaleMinQty) || 1,
        cost_price: Number(costPrice) || 0,
        stock_quantity: Number(stockQuantity) || 0,
        min_stock_alert: Number(minStockAlert) || 10,
      }

      await onSubmit(payload)
      onClose()
    } catch (err: any) {
      console.error('Lỗi Submit Form Product:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmitForm}
        className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-base">
            {editingProduct ? 'Chỉnh Sửa Sản Phẩm (BR-01 Tiered Pricing)' : 'Thêm Sản Phẩm Mới'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Mã SKU (*):</label>
            <input
              type="text"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Danh Mục (*):</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="font-bold text-slate-700">Tên Sản Phẩm Nguyên Liệu (*):</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Siro Boduo Đào 1L, Hồng Trà Lộc Phát 1kg..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-blue-500 font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Đơn Vị Sỉ (Unit):</label>
            <input
              type="text"
              required
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Thùng, Bao..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Đơn Vị Lẻ (Base Unit):</label>
            <input
              type="text"
              required
              value={baseUnit}
              onChange={(e) => setBaseUnit(e.target.value)}
              placeholder="Chai, Gói, Kg..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Tỷ Lệ Quy Đổi (1 Sỉ = X Lẻ):</label>
            <input
              type="number"
              required
              min={1}
              value={conversionRate}
              onChange={(e) => setConversionRate(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
            />
          </div>

          {/* 3 Ô ĐỊNH GIÁ THEO BR-01 */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Giá Lẻ (VNĐ):</label>
            <input
              type="number"
              required
              min={0}
              value={retailPrice}
              onChange={(e) => setRetailPrice(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Giá Sỉ B2B (VNĐ):</label>
            <input
              type="number"
              required
              min={0}
              value={wholesalePrice}
              onChange={(e) => setWholesalePrice(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold text-emerald-600"
            />
          </div>

          <div className="sm:col-span-2 space-y-1 bg-amber-50/60 p-3 rounded-2xl border border-amber-200/80">
            <label className="font-bold text-amber-900">Số Lượng Tối Thiểu Đạt Giá Sỉ (Wholesale Min Qty):</label>
            <input
              type="number"
              required
              min={1}
              value={wholesaleMinQty}
              onChange={(e) => setWholesaleMinQty(Number(e.target.value))}
              className="w-full bg-white border border-amber-300 rounded-xl p-2.5 outline-none font-bold text-amber-900"
            />
            <p className="text-[11px] text-amber-700 mt-1">
              💡 Khách mua từ {wholesaleMinQty} SP trở lên sẽ tự động được tính Giá Sỉ ({Number(wholesalePrice).toLocaleString('vi-VN')} đ). Dưới ngưỡng này sẽ tính Giá Lẻ ({Number(retailPrice).toLocaleString('vi-VN')} đ).
            </p>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Giá Vốn Nguyên Liệu (VNĐ):</label>
            <input
              type="number"
              required
              min={0}
              value={costPrice}
              onChange={(e) => setCostPrice(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Tồn Kho Hiện Tại (ĐV Lẻ):</label>
            <input
              type="number"
              required
              min={0}
              value={stockQuantity}
              onChange={(e) => setStockQuantity(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="font-bold text-slate-700">Ngưỡng Cảnh Báo Tồn Kho Thấp (Min Stock Alert):</label>
            <input
              type="number"
              required
              min={1}
              value={minStockAlert}
              onChange={(e) => setMinStockAlert(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm disabled:bg-slate-300"
          >
            {isSubmitting ? 'Đang Lưu...' : 'Lưu Sản Phẩm'}
          </button>
        </div>
      </form>
    </div>
  )
}
