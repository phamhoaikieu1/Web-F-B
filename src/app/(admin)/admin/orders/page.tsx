'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Product, Order } from '@/types/database'
import OrderTable from './components/OrderTable'
import OrderDetailView, { ExtendedOrderItem } from './components/OrderDetailView'
import InvoicePrintModal from '@/components/InvoicePrintModal'
import { Bell, Sparkles, X, Volume2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

// Hàm phát tiếng chuông báo hiệu Đơn Hàng Mới qua Web Audio API
function playNewOrderChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    
    // Nốt 1: D5 (587.33 Hz)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime)
    gain1.gain.setValueAtTime(0.25, ctx.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start()
    osc1.stop(ctx.currentTime + 0.25)

    // Nốt 2: A5 (880 Hz) phát ngay sau đó 0.15s
    setTimeout(() => {
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(880, ctx.currentTime)
      gain2.gain.setValueAtTime(0.3, ctx.currentTime)
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start()
      osc2.stop(ctx.currentTime + 0.4)
    }, 150)
  } catch (e) {
    console.warn('Không thể phát âm thanh thông báo:', e)
  }
}

export default function OrdersListPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<ExtendedOrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  // STATE DÀNH CHO MOBILE DRAWER & PRINT TEM KHO & HỦY ĐƠN MODAL
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isPackingSlipOpen, setIsPackingSlipOpen] = useState(false)
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  // STATE MODAL THANH TOÁN 1 PHẦN
  const [partialPaymentOrder, setPartialPaymentOrder] = useState<Order | null>(null)
  const [partialAmount, setPartialAmount] = useState('')

  // STATE DÀNH CHO REALTIME TOAST NOTIFICATION
  const [realtimeToast, setRealtimeToast] = useState<{
    orderCode: string
    customerName: string
    totalAmount: number
  } | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    const { data: profData } = await supabase.from('profiles').select('*')
    const profMap = new Map<string, string>()
    if (profData) {
      profData.forEach((p) => profMap.set(p.id, p.full_name))
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Lỗi lấy danh sách đơn:', error)
    } else if (data) {
      const formatted = data.map((o: any) => ({
        ...o,
        approved_by_name: o.approved_by_user_id ? profMap.get(o.approved_by_user_id) || 'Nhân sự' : o.approved_by_name || null,
        cancelled_by_name: o.cancelled_by_user_id ? profMap.get(o.cancelled_by_user_id) || 'Nhân sự' : o.cancelled_by_name || null,
        created_by_name: o.created_by_user_id ? profMap.get(o.created_by_user_id) || null : null,
        completed_by_name: o.completed_by_user_id ? profMap.get(o.completed_by_user_id) || o.completed_by_name : o.completed_by_name || null,
      }))
      setOrders(formatted)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()

    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order
            setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)])
            playNewOrderChime()
            setRealtimeToast({
              orderCode: newOrder.order_code,
              customerName: newOrder.customer_name,
              totalAmount: Number(newOrder.total_amount) || 0,
            })
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as Order
            setOrders((prev) =>
              prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
            )
            if (selectedOrder && selectedOrder.id === updatedOrder.id) {
              setSelectedOrder(updatedOrder)
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('⚡ Supabase Realtime Order Channel Connected Successfully!')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order)
    setIsMobileDrawerOpen(true)
    const { data, error } = await supabase
      .from('order_items')
      .select('*, products(*)')
      .eq('order_id', order.id)

    if (error) {
      console.error('Lỗi lấy chi tiết đơn:', error)
    } else if (data) {
      const formattedItems: ExtendedOrderItem[] = data.map((item: any) => ({
        ...item,
        unit_price: Number(item.unit_price) || 0,
        subtotal: Number(item.subtotal) || 0,
      }))
      setOrderItems(formattedItems)
    }
  }

  // Helper: Lấy thông tin nhân sự đang thao tác
  const getActorInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    let actorName = 'Nhân sự'
    if (user) {
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      if (p) actorName = p.full_name
    }
    return { userId: user?.id || null, actorName }
  }

  // BƯỚC 2: XÁC NHẬN & XUẤT KHO (PENDING → CONFIRMED)
  const handleFulfillOrder = async (order: Order) => {
    if (!confirm(`Xác nhận duyệt và xuất kho cho đơn hàng ${order.order_code}?`)) return

    setProcessingId(order.id)
    try {
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*, products(*)')
        .eq('order_id', order.id)

      if (itemsError || !items) throw new Error('Không thể lấy chi tiết đơn hàng')

      for (const rawItem of items) {
        const item = rawItem as ExtendedOrderItem
        const product = item.products
        if (!product) continue

        const itemUnitPrice = Number(item.unit_price)
        const productPrice = Number(product.price)
        
        const isBaseUnit = itemUnitPrice < productPrice
        const baseQtyToDeduct = isBaseUnit
          ? Number(item.quantity)
          : Number(item.quantity) * Number(product.conversion_rate)

        const { error: updateError } = await supabase
          .from('products')
          .update({
            stock_quantity: Number(product.stock_quantity) - baseQtyToDeduct,
          })
          .eq('id', product.id)

        if (updateError) throw updateError

        const { userId } = await getActorInfo()

        const { error: logError } = await supabase
          .from('inventory_transactions')
          .insert({
            product_id: product.id,
            type: 'EXPORT_ORDER',
            quantity: -baseQtyToDeduct,
            cost_price: Number(product.cost_price) || 0,
            reference_id: order.order_code,
            notes: `Xuất kho cho đơn hàng ${order.order_code}`,
            created_by: userId,
          })

        if (logError) throw logError
      }

      const { userId, actorName } = await getActorInfo()

      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({
          status: 'CONFIRMED',
          approved_by_user_id: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)

      if (orderUpdateError) throw orderUpdateError

      // Ghi log vào system_audit_logs
      await supabase.from('system_audit_logs').insert({
        actor_id: userId,
        actor_name: actorName,
        target_name: `Đơn hàng ${order.order_code}`,
        action: 'XÁC NHẬN & XUẤT KHO',
        details: `Duyệt xuất kho cho đơn hàng sỉ ${order.order_code} (Tổng tiền: ${Number(order.total_amount).toLocaleString('vi-VN')}đ)`,
      })

      toast.success(`Đã xác nhận & xuất kho thành công đơn hàng ${order.order_code}!`)
      if (selectedOrder?.id === order.id) {
        setSelectedOrder({ ...selectedOrder, status: 'CONFIRMED', approved_by_name: actorName } as Order)
      }
      fetchOrders()
    } catch (error: any) {
      console.error(error)
      toast.error(`Lỗi xuất kho: ${error.message || 'Có lỗi xảy ra'}`)
    } finally {
      setProcessingId(null)
    }
  }

  // BƯỚC 3: XÁC NHẬN ĐÃ NHẬN TIỀN / HOÀN THÀNH (CONFIRMED → COMPLETED)
  const handleMarkAsPaid = async (order: Order) => {
    setProcessingId(order.id)
    try {
      const { userId, actorName } = await getActorInfo()

      const { error } = await supabase
        .from('orders')
        .update({
          status: 'COMPLETED',
          payment_status: 'PAID',
          paid_amount: Number(order.total_amount),
          completed_by_user_id: userId,
          completed_by_name: actorName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)

      if (error) throw error

      await supabase.from('system_audit_logs').insert({
        actor_id: userId,
        actor_name: actorName,
        target_name: `Đơn hàng ${order.order_code}`,
        action: 'HOÀN THÀNH ĐƠN HÀNG',
        details: `Xác nhận đã nhận đủ tiền và hoàn thành đơn hàng ${order.order_code}`,
      })

      toast.success(`Đơn hàng ${order.order_code} đã hoàn tất thanh toán!`)
      if (selectedOrder?.id === order.id) {
        setSelectedOrder({ ...selectedOrder, status: 'COMPLETED', payment_status: 'PAID', completed_by_name: actorName } as Order)
      }
      fetchOrders()
    } catch (err: any) {
      toast.error(`Lỗi cập nhật: ${err.message}`)
    } finally {
      setProcessingId(null)
    }
  }

  // GHI NỢ GỐI ĐẦU (CONFIRMED → COMPLETED + DEBT)
  const handleMarkAsDebt = async (order: Order) => {
    if (!confirm(`Xác nhận GHI NỢ GỐI ĐẦU cho đơn hàng ${order.order_code}? Đơn sẽ chuyển sang Hoàn Thành nhưng công nợ vẫn tồn tại.`)) return

    setProcessingId(order.id)
    try {
      const { userId, actorName } = await getActorInfo()

      const { error } = await supabase
        .from('orders')
        .update({
          status: 'COMPLETED',
          payment_status: 'DEBT',
          completed_by_user_id: userId,
          completed_by_name: actorName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)

      if (error) throw error

      await supabase.from('system_audit_logs').insert({
        actor_id: userId,
        actor_name: actorName,
        target_name: `Đơn hàng ${order.order_code}`,
        action: 'GHI NỢ GỐI ĐẦU',
        details: `Ghi nợ gối đầu cho đơn hàng ${order.order_code} (Công nợ: ${Number(order.total_amount).toLocaleString('vi-VN')}đ)`,
      })

      toast.success(`Đã ghi nợ gối đầu cho đơn hàng ${order.order_code}`)
      if (selectedOrder?.id === order.id) {
        setSelectedOrder({ ...selectedOrder, status: 'COMPLETED', payment_status: 'DEBT', completed_by_name: actorName } as Order)
      }
      fetchOrders()
    } catch (err: any) {
      toast.error(`Lỗi ghi nợ: ${err.message}`)
    } finally {
      setProcessingId(null)
    }
  }

  // THANH TOÁN 1 PHẦN
  const handleConfirmPartialPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!partialPaymentOrder || !partialAmount) return

    const amount = Number(partialAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.warning('Vui lòng nhập số tiền hợp lệ!')
      return
    }

    setProcessingId(partialPaymentOrder.id)
    try {
      const { userId, actorName } = await getActorInfo()
      const currentPaid = Number(partialPaymentOrder.paid_amount) || 0
      const newPaidTotal = currentPaid + amount
      const orderTotal = Number(partialPaymentOrder.total_amount)

      const newPaymentStatus = newPaidTotal >= orderTotal ? 'PAID' : 'PARTIAL'
      const newStatus = newPaidTotal >= orderTotal ? 'COMPLETED' : partialPaymentOrder.status

      const updateData: Record<string, unknown> = {
        payment_status: newPaymentStatus,
        paid_amount: newPaidTotal,
        updated_at: new Date().toISOString(),
      }

      if (newStatus === 'COMPLETED') {
        updateData.status = 'COMPLETED'
        updateData.completed_by_user_id = userId
        updateData.completed_by_name = actorName
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', partialPaymentOrder.id)

      if (error) throw error

      await supabase.from('system_audit_logs').insert({
        actor_id: userId,
        actor_name: actorName,
        target_name: `Đơn hàng ${partialPaymentOrder.order_code}`,
        action: 'THANH TOÁN 1 PHẦN',
        details: `Ghi nhận thanh toán ${amount.toLocaleString('vi-VN')}đ cho đơn ${partialPaymentOrder.order_code}. Tổng đã trả: ${newPaidTotal.toLocaleString('vi-VN')}đ / ${orderTotal.toLocaleString('vi-VN')}đ`,
      })

      toast.success(`Đã ghi nhận thanh toán ${amount.toLocaleString('vi-VN')}đ cho đơn ${partialPaymentOrder.order_code}`)
      setPartialPaymentOrder(null)
      setPartialAmount('')
      fetchOrders()
    } catch (err: any) {
      toast.error(`Lỗi: ${err.message}`)
    } finally {
      setProcessingId(null)
    }
  }

  // HỦY ĐƠN HÀNG (CANCELLED) KÈM LÝ DO
  const handleConfirmCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cancelModalOrder || !cancelReason.trim()) {
      return toast.warning('Vui lòng nhập lý do hủy đơn hàng!')
    }

    setProcessingId(cancelModalOrder.id)
    try {
      const { userId, actorName } = await getActorInfo()
      const updatedNotes = `${cancelModalOrder.notes || ''} [LÝ DO HỦY: ${cancelReason.trim()}]`.trim()

      const { error } = await supabase
        .from('orders')
        .update({
          status: 'CANCELLED',
          notes: updatedNotes,
          cancelled_by_user_id: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cancelModalOrder.id)

      if (error) throw error

      await supabase.from('system_audit_logs').insert({
        actor_id: userId,
        actor_name: actorName,
        target_name: `Đơn hàng ${cancelModalOrder.order_code}`,
        action: 'HỦY ĐƠN HÀNG',
        details: `Hủy đơn hàng ${cancelModalOrder.order_code} - Lý do: ${cancelReason.trim()}`,
      })

      toast.success(`Đã hủy đơn hàng ${cancelModalOrder.order_code}`)
      if (selectedOrder?.id === cancelModalOrder.id) {
        setSelectedOrder({ ...selectedOrder, status: 'CANCELLED', notes: updatedNotes, cancelled_by_name: actorName } as Order)
      }
      setCancelModalOrder(null)
      setCancelReason('')
      fetchOrders()
    } catch (err: any) {
      toast.error(`Không thể hủy đơn: ${err.message}`)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <main className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-6 relative">
      {/* REALTIME TOAST NOTIFICATION CHO ĐƠN HÀNG MỚI */}
      {realtimeToast && (
        <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-blue-900 to-indigo-900 text-white border border-blue-400/40 p-4 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-blue-300 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Realtime Order
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white mt-1">Đơn hàng sỉ mới vừa cập bến!</h4>
                <p className="text-xs text-blue-200 font-mono mt-0.5">
                  Mã: <strong className="text-white">{realtimeToast.orderCode}</strong> - Khách: <strong className="text-white">{realtimeToast.customerName}</strong>
                </p>
                <p className="text-xs text-emerald-400 font-bold mt-1">
                  Giá trị: {realtimeToast.totalAmount.toLocaleString('vi-VN')} VNĐ
                </p>
              </div>
            </div>

            <button
              onClick={() => setRealtimeToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            Danh Sách Đơn Hàng B2B
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Realtime Active
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quy trình 3 bước: PENDING ➔ CONFIRMED (Xuất kho) ➔ COMPLETED (Hoàn thành) | Quản lý công nợ B2B
          </p>
        </div>

        <button
          onClick={() => playNewOrderChime()}
          className="text-xs text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer font-semibold shrink-0"
          title="Thử âm thanh thông báo chuông Realtime"
        >
          <Volume2 className="w-4 h-4 text-blue-600" /> Thử Chuông Báo
        </button>
      </header>

      {/* LAYOUT CHÍNH: DESKTOP (2 CỘT) VS MOBILE (LIST + DRAWER) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <OrderTable
            orders={orders}
            loading={loading}
            onViewOrder={handleViewOrder}
          />
        </div>

        {/* CỘT CHI TIẾT TRÊN DESKTOP (HIDDEN ON MOBILE) */}
        <div className="hidden lg:block lg:col-span-5">
          <OrderDetailView
            selectedOrder={selectedOrder}
            orderItems={orderItems}
            processingId={processingId}
            onFulfillOrder={handleFulfillOrder}
            onMarkAsPaid={handleMarkAsPaid}
            onCancelOrder={(o) => setCancelModalOrder(o)}
            onPrintPackingSlip={() => setIsPackingSlipOpen(true)}
            onMarkAsDebt={handleMarkAsDebt}
            onRecordPartialPayment={(o) => setPartialPaymentOrder(o)}
          />
        </div>
      </div>

      {/* MOBILE DRAWER FULL SCREEN */}
      {isMobileDrawerOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs lg:hidden flex justify-end">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto p-4 space-y-4 animate-in slide-in-from-right duration-300 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                </button>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <OrderDetailView
                selectedOrder={selectedOrder}
                orderItems={orderItems}
                processingId={processingId}
                onFulfillOrder={handleFulfillOrder}
                onMarkAsPaid={handleMarkAsPaid}
                onCancelOrder={(o) => setCancelModalOrder(o)}
                onPrintPackingSlip={() => setIsPackingSlipOpen(true)}
                onMarkAsDebt={handleMarkAsDebt}
                onRecordPartialPayment={(o) => setPartialPaymentOrder(o)}
              />
            </div>
          </div>
        </div>
      )}

      {/* POPUP NHẬP LÝ DO HỦY ĐƠN HÀNG */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmCancelOrder}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Xác Nhận Hủy Đơn Hàng</h3>
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Bạn có chắc chắn muốn hủy đơn hàng <strong className="font-mono text-blue-600">{cancelModalOrder.order_code}</strong>?
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Lý do hủy đơn (*):</label>
              <textarea
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ví dụ: Khách báo đổi địa chỉ, hết tồn kho siro,..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-rose-500 focus:bg-white transition-colors h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Bỏ qua
              </button>
              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
              >
                Xác Nhận Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL THANH TOÁN 1 PHẦN */}
      {partialPaymentOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmPartialPayment}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Ghi Nhận Thanh Toán 1 Phần</h3>
              <button
                type="button"
                onClick={() => setPartialPaymentOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <p>Đơn hàng: <strong className="font-mono text-blue-600">{partialPaymentOrder.order_code}</strong></p>
              <p>Tổng tiền: <strong className="text-slate-900">{Number(partialPaymentOrder.total_amount).toLocaleString('vi-VN')} đ</strong></p>
              <p>Đã thanh toán: <strong className="text-emerald-600">{Number(partialPaymentOrder.paid_amount || 0).toLocaleString('vi-VN')} đ</strong></p>
              <p>Còn lại: <strong className="text-rose-600">{(Number(partialPaymentOrder.total_amount) - Number(partialPaymentOrder.paid_amount || 0)).toLocaleString('vi-VN')} đ</strong></p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Số tiền thanh toán lần này (VNĐ):</label>
              <input
                type="number"
                required
                value={partialAmount}
                onChange={(e) => setPartialAmount(e.target.value)}
                placeholder="Ví dụ: 500000"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPartialPaymentOrder(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
              >
                Xác Nhận Thanh Toán
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL IN PHIẾU GIAO HÀNG / TEM KHO */}
      {selectedOrder && (
        <InvoicePrintModal
          isOpen={isPackingSlipOpen}
          onClose={() => setIsPackingSlipOpen(false)}
          order={selectedOrder}
          orderItems={orderItems.map((i) => ({
            name: i.products?.name || i.product_id,
            unit: i.products?.unit || 'Món',
            quantity: i.quantity,
            price: i.unit_price,
            subtotal: i.subtotal,
          }))}
          type="WAREHOUSE_PACKING_SLIP"
        />
      )}
    </main>
  )
}