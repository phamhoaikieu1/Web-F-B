import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Hệ Thống Quản Lý Kho & Bán Sỉ F&B',
  description: 'Hệ thống quản lý bán sỉ B2B & tồn kho F&B',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className="bg-slate-100 text-slate-900 min-h-screen antialiased flex flex-col">
        {/* Header XXXLutz */}
        <Navbar />

        {/* Nội dung các trang */}
        <div className="flex-1">
          {children}
        </div>

        {/* Footer Doanh Nghiệp Chuyên Nghiệp */}
        <Footer />
      </body>
    </html>
  )
}