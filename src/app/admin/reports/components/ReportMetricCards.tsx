'use client'

import { Package, AlertTriangle, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { Product } from '@/types/database'

interface ReportMetricCardsProps {
  products: Product[]
  totalImportCount: number
  totalExportCount: number
}

export default function ReportMetricCards({
  products,
  totalImportCount,
  totalExportCount,
}: ReportMetricCardsProps) {
  const totalProductsCount = products.length
  const lowStockProducts = products.filter((p) => p.stock_quantity <= p.min_stock_alert)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Tổng Mặt Hàng
            </span>
            <span className="text-2xl font-bold text-slate-900">{totalProductsCount}</span>
            <span className="text-xs text-slate-500 block mt-1">Đang quản lý trong kho</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Cảnh Báo Tồn Kho
            </span>
            <span className={`text-2xl font-bold ${lowStockProducts.length > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {lowStockProducts.length}
            </span>
            <span className="text-xs text-slate-500 block mt-1">Sản phẩm dưới mức cảnh báo</span>
          </div>
          <div className={`p-3 rounded-xl ${lowStockProducts.length > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Tổng Phiếu Nhập
            </span>
            <span className="text-2xl font-bold text-emerald-600">{totalImportCount}</span>
            <span className="text-xs text-slate-500 block mt-1">Lượt bổ sung hàng</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Tổng Đơn Xuất Kho
            </span>
            <span className="text-2xl font-bold text-blue-600">{totalExportCount}</span>
            <span className="text-xs text-slate-500 block mt-1">Đơn bán sỉ đã giao</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>
      </div>

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
                  <p className="text-slate-400 font-mono">{p.id}</p>
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