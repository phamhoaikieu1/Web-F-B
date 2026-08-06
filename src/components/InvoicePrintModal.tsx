'use client'

import { useState } from 'react'
import { Printer, Download, X, MapPin, Phone } from 'lucide-react'
import { Order } from '@/types/database'
import html2canvas from 'html2canvas'
import { toast } from 'sonner'

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
  const [isCapturing, setIsCapturing] = useState(false)

  if (!isOpen || !order) return null

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadImage = async () => {
    const printArea = document.querySelector('.print-area') as HTMLElement
    if (!printArea) return

    setIsCapturing(true)
    try {
      const canvas = await html2canvas(printArea, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // 1. Loại bỏ/thay thế các hàm màu lab() hoặc oklch() trong toàn bộ style tag của bản clone
          const styleTags = clonedDoc.querySelectorAll('style')
          styleTags.forEach((tag) => {
            if (tag.textContent && (tag.textContent.includes('lab(') || tag.textContent.includes('oklch('))) {
              tag.textContent = tag.textContent
                .replace(/lab\([^)]+\)/g, '#0f172a')
                .replace(/oklch\([^)]+\)/g, '#0f172a')
            }
          })

          // 2. Ép trực tiếp tất cả các phần tử trong khung print-area về mã màu Hex/RGB an toàn
          const clonedElement = clonedDoc.querySelector('.print-area') as HTMLElement
          if (clonedElement) {
            clonedElement.style.backgroundColor = '#ffffff'
            clonedElement.style.color = '#0f172a'

            const allChildElements = clonedElement.querySelectorAll('*')
            allChildElements.forEach((el: Element) => {
              const htmlEl = el as HTMLElement
              const style = window.getComputedStyle(htmlEl)

              if (style.color && (style.color.includes('lab') || style.color.includes('oklch'))) {
                htmlEl.style.color = '#0f172a'
              }
              if (style.backgroundColor && (style.backgroundColor.includes('lab') || style.backgroundColor.includes('oklch'))) {
                htmlEl.style.backgroundColor = '#ffffff'
              }
              if (style.borderColor && (style.borderColor.includes('lab') || style.borderColor.includes('oklch'))) {
                htmlEl.style.borderColor = '#e2e8f0'
              }
            })
          }
        },
      })

      const image = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = image
      link.download = `HoaDon_${order.order_code}.png`
      link.click()
      toast.success('Đã tải ảnh hóa đơn (.PNG) thành công!')
    } catch (error) {
      console.error('Lỗi chụp ảnh hóa đơn:', error)
      toast.error('Không thể tải ảnh hóa đơn!')
    } finally {
      setIsCapturing(false)
    }
  }

  const isWarehouse = type === 'WAREHOUSE_PACKING_SLIP'

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 relative my-auto">
        {/* THANH ĐIỀU HƯỚNG TẮT/IN - SẼ TỰ ĐỘNG ẨN KHI BẤM IN / LƯU PDF */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 no-print">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              {isWarehouse ? 'Xem Phiếu Giao Hàng Kho' : 'Hóa Đơn Đặt Sỉ F&B'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadImage}
              disabled={isCapturing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isCapturing ? 'Đang tạo ảnh...' : 'Tải Ảnh Hóa Đơn (.PNG)'}
            </button>

            <button
              onClick={handlePrint}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3 py-2 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
              title="In trực tiếp hoặc Lưu PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              In PDF
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
        <div
          className="print-area p-2 sm:p-4 border rounded-2xl space-y-5 text-xs"
          style={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#e2e8f0' }}
        >
          {/* HEADER STORE BRANDING */}
          <div className="flex items-start justify-between pb-4" style={{ borderBottom: '1px solid #e2e8f0' }}>
            <div>
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 font-black rounded-lg flex items-center justify-center text-xs"
                  style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
                >
                  F&B
                </div>
                <h2
                  className="font-extrabold text-sm sm:text-base tracking-tight uppercase"
                  style={{ color: '#0f172a' }}
                >
                  Hệ Thống Phân Phối Nguyên Liệu F&B B2B
                </h2>
              </div>
              <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: '#64748b' }}>
                <MapPin className="w-3 h-3 text-slate-400" /> Số 9, Ngõ 7 Lê Đức Thọ, Từ Liêm, Hà Nội (MST: 0111331261)
              </p>
              <p className="text-[10px] flex items-center gap-1" style={{ color: '#64748b' }}>
                <Phone className="w-3 h-3 text-slate-400" /> Hotline/Zalo Đặt Sỉ: <strong>0989 830 347</strong>
              </p>
            </div>

            <div className="text-right">
              <span
                className="inline-block font-mono font-bold text-xs px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: '#f1f5f9', color: '#1d4ed8' }}
              >
                {order.order_code}
              </span>
              <p className="text-[10px] mt-1" style={{ color: '#94a3b8' }}>
                {new Date(order.created_at || Date.now()).toLocaleDateString('vi-VN')} {new Date(order.created_at || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* TIÊU ĐỀ PHIẾU GIẤY */}
          <div className="text-center space-y-1">
            <h1
              className="text-base sm:text-lg font-black tracking-wide uppercase"
              style={{ color: '#0f172a' }}
            >
              {isWarehouse ? 'PHIẾU GIAO HÀNG & XUẤT KHO' : 'HÓA ĐƠN XÁC NHẬN ĐẶT SỈ'}
            </h1>
            <p className="text-[10px] italic" style={{ color: '#64748b' }}>
              {isWarehouse ? '(Phiếu dán ngoài thùng hàng cho nhân viên giao vận)' : '(Cảm ơn Quý Chủ Quán đã ủng hộ nhà cung cấp F&B!)'}
            </p>
          </div>

          {/* THÔNG TIN KHÁCH HÀNG & NGƯỜI NHẬN */}
          <div
            className="p-3 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]"
            style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
          >
            <div>
              <p style={{ color: '#64748b' }}>Khách hàng / Chủ quán:</p>
              <p className="font-bold text-xs" style={{ color: '#0f172a' }}>
                {order.customer_name} {order.store_name ? `(${order.store_name})` : ''}
              </p>
            </div>
            <div>
              <p style={{ color: '#64748b' }}>SĐT Zalo liên hệ:</p>
              <p className="font-mono font-bold text-xs" style={{ color: '#1d4ed8' }}>{order.customer_phone}</p>
            </div>
            <div className="sm:col-span-2 pt-1.5" style={{ borderTop: '1px solid #e2e8f0' }}>
              <p style={{ color: '#64748b' }}>Địa chỉ giao nhận nguyên liệu:</p>
              <p className="font-semibold" style={{ color: '#0f172a' }}>{order.customer_address}</p>
            </div>
            {order.notes && (
              <div className="sm:col-span-2 pt-1.5" style={{ borderTop: '1px solid #e2e8f0' }}>
                <p style={{ color: '#64748b' }}>Ghi chú giao hàng:</p>
                <p className="italic font-medium" style={{ color: '#334155' }}>{order.notes}</p>
              </div>
            )}
          </div>

          {/* BẢNG DANH SÁCH MÓN ĐẶT */}
          <div>
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="font-bold" style={{ backgroundColor: '#f1f5f9', color: '#334155', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                  <th className="py-2 px-2 w-8 text-center">STT</th>
                  {isWarehouse && <th className="py-2 px-2 w-10 text-center">Check</th>}
                  <th className="py-2 px-2">Sản Phẩm Nguyên Liệu</th>
                  <th className="py-2 px-2 text-center">ĐVT</th>
                  <th className="py-2 px-2 text-center">SL</th>
                  <th className="py-2 px-2 text-right">Đơn Giá</th>
                  <th className="py-2 px-2 text-right">Thành Tiền</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td className="py-2 px-2 text-center font-mono" style={{ color: '#94a3b8' }}>{idx + 1}</td>
                    {isWarehouse && (
                      <td className="py-2 px-2 text-center">
                        <div className="w-4 h-4 rounded mx-auto" style={{ border: '1px solid #94a3b8' }} />
                      </td>
                    )}
                    <td className="py-2 px-2 font-semibold" style={{ color: '#0f172a' }}>{item.name}</td>
                    <td className="py-2 px-2 text-center" style={{ color: '#475569' }}>{item.unit}</td>
                    <td className="py-2 px-2 text-center font-bold" style={{ color: '#2563eb' }}>{item.quantity}</td>
                    <td className="py-2 px-2 text-right" style={{ color: '#475569' }}>
                      {Math.round(item.price).toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-2 px-2 text-right font-bold" style={{ color: '#0f172a' }}>
                      {Math.round(item.subtotal).toLocaleString('vi-VN')}đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TỔNG TIỀN VÀ XÁC NHẬN */}
          <div className="pt-3 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4" style={{ borderTop: '2px solid #0f172a' }}>
            <div className="text-[10px] space-y-0.5" style={{ color: '#64748b' }}>
              <p className="font-semibold" style={{ color: '#334155' }}>📌 Quy định đổi trả & Kiểm nhận:</p>
              <p>• Quý khách vui lòng đồng kiểm nguyên liệu khi nhận hàng.</p>
              <p>• Hàng khô bảo quản nơi mát mẻ. Siro/Sốt đậy kín nắp sau khi mở.</p>
            </div>

            <div className="text-right shrink-0">
              <p className="text-xs font-semibold" style={{ color: '#64748b' }}>TỔNG THÀNH TIỀN HÓA ĐƠN:</p>
              <p className="text-lg sm:text-xl font-extrabold font-mono" style={{ color: '#1d4ed8' }}>
                {Math.round(Number(order.total_amount)).toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
          </div>

          {/* CHỮ KÝ & MÃ QR CHUYỂN KHOÁN / ZALO */}
          <div className="pt-4 grid grid-cols-2 gap-4 text-center text-[10px]" style={{ borderTop: '1px dashed #e2e8f0' }}>
            <div>
              <p className="font-bold" style={{ color: '#1e293b' }}>XÁC NHẬN KHÁCH HÀNG</p>
              <p className="italic mt-8" style={{ color: '#94a3b8' }}>(Ký & ghi rõ họ tên)</p>
            </div>
            <div>
              <p className="font-bold" style={{ color: '#1e293b' }}>ĐẠI DIỆN SOẠN KHO</p>
              <p className="italic mt-8" style={{ color: '#94a3b8' }}>(Ký & đóng dấu xuất kho)</p>
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
