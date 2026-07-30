'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Product } from '../../../types/database'
import { CheckCircle } from 'lucide-react'
import OrderProductSelector from '../components/OrderProductSelector'
import CartAndCheckoutForm, { CartItem } from '../components/CartAndCheckoutForm'

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
    const unitName = isBase ? product.base_unit : product.unit
    
    const calculatedUnitPrice = isBase
      ? Number(product.price) / product.conversion_rate
      : Number(product.price)

    setCart((prev) => {
      const cartKey = `${product.id}-${unitName}`
      const existing = prev.find(
        (item) => `${item.product.id}-${item.selectedUnit}` === cartKey
      )

      if (existing) {
        return prev.map((item) =>
          `${item.product.id}-${item.selectedUnit}` === cartKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [
        ...prev,
        {
          product,
          selectedUnit: unitName,
          isBaseUnit: isBase,
          quantity: 1,
          unitPrice: calculatedUnitPrice,
        },
      ]
    })
  }

  const updateQuantity = (cartKey: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (`${item.product.id}-${item.selectedUnit}` === cartKey) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  )

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cart.length === 0) return alert('Vui lòng chọn ít nhất 1 sản phẩm vào giỏ hàng!')
    if (!customerName.trim() && !storeName.trim()) return alert('Vui lòng điền Tên khách hàng HOẶC Tên quán!')
    if (!customerPhone.trim() || !customerAddress.trim()) return alert('Vui lòng nhập đầy đủ Số điện thoại và Địa chỉ giao hàng!')

    setIsSubmitting(true)
    try {
      const now = new Date()
      const yy = String(now.getFullYear()).slice(-2)
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const random4 = Math.floor(1000 + Math.random() * 9000)
      const orderCode = `ORD-${yy}${mm}${dd}-${random4}`

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_code: orderCode,
          customer_name: customerName.trim() || storeName.trim(),
          store_name: storeName.trim() || null,
          customer_phone: customerPhone.trim(),
          customer_address: customerAddress.trim(),
          total_amount: totalAmount,
          status: 'PENDING',
          notes: notes.trim() || null,
        })
        .select()
        .single()

      if (orderError) throw orderError

      for (const item of cart) {
        const subtotal = item.unitPrice * item.quantity
        const { error: itemError } = await supabase.from('order_items').insert({
          order_id: orderData.id,
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          subtotal: subtotal,
        })

        if (itemError) throw itemError
      }

      setSuccessCode(orderCode)
      setCart([])
      setCustomerName('')
      setStoreName('')
      setCustomerPhone('')
      setCustomerAddress('')
      setNotes('')
    } catch (error: any) {
      console.error('Lỗi khi tạo đơn:', error)
      alert(`Không thể tạo đơn hàng! Lỗi chi tiết: ${error.message || 'Lỗi không xác định'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="p-8 max-w-[1600px] mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Tạo Đơn Bán Sỉ (POS)</h1>
        <p className="text-sm text-slate-500">Lập đơn hàng B2B linh hoạt mua sỉ / mua lẻ theo đợt</p>
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