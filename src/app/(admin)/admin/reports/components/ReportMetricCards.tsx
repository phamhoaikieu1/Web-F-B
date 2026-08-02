import { Package, AlertTriangle, ArrowDownLeft, ArrowUpRight, DollarSign, TrendingUp, Award } from 'lucide-react'
import { Product } from '@/types/database'

interface ReportMetricCardsProps {
  products: Product[]
  totalImportCount: number
  totalExportCount: number
  totalRevenue?: number
  totalCogs?: number
  topSellingProducts?: Array<{ name: string; quantity: number }>
}

export default function ReportMetricCards({
  products,
  totalImportCount,
  totalExportCount,
  totalRevenue = 0,
  totalCogs = 0,
  topSellingProducts = [],
}: ReportMetricCardsProps) {
  const totalProductsCount = products.length
  const lowStockProducts = products.filter((p) => p.stock_quantity <= p.min_stock_alert)

  const grossProfit = totalRevenue - totalCogs
  const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      {/* KHU VỰC THẺ TÀI CHÍNH DOANH THU & LỢI NHUẬN GỘP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-5 rounded-2xl shadow-md space-y-2 border border-blue-800">
          <div className="flex items-center justify-between text-blue-200 text-xs font-semibold uppercase tracking-wider">
            <span>Tổng Doanh Thu Bán Sỉ</span>
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            {totalRevenue.toLocaleString('vi-VN')} VNĐ
          </p>
          <p className="text-[11px] text-blue-300">Doanh số từ các đơn hàng sỉ thành công</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Giá Vốn Hàng Bán (COGS)</span>
            <ArrowDownLeft className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
            {totalCogs.toLocaleString('vi-VN')} VNĐ
          </p>
          <p className="text-[11px] text-slate-500">Chi phí nhập gốc nguyên liệu đã bán</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <span>Lợi Nhuận Gộp Tạm Tính</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700">
            {grossProfit.toLocaleString('vi-VN')} VNĐ
          </p>
          <p className="text-[11px] text-emerald-800 font-semibold">
            Tỷ suất lợi nhuận gộp: <strong className="text-emerald-950 font-bold">{profitMargin}%</strong>
          </p>
        </div>
      </div>

      {/* THẺ CHỈ SỐ KHO & CẢNH BÁO TỒN KHO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Tổng Mặt Hàng
            </span>
            <span className="text-xl font-bold text-slate-900">{totalProductsCount}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Mặt hàng quản lý trong kho</span>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Cảnh Báo Tồn Kho
            </span>
            <span className={`text-xl font-bold ${lowStockProducts.length > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {lowStockProducts.length}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Cần bổ sung hàng gấp</span>
          </div>
          <div className={`p-2.5 rounded-xl ${lowStockProducts.length > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Tổng Phiếu Nhập
            </span>
            <span className="text-xl font-bold text-emerald-600">{totalImportCount}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Lượt bổ sung nguyên liệu</span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Tổng Đơn Xuất Kho
            </span>
            <span className="text-xl font-bold text-blue-600">{totalExportCount}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Đơn bán sỉ đã xuất</span>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* TOP 5 NGUYÊN LIỆU BÁN CHẠY NHẤT */}
      {topSellingProducts.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Award className="w-5 h-5 text-amber-500" />
            TOP 5 NGUYÊN LIỆU F&B BÁN CHẠY NHẤT HỆ THỐNG
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            {topSellingProducts.slice(0, 5).map((p, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-md">
                  TOP #{idx + 1}
                </span>
                <p className="font-bold text-slate-900 truncate">{p.name}</p>
                <p className="text-blue-600 font-bold">Đã bán: {p.quantity}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BANNER CẢNH BÁO TỒN KHO */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            CẢNH BÁO: CÓ {lowStockProducts.length} SẢN PHẨM CẦN NHẬP BỔ SUNG NGAY
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map((p) => (
              <div key={p.id} className="bg-white p-3 rounded-lg border border-red-200 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-900 truncate max-w-[200px]">{p.name}</p>
                  <p className="text-slate-400 font-mono">{p.sku || p.id}</p>
                </div>
                <div className="text-right">
                  <span className="text-red-600 font-bold block">{p.stock_quantity} {p.base_unit}</span>
                  <span className="text-slate-400 text-[10px]">Cảnh báo: ≤{p.min_stock_alert}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}