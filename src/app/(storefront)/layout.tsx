'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollToTop from '@/components/ScrollToTop'
import AiChatWidget from '@/components/AiChatWidget'

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
      <ScrollToTop />
      <AiChatWidget />
    </div>
  )
}
