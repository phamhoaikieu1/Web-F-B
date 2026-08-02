'use client'

import { Toaster, toast } from 'sonner'
import { useEffect } from 'react'

export default function ToasterProvider() {
  useEffect(() => {
    // Sự kiện Tap/Click vào bất kỳ vị trí nào trên thẻ Toast notification để ẩn ngay lập tức (Dismiss)
    const handleToastClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const toastElement = target.closest('[data-sonner-toast]')
      if (toastElement) {
        toast.dismiss()
      }
    }

    document.addEventListener('click', handleToastClick)
    return () => document.removeEventListener('click', handleToastClick)
  }, [])

  return (
    <Toaster
      position="bottom-center"
      richColors
      toastOptions={{
        style: {
          borderRadius: '9999px',
          padding: '10px 18px',
          fontSize: '12px',
          fontWeight: '700',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
          cursor: 'pointer',
          userSelect: 'none',
        },
      }}
    />
  )
}
