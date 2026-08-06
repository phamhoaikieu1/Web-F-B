'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, ArrowLeft, Trash2, CheckCircle2, Copy, Printer, MessageSquare, ExternalLink } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { Product, Order } from '@/types/database'
import { toast } from 'sonner'
import CartItemList from './components/CartItemList'
import CheckoutForm from './components/CheckoutForm'
import InvoicePrintModal from '@/components/InvoicePrintModal'
import { getB2BUnitPrice, formatUnitQuantityBreakdown } from '@/lib/pricing'

export interface CartItem {
  product: Product
  quantity: number
  unitPrice: number
}

export default function CartPage() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [storeName, setStoreName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State cho Modal Thành Công & Modal In Hóa Đơn PDF
  const [successOrder, setSuccessOrder] = useState<{
    orderCode: string
    totalAmount: number
    messageText: string
    zaloUrl: string
    createdOrderObj: Order
    createdOrderItems: Array<{ name: string; unit: string; quantity: number; price: number; subtotal: number }>
  } | null>(null)
  
  const [isCopied, setIsCopied] = useState(false)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)

  // Đọc giỏ hàng và thông tin khách hàng từ localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('b2b_cart')
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart)
        // Cập nhật lại unitPrice theo BR-01
        const updated = parsed.map((item: CartItem) => ({
          ...item,
          unitPrice: getB2BUnitPrice(item.product, item.quantity),
        }))
        setCart(updated)
      } catch (e) {}
    }

    const savedInfo = localStorage.getItem('b2b_customer_info')
    if (savedInfo) {
      try {
        const info = JSON.parse(savedInfo)
        setCustomerName(info.customerName || '')
        setStoreName(info.storeName || '')
        setCustomerPhone(info.customerPhone || '')
        setCustomerAddress(info.customerAddress || '')
      } catch (e) {}
    }
  }, [])

  const updateCart = (newCart: CartItem[]) => {
    // Tự động tính lại đơn giá B2B theo BR-01 mỗi khi số lượng thay đổi
    const recalculated = newCart.map((item) => ({
      ...item,
      unitPrice: getB2BUnitPrice(item.product, item.quantity),
    }))
    setCart(recalculated)
    localStorage.setItem('b2b_cart', JSON.stringify(recalculated))
    window.dispatchEvent(new Event('storage'))
  }

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta
          return newQty > 0 ? { ...item, quantity: newQty } : null
        }
        return item
      })
      .filter(Boolean) as CartItem[]

    updateCart(updated)
  }

  const handleRemoveItem = (productId: string) => {
    updateCart(cart.filter((item) => item.product.id !== productId))
    toast.info('Đã xóa sản phẩm khỏi giỏ hàng')
  }

  const handleClearCart = () => {
    setCart([])
    localStorage.removeItem('b2b_cart')
    window.dispatchEvent(new Event('storage'))
  }

  const totalAmount = cart.reduce((sum, item) => {
    const unitPrice = getB2BUnitPrice(item.product, item.quantity)
    return sum + unitPrice * item.quantity
  }, 0)

  // HÀM TẠO NỘI DUNG VĂN BẢN ĐƠN HÀNG
  const generateOrderMessage = (orderCode: string) => {
    const itemList = cart
      .map((i) => {
        const uPrice = getB2BUnitPrice(i.product, i.quantity)
        const breakdown = formatUnitQuantityBreakdown(i.product, i.quantity)
        return `• ${i.product.name}: ${breakdown} x ${Math.round(uPrice).toLocaleString('vi-VN')}đ/${i.product.base_unit}`
      })
      .join('\n')

    return `🛒 [ĐƠN ĐẶT HÀNG MỚI - MÃ: ${orderCode}]
👤 Khách hàng/Chủ quán: ${customerName}${storeName ? ` (${storeName})` : ''}
📞 SĐT Zalo: ${customerPhone}
📍 Địa chỉ giao hàng: ${customerAddress}
${notes ? `📝 Ghi chú: ${notes}\n` : ''}
📋 DANH SÁCH SẢN PHẨM:
${itemList}

💰 TỔNG THÀNH TIỀN: ${Math.round(totalAmount).toLocaleString('vi-VN')} VNĐ
---
Nhờ Shop xác nhận và soạn hàng giúp tôi!`
  }

  // XỬ LÝ CHỐT ĐƠN HÀNG
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return toast.warning('Giỏ hàng của bạn đang trống!')
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      return toast.warning('Vui lòng điền đầy đủ Họ tên, SĐT Zalo và Địa chỉ giao hàng!')
    }

    setIsSubmitting(true)
    try {
      // Lưu thông tin khách để lần sau tự điền
      localStorage.setItem('b2b_customer_info', JSON.stringify({
        customerName, storeName, customerPhone, customerAddress
      }))

      const now = new Date()
      const dd = String(now.getDate()).padStart(2, '0')
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const yy = String(now.getFullYear()).slice(-2)
      const orderCode = `ORD-${dd}${mm}${yy}-${Math.floor(1000 + Math.random() * 9000)}`

      // 1. Lưu Đơn Hàng vào Database (orders)
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_code: orderCode,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          customer_address: customerAddress.trim(),
          store_name: storeName.trim() || null,
          total_amount: totalAmount,
          status: 'PENDING',
          notes: notes.trim() || 'Đơn hàng từ Trang Giỏ Hàng B2B',
        })
        .select()
        .single()

      if (orderError) throw orderError

      const formattedOrderItems: Array<{ name: string; unit: string; quantity: number; price: number; subtotal: number }> = []

      // 2. Chốt Snapshot Đơn Giá (unit_price), Giá Vốn MAC (cost_price) & Subtotal vào order_items
      for (const item of cart) {
        const unitPrice = getB2BUnitPrice(item.product, item.quantity)
        const subtotal = unitPrice * item.quantity
        const macCostPrice = Number(item.product.avg_cost_price ?? item.product.cost_price ?? 0)

        const { error: itemErr } = await supabase.from('order_items').insert({
          order_id: orderData.id,
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: unitPrice,
          cost_price: macCostPrice,
          subtotal: subtotal,
        })

        if (itemErr) throw itemErr

        formattedOrderItems.push({
          name: item.product.name,
          unit: item.product.base_unit,
          quantity: item.quantity,
          price: unitPrice,
          subtotal: subtotal,
        })
      }

      // 3. Tạo nội dung văn bản & Link Zalo
      const messageText = generateOrderMessage(orderCode)
      const zaloUrl = `https://zalo.me/0989830347`

      // 4. Tự động Copy nội dung đơn hàng vào Clipboard
      try {
        await navigator.clipboard.writeText(messageText)
        setIsCopied(true)
        toast.success('Đã tự động sao chép nội dung đơn hàng!')
      } catch (err) {
        console.error('Lỗi auto copy:', err)
      }

      // 5. Hiển thị Popup / Mobile Bottom Sheet Đơn hàng Thành công
      setSuccessOrder({
        orderCode,
        totalAmount,
        messageText,
        zaloUrl,
        createdOrderObj: orderData,
        createdOrderItems: formattedOrderItems,
      })

      toast.success(`Khởi tạo đơn hàng ${orderCode} thành công!`)
      handleClearCart()
    } catch (err: any) {
      toast.error(`Không thể khởi tạo đơn hàng: ${err.message || 'Lỗi kết nối'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyText = () => {
    if (!successOrder) return
    navigator.clipboard.writeText(successOrder.messageText)
    setIsCopied(true)
    toast.success('Đã sao chép nội dung đơn hàng!')
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <main className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Tiếp tục xem sản phẩm
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-blue-600" /> Giỏ Hàng Đặt Sỉ B2B
          </h1>
        </div>
        {cart.length > 0 && (
          <button
            onClick={handleClearCart}
            className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <CartItemList
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />
        </div>

        <div className="lg:col-span-5">
          <CheckoutForm
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
            totalAmount={totalAmount}
            itemCount={cart.length}
            isSubmitting={isSubmitting}
            onSubmit={handleCheckout}
          />
        </div>
      </div>

      {/* POPUP / MOBILE BOTTOM SHEET XÁC NHẬN ĐƠN HÀNG THÀNH CÔNG */}
      {successOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom duration-300 max-h-[92vh] overflow-y-auto">
            {/* VẠCH TRƯỢT DỄ VUỐT TRÊN MOBILE */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto sm:hidden mb-1" />

            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Khởi Tạo Đơn Hàng Thành Công!</h2>
              <p className="text-xs text-slate-500 font-mono">Mã đơn: <strong className="text-blue-600">{successOrder.orderCode}</strong></p>
            </div>

            {/* KHU VỰC HIỂN THỊ NỘI DUNG ĐƠN DẠNG HÓA ĐƠN */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono whitespace-pre-wrap text-slate-700 max-h-40 overflow-y-auto leading-relaxed">
              {successOrder.messageText}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 space-y-1">
              <p className="font-bold flex items-center gap-1">
                💡 BƯỚC CÒN LẠI ĐỂ CHỐT ĐƠN:
              </p>
              <p>Nội dung đơn hàng đã được <strong>tự động sao chép</strong>. Bạn hãy bấm nút bên dưới để mở Zalo Shop và bấm <strong>Dán (Ctrl + V)</strong> gửi tin nhắn nhé!</p>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={successOrder.zaloUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                MỞ ZALO CHÁT VỚI SHOP NGAY
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {isCopied ? 'Đã Sao Chép!' : 'Sao Chép Lại'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  In Hóa Đơn (PDF)
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setSuccessOrder(null)
                router.push('/')
              }}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-semibold pt-2 block cursor-pointer"
            >
              Về Trang Chủ Danh Mục
            </button>
          </div>
        </div>
      )}

      {/* MODAL IN HÓA ĐƠN PDF CHUYÊN NGHIỆP */}
      {successOrder && (
        <InvoicePrintModal
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          order={successOrder.createdOrderObj}
          orderItems={successOrder.createdOrderItems}
          type="CUSTOMER_INVOICE"
        />
      )}
    </main>
  )
}