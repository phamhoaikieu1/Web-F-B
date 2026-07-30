'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, ArrowLeft, Trash2, CheckCircle2, Copy, Download, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { Product } from '@/types/database'
import CartItemList from './components/CartItemList'
import CheckoutForm from './components/CheckoutForm'

export interface CartItem {
  product: Product
  selectedUnit: string
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

  // State cho Modal Thành Công
  const [successOrder, setSuccessOrder] = useState<{
    orderCode: string
    totalAmount: number
    messageText: string
    zaloUrl: string
  } | null>(null)
  
  const [isCopied, setIsCopied] = useState(false)

  // Đọc thông tin khách hàng từ localStorage để tự động điền lại
  useEffect(() => {
    const savedCart = localStorage.getItem('b2b_cart')
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)) } catch (e) {}
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
    setCart(newCart)
    localStorage.setItem('b2b_cart', JSON.stringify(newCart))
  }

  const handleUpdateQuantity = (cartKey: string, delta: number) => {
    const updated = cart
      .map((item) => {
        if (`${item.product.id}-${item.selectedUnit}` === cartKey) {
          const newQty = item.quantity + delta
          return newQty > 0 ? { ...item, quantity: newQty } : null
        }
        return item
      })
      .filter(Boolean) as CartItem[]

    updateCart(updated)
  }

  const handleRemoveItem = (cartKey: string) => {
    updateCart(cart.filter((item) => `${item.product.id}-${item.selectedUnit}` !== cartKey))
  }

  const handleClearCart = () => {
    setCart([])
    localStorage.removeItem('b2b_cart')
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  // HÀM TẠO NỘI DUNG VĂN BẢN ĐƠN HÀNG
  const generateOrderMessage = (orderCode: string) => {
    const itemList = cart
      .map((i) => `• ${i.product.name}: ${i.quantity} ${i.selectedUnit} x ${Math.round(i.unitPrice).toLocaleString('vi-VN')}đ`)
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
    if (cart.length === 0) return alert('Giỏ hàng của bạn đang trống!')
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      return alert('Vui lòng điền đầy đủ Họ tên, SĐT Zalo và Địa chỉ giao hàng!')
    }

    setIsSubmitting(true)
    try {
      // Lưu thông tin khách để lần sau tự điền
      localStorage.setItem('b2b_customer_info', JSON.stringify({
        customerName, storeName, customerPhone, customerAddress
      }))

      const now = new Date()
      const orderCode = `ORD-${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`

      // 1. Lưu vào Database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_code: orderCode,
          customer_name: customerName.trim(),
          store_name: storeName.trim() || null,
          customer_phone: customerPhone.trim(),
          customer_address: customerAddress.trim(),
          total_amount: totalAmount,
          status: 'PENDING',
          notes: notes.trim() || 'Đơn hàng từ Trang Giỏ Hàng B2B',
        })
        .select()
        .single()

      if (orderError) throw orderError

      for (const item of cart) {
        await supabase.from('order_items').insert({
          order_id: orderData.id,
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          subtotal: item.unitPrice * item.quantity,
        })
      }

      // 2. Tạo nội dung văn bản & Link Zalo
      const messageText = generateOrderMessage(orderCode)
      const zaloUrl = `https://zalo.me/0989830347`

      // 3. Tự động Copy nội dung đơn hàng vào Clipboard
      try {
        await navigator.clipboard.writeText(messageText)
        setIsCopied(true)
      } catch (err) {
        console.error('Lỗi auto copy:', err)
      }

      // 4. Hiển thị Popup Đơn hàng Thành công
      setSuccessOrder({
        orderCode,
        totalAmount,
        messageText,
        zaloUrl,
      })

      handleClearCart()
    } catch (err: any) {
      alert(`Không thể khởi tạo đơn hàng: ${err.message || 'Lỗi kết nối'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // HÀM XUẤT HÓA ĐƠN DẠNG FILE FILE TEXT / HOẶC IN HÓA ĐƠN
  const handleDownloadInvoice = () => {
    if (!successOrder) return
    const element = document.createElement('a')
    const file = new Blob([successOrder.messageText], { type: 'text/plain;charset=utf-8' })
    element.href = URL.createObjectURL(file)
    element.download = `HoaDon_${successOrder.orderCode}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleCopyText = () => {
    if (!successOrder) return
    navigator.clipboard.writeText(successOrder.messageText)
    setIsCopied(true)
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

      {/* POPUP XÁC NHẬN ĐƠN HÀNG THÀNH CÔNG & CHUYỂN ZALO */}
      {successOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Khởi Tạo Đơn Hàng Thành Công!</h2>
              <p className="text-xs text-slate-500 font-mono">Mã đơn: <strong className="text-blue-600">{successOrder.orderCode}</strong></p>
            </div>

            {/* KHU VỰC HIỂN THỊ NỘI DUNG ĐƠN DẠNG HÓA ĐƠN */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono whitespace-pre-wrap text-slate-700 max-h-48 overflow-y-auto leading-relaxed">
              {successOrder.messageText}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 space-y-1">
              <p className="font-bold flex items-center gap-1">
                💡 BƯỚC CÒN LẠI ĐỂ CHỐT ĐƠN:
              </p>
              <p>Nội dung đơn hàng đã được <strong>tự động sao chép</strong>. Bạn hãy bấm nút bên dưới để mở Zalo Shop và bấm <strong>Dán (Ctrl + V)</strong> gửi tin nhắn nhé!</p>
            </div>

            <div className="space-y-2 pt-2">
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
                  onClick={handleDownloadInvoice}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải Phiếu Đơn (.txt)
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setSuccessOrder(null)
                router.push('/')
              }}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-semibold pt-2 block"
            >
              Về Trang Chủ Danh Mục
            </button>
          </div>
        </div>
      )}
    </main>
  )
}