import type { Metadata, Viewport } from 'next'
import './globals.css'
import ToasterProvider from '@/components/ToasterProvider'

export const metadata: Metadata = {
  title: 'Hệ Thống Quản Lý Kho & Bán Sỉ F&B',
  description: 'Hệ thống quản lý bán sỉ B2B & tồn kho F&B',
}

// KHÓA CỨNG TỶ LỆ KHÔNG CHO PHÉP ZOOM MÀN HÌNH KHI BẤM NHẬP LIỆU
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className="bg-slate-100 text-slate-900 min-h-screen antialiased flex flex-col">
        <ToasterProvider />
        {children}
      </body>
    </html>
  )
}