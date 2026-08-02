'use client'

import { Printer, X, CheckCircle2, QrCode, Phone, MapPin, Store, ShieldCheck } from 'lucide-react'
import { Order } from '@/types/database'
import { ExtendedOrderItem } from '@/app/(admin)/admin/orders/components/OrderDetailView'

interface InvoicePrintModalProps {
  isOpen: boolean
  onClose: () => void
  order: Order | null
  orderItems: Array<{
    name: string
    unit: string
    quantity: number
    price: number
    subtotal: number
  }>
  type?: 'CUSTOMER_INVOICE' | 'WAREHOUSE_PACKING_SLIP'
}

export default function InvoicePrintModal({
  isOpen,
  onClose,
  order,
  orderItems,
  type = 'CUSTOMER_INVOICE',
}: InvoicePrintModalProps) {
  if (!isOpen || !order) return null

  const handlePrint = () => {
    window.print()
  }

  const isWarehouse = type === 'WAREHOUSE_PACKING_SLIP'

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 relative my-auto">
        {/* THANH ĐIỀU HƯỚNG TẮT/IN - SẼ TỰ ĐỘNG ẨN KHI BẤM IN / LƯU PDF */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              {isWarehouse ? 'Xem Xem Phiếu Giao Hàng Kho' : 'Hóa Đơn Đặt Sỉ F&B (PDF/Print)'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              In / Tải PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* KHU VỰC NỘI DUNG HÓA ĐƠN / PHIẾU XUẤT KHO CHUẨN ĐỊNH DẠNG A5 / K80 IN ẤN */}
        {/* ==================================================================== */}
        <div className="print-area text-slate-900 p-2 sm:p-4 border border-slate-200 rounded-2xl bg-white space-y-5 text-xs">
          {/* HEADER STORE BRANDING */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 text-white font-black rounded-lg flex items-center justify-center text-xs">
                  F&B
                </div>
                <h2 className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 uppercase">
                  Hệ Thống Phân Phối Nguyên Liệu F&B B2B
                </h2>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" /> 123 Đường Nguyên Liệu, Q. Bình Thạnh, TP.HCM
              </p>
              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" /> Hotline/Zalo Đặt Sỉ: <strong>0989 830 347</strong>
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block font-mono font-bold text-xs bg-slate-100 px-2.5 py-1 rounded-lg text-blue-700">
                {order.order_code}
              </span>
              <p className="text-[10px] text-slate-400 mt-1">
                {new Date(order.created_at || Date.now()).toLocaleDateString('vi-VN')} {new Date(order.created_at || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* TIÊU ĐỀ PHIẾU GIẤY */}
          <div className="text-center space-y-1">
            <h1 className="text-base sm:text-lg font-black tracking-wide text-slate-900 uppercase">
              {isWarehouse ? 'PHIẾU GIAO HÀNG & XUẤT KHO' : 'HÓA ĐƠN XÁC NHẬN ĐẶT SỈ'}
            </h1>
            <p className="text-[10px] text-slate-500 italic">
              {isWarehouse ? '(Phiếu dán ngoài thùng hàng cho nhân viên giao vận)' : '(Cảm ơn Quý Chủ Quán đã ủng hộ nhà cung cấp F&B!)'}
            </p>
          </div>

          {/* THÔNG TIN KHÁCH HÀNG & NGƯỜI NHẬN */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div>
              <p className="text-slate-500">Khách hàng / Chủ quán:</p>
              <p className="font-bold text-slate-900 text-xs">
                {order.customer_name} {order.customer_name.includes('(') ? '' : order.notes?.includes('Quán') ? '' : ''}
              </p>
            </div>
            <div>
              <p className="text-slate-500">SĐT Zalo liên hệ:</p>
              <p className="font-mono font-bold text-blue-700 text-xs">{order.customer_phone}</p>
            </div>
            <div className="sm:col-span-2 border-t border-slate-200/60 pt-1.5">
              <p className="text-slate-500">Địa chỉ giao nhận nguyên liệu:</p>
              <p className="font-semibold text-slate-900">{order.customer_address}</p>
            </div>
            {order.notes && (
              <div className="sm:col-span-2 border-t border-slate-200/60 pt-1.5">
                <p className="text-slate-500">Ghi chú giao hàng:</p>
                <p className="italic text-slate-700 font-medium">{order.notes}</p>
              </div>
            )}
          </div>

          {/* BẢNG DANH SÁCH MÓN ĐẶT */}
          <div>
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-y border-slate-200">
                  <th className="py-2 px-2 w-8 text-center">STT</th>
                  {isWarehouse && <th className="py-2 px-2 w-10 text-center">Check</th>}
                  <th className="py-2 px-2">Sản Phẩm Nguyên Liệu</th>
                  <th className="py-2 px-2 text-center">ĐVT</th>
                  <th className="py-2 px-2 text-center">SL</th>
                  <th className="py-2 px-2 text-right">Đơn Giá</th>
                  <th className="py-2 px-2 text-right">Thành Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orderItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                    {isWarehouse && (
                      <td className="py-2 px-2 text-center">
                        <div className="w-4 h-4 border border-slate-400 rounded mx-auto" />
                      </td>
                    )}
                    <td className="py-2 px-2 font-semibold text-slate-900">{item.name}</td>
                    <td className="py-2 px-2 text-center text-slate-600">{item.unit}</td>
                    <td className="py-2 px-2 text-center font-bold text-blue-600">{item.quantity}</td>
                    <td className="py-2 px-2 text-right text-slate-600">
                      {Math.round(item.price).toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-slate-900">
                      {Math.round(item.subtotal).toLocaleString('vi-VN')}đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TỔNG TIỀN VÀ XÁC NHẬN */}
          <div className="border-t-2 border-slate-900 pt-3 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
            <div className="text-[10px] text-slate-500 space-y-0.5">
              <p className="font-semibold text-slate-700">📌 Quy định đổi trả & Kiểm nhận:</p>
              <p>• Quý khách vui lòng đồng kiểm nguyên liệu khi nhận hàng.</p>
              <p>• Hàng khô bảo quản nơi mát mẻ. Siro/Sốt đậy kín nắp sau khi mở.</p>
            </div>

            <div className="text-right shrink-0">
              <p className="text-xs text-slate-500 font-semibold">TỔNG THÀNH TIỀN HÓA ĐƠN:</p>
              <p className="text-lg sm:text-xl font-extrabold text-blue-700 font-mono">
                {Math.round(Number(order.total_amount)).toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
          </div>

          {/* CHỮ KÝ & MÃ QR CHUYỂN KHOÁN / ZALO */}
          <div className="pt-4 border-t border-dashed border-slate-200 grid grid-cols-2 gap-4 text-center text-[10px]">
            <div>
              <p className="font-bold text-slate-800">XÁC NHẬN KHÁCH HÀNG</p>
              <p className="text-slate-400 italic mt-8">(Ký & ghi rõ họ tên)</p>
            </div>
            <div>
              <p className="font-bold text-slate-800">ĐẠI DIỆN SOẠN KHO</p>
              <p className="text-slate-400 italic mt-8">(Ký & đóng dấu xuất kho)</p>
            </div>
          </div>
        </div>

        {/* NÚT ĐÓNG MODAL TRÊN MOBILE/DESKTOP */}
        <div className="no-print pt-2">
          <button
            onClick={onClose}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Đóng Cửa Sổ In
          </button>
        </div>
      </div>

      {/* STYLE CSS CHUYÊN DỤNG CHO PRINTING / XUẤT FILE PDF */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .no-print {
            display: none !important;
          }
          .print-area, .print-area * {
            visibility: visible !important;
          }
          .print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 15px !important;
            border: none !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  )
}
