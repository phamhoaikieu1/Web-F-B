'use client'

import { useEffect } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'

interface FilterDrawerProps {
  isOpen: boolean
  totalChanges: number
  filteredCount: number
  onClose: () => void
  onReset: () => void
  children: React.ReactNode
}

export default function FilterDrawer({
  isOpen,
  totalChanges,
  filteredCount,
  onClose,
  onReset,
  children,
}: FilterDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 relative">
        
        {/* Header Drawer chuẩn XXXLutz */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
            <h2 className="font-black text-slate-900 text-sm uppercase">Bộ Lọc</h2>
            
            {/* 🔴 BADGE SỐ ĐỎ TRÒN THỂ HIỆN SỐ LƯỢNG THAY ĐỔI */}
            {totalChanges > 0 && (
              <span className="bg-red-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {totalChanges}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Nút Xóa tất cả bộ lọc UI gạch chân tinh tế */}
            {totalChanges > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="text-xs text-slate-500 hover:text-red-600 font-bold underline cursor-pointer transition-colors"
              >
                Xóa tất cả bộ lọc
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Danh sách các Accordion */}
        <div className="p-5 overflow-y-auto flex-1 space-y-1">
          {children}
        </div>

        {/* NÚT QUYỀN LỰC ĐÁY: HIỂN THỊ REAL-TIME SỐ SẢN PHẨM */}
        <div className="p-4 border-t border-slate-100 shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-black py-3.5 rounded-xl text-xs transition-colors cursor-pointer shadow-md uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <span>HIỂN THỊ {filteredCount} NGUYÊN LIỆU</span>
          </button>
        </div>
      </div>

      <div className="flex-1 cursor-pointer" onClick={onClose} />
    </div>
  )
}