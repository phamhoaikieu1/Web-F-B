'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Product, Category } from '@/types/database'
import { Package, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import ProductTable from './components/ProductTable'
import ProductFormModal, { ProductPayload } from './components/ProductFormModal'

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
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p)
    setIsModalOpen(true)
  }

  const handleSubmitForm = async (payload: ProductPayload) => {
    try {
      if (editingProduct) {
        // CẬP NHẬT SẢN PHẨM
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id)
        if (error) throw error
        toast.success(`Đã cập nhật sản phẩm ${payload.name}!`)
      } else {
        // THÊM MỚI SẢN PHẨM
        const { error } = await supabase.from('products').insert(payload)
        if (error) throw error
        toast.success(`Thêm mới sản phẩm ${payload.name} thành công!`)
      }

      setIsModalOpen(false)
      fetchData()
    } catch (err: any) {
      toast.error(`Không thể lưu sản phẩm: ${err.message || 'Lỗi kết nối'}`)
      throw err
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
      <ProductTable
        products={filteredProducts}
        loading={loading}
        onOpenEditModal={handleOpenEditModal}
        onToggleActive={handleToggleActiveProduct}
        onDeleteProduct={handleDeleteProduct}
      />

      {/* MODAL FORM THÊM / SỬA SẢN PHẨM */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingProduct={editingProduct}
        categories={categories}
        onSubmit={handleSubmitForm}
      />
    </main>
  )
}
