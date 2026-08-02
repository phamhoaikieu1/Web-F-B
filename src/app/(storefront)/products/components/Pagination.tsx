'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  if (totalItems === 0 || totalPages <= 1) return null

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="py-8 border-t border-slate-200 mt-8 space-y-4 text-center max-w-md mx-auto">
      {/* 📊 Hiển thị vị trí sản phẩm chuẩn (Ví dụ: Hiển thị 25 - 27 trên 27 nguyên liệu) */}
      <p className="text-xs font-medium text-slate-500">
        Hiển thị <strong className="text-slate-900">{startItem} - {endItem}</strong> trên <strong className="text-slate-900">{totalItems}</strong> nguyên liệu
      </p>

      {/* Cụm Nút Chuyển Trang */}
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
              currentPage === page
                ? 'bg-emerald-600 text-white shadow-xs scale-105'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}