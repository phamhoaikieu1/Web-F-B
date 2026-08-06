'use client'

import { Order } from '@/types/database'
import { ArrowLeft, X } from 'lucide-react'
import OrderDetailView, { ExtendedOrderItem } from './OrderDetailView'

interface MobileOrderDetailDrawerProps {
  isOpen: boolean
  selectedOrder: Order | null
  orderItems: ExtendedOrderItem[]
  processingId: string | null
  onClose: () => void
  onFulfillOrder: (order: Order) => void
  onMarkAsPaid: (order: Order) => void
  onCancelOrder: (order: Order) => void
  onPrintPackingSlip: (order: Order) => void
}

export default function MobileOrderDetailDrawer({
  isOpen,
  selectedOrder,
  orderItems,
  processingId,
  onClose,
  onFulfillOrder,
  onMarkAsPaid,
  onCancelOrder,
  onPrintPackingSlip,
}: MobileOrderDetailDrawerProps) {
  if (!isOpen || !selectedOrder) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs lg:hidden flex justify-end">
      <div className="bg-white w-full max-w-lg h-full overflow-y-auto p-4 space-y-4 animate-in slide-in-from-right duration-300 shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <button
              onClick={onClose}
              className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <OrderDetailView
            selectedOrder={selectedOrder}
            orderItems={orderItems}
            processingId={processingId}
            onFulfillOrder={onFulfillOrder}
            onMarkAsPaid={onMarkAsPaid}
            onCancelOrder={onCancelOrder}
            onPrintPackingSlip={onPrintPackingSlip}
          />
        </div>
      </div>
    </div>
  )
}
