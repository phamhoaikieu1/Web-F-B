'use client'

import { Product } from '@/types/database'
import { AlertTriangle, CheckCircle, Edit2, Power, Trash2 } from 'lucide-react'

interface ProductTableProps {
  products: Product[]
  loading: boolean
  onOpenEditModal: (p: Product) => void
  onToggleActive: (p: Product) => void
  onDeleteProduct: (p: Product) => void
}

export default function ProductTable({
  products,
  loading,
  onOpenEditModal,
  onToggleActive,
  onDeleteProduct,
}: ProductTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <th className="p-4">Mã SKU / Sản Phẩm</th>
              <th className="p-4 text-center">Quy Đổi Đơn Vị</th>
              <th className="p-4 text-right">Giá Lẻ (&lt; Min)</th>
              <th className="p-4 text-right">Giá Sỉ B2B (≥ min)</th>
              <th className="p-4 text-right">Giá Vốn (Nhập / MAC)</th>
              <th className="p-4 text-center">Tồn Kho</th>
              <th className="p-4 text-center">Trạng Thái</th>
              <th className="p-4 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  Đang tải danh mục sản phẩm...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  Không có sản phẩm nào
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const isDisabled = !!p.is_disabled
                const isLowStock = p.stock_quantity <= p.min_stock_alert

                const rPrice = Number(p.retail_price ?? (p as any).price ?? 0)
                const wPrice = Number(p.wholesale_price ?? rPrice)
                const minQty = Number(p.wholesale_min_qty ?? 1)
                const cPrice = Number(p.cost_price ?? 0)
                const macPrice = Number(p.avg_cost_price ?? cPrice)

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isDisabled ? 'opacity-50 bg-slate-50/50' : ''
                    }`}
                  >
                    <td className="p-4">
                      <span className="font-mono text-[10px] font-bold text-slate-400 block">{p.sku}</span>
                      <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                    </td>

                    <td className="p-4 text-center">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-semibold text-[11px] block">
                        1 {p.unit} = {p.conversion_rate} {p.base_unit}
                      </span>
                    </td>

                    <td className="p-4 text-right font-bold text-slate-700 font-mono text-xs">
                      {rPrice.toLocaleString('vi-VN')} đ
                    </td>

                    <td className="p-4 text-right font-mono">
                      <span className="font-bold text-emerald-600 text-sm block">
                        {wPrice.toLocaleString('vi-VN')} đ
                      </span>
                      <span className="text-[10px] text-amber-700 font-semibold block">
                        (≥ {minQty} {p.base_unit})
                      </span>
                    </td>

                    <td className="p-4 text-right font-mono text-xs">
                      <span className="text-slate-700 font-bold block">
                        Mới: {cPrice.toLocaleString('vi-VN')} đ
                      </span>
                      <span className="text-[10px] text-blue-600 font-semibold block">
                        MAC: {macPrice.toLocaleString('vi-VN')} đ
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-extrabold px-2.5 py-1 rounded-full ${
                          isLowStock ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {isLowStock && <AlertTriangle className="w-3 h-3 text-red-600" />}
                        {p.stock_quantity} {p.base_unit}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      {isDisabled ? (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-bold text-[11px]">
                          Ngừng bán
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold text-[11px]">
                          <CheckCircle className="w-3 h-3" /> Đang bán
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenEditModal(p)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa sản phẩm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onToggleActive(p)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isDisabled ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'
                          }`}
                          title={isDisabled ? 'Bật kinh doanh' : 'Tắt kinh doanh'}
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeleteProduct(p)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
