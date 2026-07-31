'use client'

import { ChevronDown } from 'lucide-react'

interface FilterAccordionProps {
  id: string
  title: string
  hasChange?: boolean
  isOpen: boolean
  onToggle: (id: string) => void
  children: React.ReactNode
}

export default function FilterAccordion({
  id,
  title,
  hasChange = false,
  isOpen,
  onToggle,
  children,
}: FilterAccordionProps) {
  return (
    <div className="border-b border-slate-100 py-3.5">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex justify-between items-center text-xs font-bold text-slate-900 uppercase tracking-wider cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span>{title}</span>
          {hasChange && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600' : ''
          }`}
        />
      </button>

      {isOpen && <div className="mt-3 animate-in fade-in duration-200">{children}</div>}
    </div>
  )
}