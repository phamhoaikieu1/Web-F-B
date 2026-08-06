'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Order } from '@/types/database'
import OrderTable from './components/OrderTable'
import OrderDetailView, { ExtendedOrderItem } from './components/OrderDetailView'
import OrderRealtimeToast from './components/OrderRealtimeToast'
import MobileOrderDetailDrawer from './components/MobileOrderDetailDrawer'
import CancelOrderModal from './components/CancelOrderModal'
import InvoicePrintModal from '@/components/InvoicePrintModal'
import { useOrderRealtime } from './hooks/useOrderRealtime'
import { Volume2 } from 'lucide-react'
import { toast } from 'sonner'

export default function OrdersListPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const {
    orders,
    loading,
    realtimeToast,
    setRealtimeToast,
    fetchOrders,
    playNewOrderChime,
  } = useOrderRealtime()

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<ExtendedOrderItem[]>([])
  const [processingId, setProcessingId] = useState<string | null>(null)

  // STATE DÀNH CHO MOBILE DRAWER & PRINT TEM KHO & HỦY ĐƠN MODAL
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isPackingSlipOpen, setIsPackingSlipOpen] = useState(false)
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null)
  const [cancelReason, setCancelReason] = useState('')

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
    let actorName = 'Quản Lý Kho / Admin'
    if (user) {
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      if (p && p.full_name) actorName = p.full_name
    }
    return { userId: user?.id || null, actorName }
  }

  // BƯỚC 2: XÁC NHẬN & XUẤT KHO (PENDING → CONFIRMED -> TRỪ STOCK_QUANTITY IN PRODUCTS)
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
        const productPrice = Number(product.retail_price || product.wholesale_price || (product as any).price || (product as any).selling_price || 0)
        
        const isBaseUnit = itemUnitPrice < productPrice
        const baseQtyToDeduct = isBaseUnit
          ? Number(item.quantity)
          : Number(item.quantity) * Number(product.conversion_rate || 1)

        const { error: updateError } = await supabase
          .from('products')
          .update({
            stock_quantity: Number(product.stock_quantity) - baseQtyToDeduct,
          })
          .eq('id', product.id)

        if (updateError) throw updateError
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

  // BƯỚC 4: HỦY ĐƠN HÀNG (CANCELLED -> HOÀN TRẢ STOCK_QUANTITY NẾU ĐÃ DUYỆT XUẤT KHO)
  const handleConfirmCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cancelModalOrder || !cancelReason.trim()) {
      return toast.warning('Vui lòng nhập lý do hủy đơn hàng!')
    }

    setProcessingId(cancelModalOrder.id)
    try {
      const { userId, actorName } = await getActorInfo()
      const updatedNotes = `${cancelModalOrder.notes || ''} [LÝ DO HỦY: ${cancelReason.trim()}]`.trim()

      // Nếu đơn hàng đã xuất kho (CONFIRMED hoặc COMPLETED), cộng trả lại stock_quantity cho sản phẩm
      if (cancelModalOrder.status === 'CONFIRMED' || cancelModalOrder.status === 'COMPLETED') {
        const { data: items } = await supabase
          .from('order_items')
          .select('*, products(*)')
          .eq('order_id', cancelModalOrder.id)

        if (items) {
          for (const rawItem of items) {
            const item = rawItem as ExtendedOrderItem
            const product = item.products
            if (!product) continue

            const itemUnitPrice = Number(item.unit_price)
            const productPrice = Number(product.retail_price || product.wholesale_price || (product as any).price || (product as any).selling_price || 0)
            
            const isBaseUnit = itemUnitPrice < productPrice
            const baseQtyToRestore = isBaseUnit
              ? Number(item.quantity)
              : Number(item.quantity) * Number(product.conversion_rate || 1)

            await supabase
              .from('products')
              .update({
                stock_quantity: Number(product.stock_quantity) + baseQtyToRestore,
              })
              .eq('id', product.id)
          }
        }
      }

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

      toast.success(`Đã hủy đơn hàng ${cancelModalOrder.order_code} và hoàn lại tồn kho!`)
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
      <OrderRealtimeToast
        realtimeToast={realtimeToast}
        onClose={() => setRealtimeToast(null)}
      />

      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            Danh Sách Đơn Hàng B2B
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Realtime Active
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quy trình: PENDING (Đơn mới) ➔ CONFIRMED (Xuất kho) ➔ COMPLETED (Hoàn thành) | CANCELLED (Hủy đơn & Hoàn tồn)
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
          />
        </div>
      </div>

      {/* MOBILE DRAWER FULL SCREEN */}
      <MobileOrderDetailDrawer
        isOpen={isMobileDrawerOpen}
        selectedOrder={selectedOrder}
        orderItems={orderItems}
        processingId={processingId}
        onClose={() => setIsMobileDrawerOpen(false)}
        onFulfillOrder={handleFulfillOrder}
        onMarkAsPaid={handleMarkAsPaid}
        onCancelOrder={(o) => setCancelModalOrder(o)}
        onPrintPackingSlip={() => setIsPackingSlipOpen(true)}
      />

      {/* POPUP NHẬP LÝ DO HỦY ĐƠN HÀNG */}
      <CancelOrderModal
        order={cancelModalOrder}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        onClose={() => setCancelModalOrder(null)}
        onSubmit={handleConfirmCancelOrder}
      />

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