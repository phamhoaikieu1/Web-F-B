'use client'

import { useRef } from 'react'

interface PriceRangeFilterProps {
  minPrice: number
  maxPrice: number
  absoluteMax: number
  onPriceChange: (min: number, max: number) => void
}

const ABSOLUTE_MIN = 0
const STEP = 50000

export default function PriceRangeFilter({
  minPrice,
  maxPrice,
  absoluteMax,
  onPriceChange,
}: PriceRangeFilterProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const maxLimit = absoluteMax > 0 ? absoluteMax : 5000000

  // Click vào thanh track -> Con lăn gần nhất tự nhảy tới
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percent = Math.max(0, Math.min(1, clickX / rect.width))
    const rawVal = ABSOLUTE_MIN + percent * (maxLimit - ABSOLUTE_MIN)
    const clickedValue = Math.round(rawVal / STEP) * STEP

    const distToMin = Math.abs(clickedValue - minPrice)
    const distToMax = Math.abs(clickedValue - maxPrice)

    if (distToMin < distToMax) {
      onPriceChange(Math.min(clickedValue, maxPrice - STEP), maxPrice)
    } else {
      onPriceChange(minPrice, Math.max(clickedValue, minPrice + STEP))
    }
  }

  const minPercent = ((minPrice - ABSOLUTE_MIN) / (maxLimit - ABSOLUTE_MIN)) * 100
  const maxPercent = ((maxPrice - ABSOLUTE_MIN) / (maxLimit - ABSOLUTE_MIN)) * 100

  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-3 items-center">
        <div className="relative flex items-center">
          <input
            type="number"
            step={STEP}
            min={ABSOLUTE_MIN}
            max={maxPrice}
            value={minPrice}
            onChange={(e) => onPriceChange(Math.max(ABSOLUTE_MIN, Number(e.target.value)), maxPrice)}
            className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600"
          />
          <span className="absolute right-3 text-[10px] font-bold text-slate-400 pointer-events-none">VNĐ</span>
        </div>

        <div className="relative flex items-center">
          <input
            type="number"
            step={STEP}
            min={minPrice}
            max={maxLimit}
            value={maxPrice}
            onChange={(e) => onPriceChange(minPrice, Math.min(maxLimit, Number(e.target.value)))}
            className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600"
          />
          <span className="absolute right-3 text-[10px] font-bold text-slate-400 pointer-events-none">VNĐ</span>
        </div>
      </div>

      {/* TRACK CÓ THỂ CLICK NHẢY CON LĂN */}
      <div 
        ref={trackRef}
        onClick={handleTrackClick}
        className="relative w-full h-3 my-3 rounded-lg bg-slate-200 cursor-pointer flex items-center"
      >
        <div
          className="absolute h-2 bg-emerald-600 rounded-lg pointer-events-none"
          style={{
            left: `${minPercent}%`,
            width: `${Math.max(0, maxPercent - minPercent)}%`,
          }}
        />

        <input
          type="range"
          min={ABSOLUTE_MIN}
          max={maxLimit}
          step={STEP}
          value={minPrice}
          onChange={(e) => onPriceChange(Math.min(Number(e.target.value), maxPrice - STEP), maxPrice)}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none z-30 cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none"
        />

        <input
          type="range"
          min={ABSOLUTE_MIN}
          max={maxLimit}
          step={STEP}
          value={maxPrice}
          onChange={(e) => onPriceChange(minPrice, Math.max(Number(e.target.value), minPrice + STEP))}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none z-40 cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none"
        />
      </div>
    </div>
  )
}