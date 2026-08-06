'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bot,
  Sparkles,
  Send,
  X,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  MessageSquare,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Store,
} from 'lucide-react'
import { addItemToB2bCart, getCartItems } from '@/lib/cart'
import { toast } from 'sonner'

interface ProductRecommendation {
  id: string
  name: string
  unit: string
  price: number
  quantity: number
}

interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  text: string
  timestamp: string
  recommendedProducts?: ProductRecommendation[]
}

const QUICK_PROMPTS = [
  '⚡ Công thức 100 ly Trà Sữa',
  '🍹 Siro & Trà Trái Cây',
  '📦 Quy đổi giá sỉ theo Thùng',
]

export default function AiChatWidget() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Xin chào Quý Chủ Quán! 👋 

Tôi là **Trợ lý AI Đặt Sỉ F&B B2B**. 

Tôi có thể giúp Bạn:
- 🧮 **Tính lượng nguyên liệu** pha chế cho số ly quán bán mỗi ngày.
- 📦 **Tư vấn giá sỉ & quy đổi đơn vị** (Thùng/Bao/Chai).
- 🛒 **Tự động thêm nguyên liệu vào giỏ** & gửi đơn Zalo siêu tốc.

Hãy nhập thắc mắc hoặc chọn câu hỏi gợi ý bên dưới nhé!`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  // Lắng nghe biến động giỏ hàng để hiển thị số lượng badge trên nút Zalo/Giỏ
  useEffect(() => {
    const updateCount = () => {
      const cart = getCartItems()
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0))
    }
    updateCount()
    window.addEventListener('storage', updateCount)
    window.addEventListener('b2b_cart_updated', updateCount)
    return () => {
      window.removeEventListener('storage', updateCount)
      window.removeEventListener('b2b_cart_updated', updateCount)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage
    if (!query.trim() || isLoading) return

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-4),
        }),
      })

      const data = await response.json()

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: data.text || 'Cảm ơn Bạn đã liên hệ. Tôi có thể hỗ trợ gì thêm cho đơn hàng sỉ của quán?',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        recommendedProducts: data.recommendedProducts || [],
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch (error) {
      console.error('Lỗi kết nối AI Assistant:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Rất tiếc, đã có gián đoạn kết nối. Bạn có thể gọi trực tiếp hotline B2B hoặc thử lại sau ít phút!',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCartFromAi = (prod: ProductRecommendation, qty: number) => {
    const mockProduct = {
      id: prod.id,
      category_id: 'cat-gen',
      name: prod.name,
      sku: 'AI-REC',
      unit: prod.unit || 'gói',
      base_unit: prod.unit || 'gói',
      conversion_rate: 1,
      retail_price: prod.price,
      wholesale_price: prod.price,
      wholesale_min_qty: 1,
      cost_price: prod.price * 0.7,
      stock_quantity: 999,
      min_stock_alert: 10,
    }

    addItemToB2bCart(mockProduct, qty)
    toast.success(`Đã thêm ${qty} ${prod.unit} ${prod.name} vào giỏ hàng!`)
  }

  return (
    <>
      {/* BUTTON NỔI BẬT AI CHATBOT Ở GÓC PHẢI DƯỚI (MÀN MOBILE TRÁNH MOBILE BOTTOM NAV BẰNG bottom-20) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 group flex items-center gap-3 bg-gradient-to-r from-emerald-700 via-teal-600 to-blue-600 text-white p-3.5 pl-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-white/20 active:scale-95"
          aria-label="Mở Trợ lý AI Đặt Sỉ B2B"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
          </div>
          <div className="hidden sm:flex flex-col text-left pr-1">
            <span className="text-[11px] font-bold tracking-wider uppercase opacity-90 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" /> AI Sales Assistant
            </span>
            <span className="text-xs font-extrabold">Trợ lý Đặt Sỉ B2B</span>
          </div>
        </button>
      )}

      {/* KHUNG CỬA SỔ CHATBOT */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* HEADER CHATBOT */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg border border-white/20">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  Trợ Lý AI Đặt Sỉ F&B
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                </h3>
                <p className="text-[10px] text-blue-200">Tư vấn định lượng & báo giá sỉ 24/7</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white cursor-pointer"
                title="Thu nhỏ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* KHU VỰC CÂU HỎI GỢI Ý NHANH */}
          <div className="bg-slate-50 border-b border-slate-200 p-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="text-[11px] font-semibold text-slate-700 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-300 px-3 py-1.5 rounded-full transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* DANH SÁCH TIN NHẮN */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* HIỂN THỊ NGUYÊN LIỆU ĐƯỢC AI ĐỀ XUẤT */}
                  {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                      <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-blue-600" /> Sản phẩm gợi ý đặt sỉ:
                      </p>
                      {msg.recommendedProducts.map((prod, pIdx) => (
                        <div
                          key={pIdx}
                          className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 truncate text-[11px]">{prod.name}</p>
                            <p className="text-[10px] text-slate-500">
                              {Number(prod.price).toLocaleString('vi-VN')}đ / {prod.unit}
                            </p>
                          </div>
                          <button
                            onClick={() => handleAddToCartFromAi(prod, prod.quantity || 1)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                          >
                            <Plus className="w-3 h-3" /> Giỏ hàng
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <span
                    className={`text-[9px] block mt-1 text-right ${
                      msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs bg-white p-3 rounded-2xl border border-slate-200 w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>AI đang phân tích định lượng...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* CHÂN KHUNG CHAT - NÚT TẮT ĐẾN GIỎ HÀNG / ZALO & INPUT */}
          <div className="p-3 bg-white border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-[11px] px-1">
              <button
                onClick={() => router.push('/cart')}
                className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Xem Giỏ Hàng ({cartCount})
              </button>

              <button
                onClick={() => router.push('/cart')}
                className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 cursor-pointer"
              >
                <MessageSquare className="w-3 h-3 text-emerald-600" />
                Gửi Zalo Duyệt Đơn
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Hỏi định lượng, công thức hoặc giá sỉ..."
                className="flex-1 bg-slate-100 hover:bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 outline-none transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
