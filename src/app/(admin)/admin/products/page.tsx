'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Product, Category } from '@/types/database'
import { Package, Plus, Search, Edit2, Trash2, AlertTriangle, CheckCircle, Power, X, Layers } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminProductsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // State Modal Thêm / Sửa Sản Phẩm
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form State
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [unit, setUnit] = useState('Chai')
  const [baseUnit, setBaseUnit] = useState('Chai')
  const [conversionRate, setConversionRate] = useState(1)
  const [price, setPrice] = useState(0)
  const [costPrice, setCostPrice] = useState(0)
  const [stockQuantity, setStockQuantity] = useState(0)
  const [minStockAlert, setMinStockAlert] = useState(10)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const { data: catData } = await supabase.from('categories').select('*').order('display_order')
    if (catData) setCategories(catData)

    const { data: prodData, error } = await supabase.from('products').select('*').order('name')
    if (error) console.error('Lỗi lấy danh sách sản phẩm:', error)
    else setProducts(prodData || [])

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenAddModal = () => {
    setEditingProduct(null)
    setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`)
    setName('')
    setCategoryId(categories[0]?.id || '')
    setUnit('Thùng')
    setBaseUnit('Chai')
    setConversionRate(24)
    setPrice(100000)
    setCostPrice(70000)
    setStockQuantity(50)
    setMinStockAlert(10)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p)
    setSku(p.sku || '')
    setName(p.name || '')
    setCategoryId(p.category_id || '')
    setUnit(p.unit || 'Chai')
    setBaseUnit(p.base_unit || 'Chai')
    setConversionRate(p.conversion_rate || 1)
    setPrice(Number(p.price) || 0)
    setCostPrice(Number(p.cost_price) || 0)
    setStockQuantity(p.stock_quantity || 0)
    setMinStockAlert(p.min_stock_alert || 10)
    setIsModalOpen(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return toast.warning('Vui lòng nhập tên sản phẩm!')

    setIsSubmitting(true)
    try {
      const payload = {
        sku: sku.trim(),
        name: name.trim(),
        category_id: categoryId || categories[0]?.id || 'cat-gen',
        unit: unit.trim(),
        base_unit: baseUnit.trim(),
        conversion_rate: Number(conversionRate) || 1,
        price: Number(price) || 0,
        cost_price: Number(costPrice) || 0,
        stock_quantity: Number(stockQuantity) || 0,
        min_stock_alert: Number(minStockAlert) || 10,
      }

      if (editingProduct) {
        // CẬP NHẬT SẢN PHẨM
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id)
        if (error) throw error
        toast.success(`Đã cập nhật sản phẩm ${name}!`)
      } else {
        // THÊM MỚI SẢN PHẨM
        const { error } = await supabase.from('products').insert(payload)
        if (error) throw error
        toast.success(`Thêm mới sản phẩm ${name} thành công!`)
      }

      setIsModalOpen(false)
      fetchData()
    } catch (err: any) {
      toast.error(`Không thể lưu sản phẩm: ${err.message || 'Lỗi kết nối'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActiveProduct = async (p: Product) => {
    const newDisabledState = !p.is_disabled
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_disabled: newDisabledState })
        .eq('id', p.id)

      if (error) throw error

      if (newDisabledState) {
        toast.info(`Đã ngắt sản phẩm ${p.name} sang trạng thái NGỪNG BÁN`)
      } else {
        toast.success(`Đã chuyển sản phẩm ${p.name} sang trạng thái ĐANG BÁN`)
      }
      fetchData()
    } catch (err: any) {
      toast.error(`Không thể cập nhật trạng thái: ${err.message || 'Lỗi kết nối'}`)
    }
  }

  const handleDeleteProduct = async (p: Product) => {
    if (!confirm(`Bạn có chắc chắn muốn XÓA sản phẩm ${p.name}? Hành động này không thể hoàn tác!`)) return

    try {
      const { error } = await supabase.from('products').delete().eq('id', p.id)
      if (error) throw error
      toast.success(`Đã xóa sản phẩm ${p.name}!`)
      fetchData()
    } catch (err: any) {
      toast.error(`Không thể xóa: ${err.message}`)
    }
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-blue-600" /> Quản Lý Danh Mục Sản Phẩm (CRUD)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Thêm mới, điều chỉnh giá sỉ/lẻ, tỷ lệ quy đổi thùng/chai & quản lý cảnh báo tồn kho
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hoặc mã SKU..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>

          <button
            onClick={handleOpenAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Thêm Sản Phẩm
          </button>
        </div>
      </header>

      {/* BẢNG QUẢN LÝ SẢN PHẨM CRUD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="p-4">Mã SKU / Sản Phẩm</th>
                <th className="p-4 text-center">Quy Đổi Đơn Vị</th>
                <th className="p-4 text-right">Giá Sỉ (Đơn Vị)</th>
                <th className="p-4 text-right">Giá Vốn (Vốn)</th>
                <th className="p-4 text-center">Tồn Kho Kho</th>
                <th className="p-4 text-center">Trạng Thái Kính Doanh</th>
                <th className="p-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Đang tải danh mục sản phẩm...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Không có sản phẩm nào
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isDisabled = !!p.is_disabled
                  const isLowStock = p.stock_quantity <= p.min_stock_alert

                  return (
                    <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${isDisabled ? 'opacity-50 bg-slate-50/50' : ''}`}>
                      <td className="p-4">
                        <span className="font-mono text-[10px] font-bold text-slate-400 block">{p.sku}</span>
                        <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                      </td>

                      <td className="p-4 text-center">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-semibold text-[11px] block">
                          1 {p.unit} = {p.conversion_rate} {p.base_unit}
                        </span>
                      </td>

                      <td className="p-4 text-right font-bold text-emerald-600 font-mono text-sm">
                        {Number(p.price).toLocaleString('vi-VN')} đ
                      </td>

                      <td className="p-4 text-right font-semibold text-slate-500 font-mono text-xs">
                        {Number(p.cost_price).toLocaleString('vi-VN')} đ
                      </td>

                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 font-extrabold px-2.5 py-1 rounded-full ${
                          isLowStock ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {isLowStock && <AlertTriangle className="w-3 h-3 text-red-600" />}
                          {p.stock_quantity} {p.base_unit}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        {isDisabled ? (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-bold text-[11px]">
                            Ngừng bán
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold text-[11px]">
                            <CheckCircle className="w-3 h-3" /> Đang bán
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa sản phẩm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleActiveProduct(p)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDisabled ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'
                            }`}
                            title={isDisabled ? 'Bật kinh doanh' : 'Tắt kinh doanh'}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(p)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM THÊM / SỬA SẢN PHẨM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitForm}
            className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
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

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Giá Sỉ (VNĐ):</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold text-emerald-600"
                />
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
                onClick={() => setIsModalOpen(false)}
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
      )}
    </main>
  )
}
