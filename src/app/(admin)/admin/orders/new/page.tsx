'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Product } from '@/types/database'
import { CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import OrderProductSelector from '../components/OrderProductSelector'
import CartAndCheckoutForm, { CartItem } from '../components/CartAndCheckoutForm'
import { getB2BUnitPrice } from '@/lib/pricing'

export default function CreateOrderPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successCode, setSuccessCode] = useState<string | null>(null)

  const [selectedUnits, setSelectedUnits] = useState<{ [productId: string]: 'UNIT' | 'BASE' }>({})

  const [customerName, setCustomerName] = useState('')
  const [storeName, setStoreName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('products').select('*').order('name')
      if (error) {
        console.error('Lỗi lấy danh sách sản phẩm:', error)
      } else if (data) {
        setProducts(data)
      }
    }
    fetchProducts()
  }, [])

  const handleUnitChange = (productId: string, unitType: 'UNIT' | 'BASE') => {
    setSelectedUnits((prev) => ({ ...prev, [productId]: unitType }))
  }

  const addToCart = (product: Product) => {
    const unitType = selectedUnits[product.id] || 'UNIT'
    const isBase = unitType === 'BASE'
    const addQty = isBase ? 1 : Math.max(1, product.conversion_rate || 1)

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      let updatedQty = addQty
      if (existing) {
        updatedQty = existing.quantity + addQty
      }

      const calculatedUnitPrice = getB2BUnitPrice(product, updatedQty)

      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: updatedQty, unitPrice: calculatedUnitPrice }
            : item
        )
      }

      return [
        ...prev,
        {
          product,
          quantity: addQty,
          unitPrice: calculatedUnitPrice,
        },
      ]
    })
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta
            if (newQty <= 0) return null
            const calculatedUnitPrice = getB2BUnitPrice(item.product, newQty)
            return { ...item, quantity: newQty, unitPrice: calculatedUnitPrice }
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const totalAmount = cart.reduce((sum, item) => {
    const unitPrice = getB2BUnitPrice(item.product, item.quantity)
    return sum + unitPrice * item.quantity
  }, 0)

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cart.length === 0) return toast.warning('Vui lòng chọn ít nhất 1 sản phẩm vào giỏ hàng!')
    if (!customerName.trim() && !storeName.trim()) return toast.warning('Vui lòng điền Tên khách hàng HOẶC Tên quán!')
    if (!customerPhone.trim() || !customerAddress.trim()) return toast.warning('Vui lòng nhập đầy đủ Số điện thoại và Địa chỉ giao hàng!')

    setIsSubmitting(true)
    try {
      const now = new Date()
      const dd = String(now.getDate()).padStart(2, '0')
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const yy = String(now.getFullYear()).slice(-2)
      const random4 = Math.floor(1000 + Math.random() * 9000)
      const orderCode = `ORD-${dd}${mm}${yy}-${random4}`

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_code: orderCode,
          customer_name: customerName.trim() || storeName.trim(),
          customer_phone: customerPhone.trim(),
          customer_address: customerAddress.trim(),
          store_name: storeName.trim() || null,
          total_amount: totalAmount,
          status: 'PENDING',
          notes: notes.trim() || null,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Chốt Snapshot unit_price, cost_price (MAC) & subtotal vào order_items theo quy tắc BR-01
      for (const item of cart) {
        const unitPrice = getB2BUnitPrice(item.product, item.quantity)
        const subtotal = unitPrice * item.quantity
        const macCostPrice = Number(item.product.avg_cost_price ?? item.product.cost_price ?? 0)

        const { error: itemError } = await supabase.from('order_items').insert({
          order_id: orderData.id,
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: unitPrice,
          cost_price: macCostPrice,
          subtotal: subtotal,
        })

        if (itemError) throw itemError
      }

      setSuccessCode(orderCode)
      toast.success(`Đã tạo đơn hàng thành công: ${orderCode}`)
      setCart([])
      setCustomerName('')
      setStoreName('')
      setCustomerPhone('')
      setCustomerAddress('')
      setNotes('')
    } catch (error: any) {
      console.error('Lỗi khi tạo đơn:', error)
      toast.error(`Không thể tạo đơn hàng! Lỗi chi tiết: ${error.message || 'Lỗi không xác định'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="p-8 max-w-[1600px] mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Tạo Đơn Bán Sỉ (POS)</h1>
        <p className="text-sm text-slate-500">Lập đơn hàng B2B tự động tính Giá Lẻ & Giá Sỉ theo ngưỡng BR-01</p>
      </header>

      {successCode && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="font-bold">Đã tạo đơn hàng thành công (Trạng thái: PENDING)!</p>
              <p className="text-sm">
                Mã đơn hàng: <strong className="font-mono text-emerald-700">{successCode}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => setSuccessCode(null)}
            className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <OrderProductSelector
            products={products}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedUnits={selectedUnits}
            onUnitChange={handleUnitChange}
            onAddToCart={addToCart}
          />
        </div>

        <div className="lg:col-span-5">
          <CartAndCheckoutForm
            cart={cart}
            onUpdateQuantity={updateQuantity}
            totalAmount={totalAmount}
            customerName={customerName}
            setCustomerName={setCustomerName}
            storeName={storeName}
            setStoreName={setStoreName}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            customerAddress={customerAddress}
            setCustomerAddress={setCustomerAddress}
            notes={notes}
            setNotes={setNotes}
            isSubmitting={isSubmitting}
            onSubmitOrder={handleSubmitOrder}
          />
        </div>
      </div>
    </main>
  )
}