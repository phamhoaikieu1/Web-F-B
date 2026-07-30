'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Product, Order } from '@/types/database'
import OrderTable from './components/OrderTable'
import OrderDetailView, { ExtendedOrderItem } from './components/OrderDetailView'

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

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error('Lỗi lấy danh sách đơn:', error)
    else setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order)
    const { data, error } = await supabase
      .from('order_items')
      .select('*, products(*)')
      .eq('order_id', order.id)

    if (error) {
      console.error('Lỗi lấy chi tiết đơn:', error)
    } else if (data) {
      // Ép kiểu an toàn cho unit_price và subtotal
      const formattedItems: ExtendedOrderItem[] = data.map((item: any) => ({
        ...item,
        unit_price: Number(item.unit_price) || 0,
        subtotal: Number(item.subtotal) || 0,
      }))
      setOrderItems(formattedItems)
    }
  }

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

        // Ép Number() an toàn trước khi so sánh
        const itemUnitPrice = Number(item.unit_price)
        const productPrice = Number(product.price)
        
        // Kiểm tra xem đơn hàng đặt theo Đơn vị lẻ (BASE) hay Đơn vị sỉ (UNIT)
        const isBaseUnit = itemUnitPrice < productPrice
        const baseQtyToDeduct = isBaseUnit
          ? Number(item.quantity)
          : Number(item.quantity) * Number(product.conversion_rate)

        // 1. Trừ tồn kho sản phẩm
        const { error: updateError } = await supabase
          .from('products')
          .update({
            stock_quantity: Number(product.stock_quantity) - baseQtyToDeduct,
          })
          .eq('id', product.id)

        if (updateError) throw updateError

        // 2. Lưu vết Audit Trail
        const { data: { user } } = await supabase.auth.getUser()

        const { error: logError } = await supabase
          .from('inventory_transactions')
          .insert({
            product_id: product.id,
            type: 'EXPORT_ORDER',
            quantity: -baseQtyToDeduct,
            cost_price: Number(product.cost_price) || 0,
            reference_id: order.order_code,
            notes: `Xuất kho cho đơn hàng ${order.order_code}`,
            created_by: user?.id || null,
          })

        if (logError) throw logError
      }

      // 3. Chuyển trạng thái đơn sang COMPLETED
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({ status: 'COMPLETED', updated_at: new Date().toISOString() })
        .eq('id', order.id)

      if (orderUpdateError) throw orderUpdateError

      alert(`Đã xuất kho thành công đơn hàng ${order.order_code}!`)
      if (selectedOrder?.id === order.id) {
        setSelectedOrder({ ...selectedOrder, status: 'COMPLETED' })
      }
      fetchOrders()
    } catch (error: any) {
      console.error(error)
      alert(`Lỗi xuất kho: ${error.message || 'Có lỗi xảy ra'}`)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <main className="p-8 max-w-[1600px] mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Danh Sách Đơn Hàng B2B</h1>
        <p className="text-sm text-slate-500">
          Quản lý, xem chi tiết và duyệt xuất kho cho các đơn hàng PENDING
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <OrderTable
            orders={orders}
            loading={loading}
            onViewOrder={handleViewOrder}
          />
        </div>

        <div className="lg:col-span-5">
          <OrderDetailView
            selectedOrder={selectedOrder}
            orderItems={orderItems}
            processingId={processingId}
            onFulfillOrder={handleFulfillOrder}
          />
        </div>
      </div>
    </main>
  )
}