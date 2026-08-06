'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Product } from '@/types/database'
import { CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import ProductImportSelector from './components/ProductImportSelector'
import ImportForm from './components/ImportForm'

export default function InventoryImportPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  const [importQty, setImportQty] = useState<number>(1)
  const [importCostPrice, setImportCostPrice] = useState<number>(0)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('name')
    if (error) console.error('Lỗi lấy danh sách sản phẩm:', error)
    else setProducts(data || [])
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p)
    setImportCostPrice(Number(p.cost_price) * p.conversion_rate || Number(p.wholesale_price || p.retail_price || 0))
  }

  const handleSubmitImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return toast.warning('Vui lòng chọn 1 sản phẩm để nhập kho!')
    if (importQty <= 0) return toast.warning('Số lượng nhập phải lớn hơn 0!')

    setIsSubmitting(true)
    try {
      const baseQtyImport = importQty * selectedProduct.conversion_rate
      const newStockQuantity = selectedProduct.stock_quantity + baseQtyImport
      const currentImportCostPerBaseUnit = importCostPrice / selectedProduct.conversion_rate

      const oldAvgCost = Number(selectedProduct.avg_cost_price ?? selectedProduct.cost_price ?? 0)
      const oldTotalValue = selectedProduct.stock_quantity * oldAvgCost
      const newImportValue = baseQtyImport * currentImportCostPerBaseUnit
      const newMovingAverageCost = newStockQuantity > 0 
        ? (oldTotalValue + newImportValue) / newStockQuantity 
        : currentImportCostPerBaseUnit

      const roundedMac = Math.round(newMovingAverageCost * 100) / 100

      const { error: updateError } = await supabase
        .from('products')
        .update({
          stock_quantity: newStockQuantity,
          cost_price: Math.round(currentImportCostPerBaseUnit * 100) / 100,
          avg_cost_price: roundedMac,
        })
        .eq('id', selectedProduct.id)

      if (updateError) throw updateError

      const refCode = `NK-${Math.floor(10000 + Math.random() * 90000)}`
      
      const { data: { user } } = await supabase.auth.getUser()

      const { error: logError } = await supabase
        .from('inventory_receipts')
        .insert({
          product_id: selectedProduct.id,
          import_quantity: importQty,
          import_price: importCostPrice,
          notes: notes.trim() || `Nhập kho ${importQty} ${selectedProduct.unit}`,
        })

      if (logError) throw logError

      const msg = `Nhập kho thành công! Mã phiếu: ${refCode}. Giá vốn bình quân di động mới: ${Math.round(newMovingAverageCost).toLocaleString('vi-VN')} đ/${selectedProduct.base_unit}`
      setSuccessMsg(msg)
      toast.success(msg)
      setSelectedProduct(null)
      setImportQty(1)
      setNotes('')
      fetchProducts()
    } catch (error: any) {
      console.error(error)
      toast.error(`Lỗi nhập kho: ${error.message || 'Không thể nhập kho'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="p-8 max-w-[1600px] mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Lập Phiếu Nhập Kho Nguyên Liệu</h1>
        <p className="text-sm text-slate-500">Cộng số lượng tồn kho & tính giá vốn bình quân gia quyền di động</p>
      </header>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <p className="font-medium text-sm">{successMsg}</p>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <ProductImportSelector
            products={products}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedProduct={selectedProduct}
            onSelectProduct={handleSelectProduct}
          />
        </div>

        <div className="lg:col-span-5">
          <ImportForm
            selectedProduct={selectedProduct}
            importQty={importQty}
            setImportQty={setImportQty}
            importCostPrice={importCostPrice}
            setImportCostPrice={setImportCostPrice}
            notes={notes}
            setNotes={setNotes}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmitImport}
          />
        </div>
      </div>
    </main>
  )
}