'use client'

import Link from 'next/link'
import { Store, Phone, MessageSquare } from 'lucide-react'

export default function FooterMobile() {
  return (
    <footer className="md:hidden bg-slate-50 border-t border-slate-200 text-slate-600 py-8 px-4 space-y-6 text-center">
      {/* Logo F&B STORE Điều hướng Trang chủ */}
      <Link href="/" className="inline-flex items-center justify-center gap-2.5">
        <div className="bg-emerald-600 p-2 rounded-2xl text-white shadow-xs">
          <Store className="w-6 h-6" />
        </div>
        <div className="text-left">
          <span className="font-black text-lg tracking-tight text-slate-900 block leading-none">F&B STORE</span>
          <span className="text-[9px] font-bold text-emerald-600 tracking-widest block uppercase mt-0.5">B2B Ingredient</span>
        </div>
      </Link>

      <p className="text-xs text-slate-500 max-w-xs mx-auto">
        Giải pháp đặt sỉ nguyên liệu F&B giá gốc cho chuỗi quán Trà Sữa, Cafe & Bánh.
      </p>

      <div className="flex justify-center gap-3">
        <a
          href="https://zalo.me/0989830347"
          target="_blank"
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
        >
          <MessageSquare className="w-4 h-4" /> Zalo B2B 24/7
        </a>
        <a
          href="tel:0989830347"
          className="bg-white border border-slate-200 text-slate-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
        >
          <Phone className="w-4 h-4 text-emerald-600" /> Hotline
        </a>
      </div>

      <div className="border-t border-slate-200/80 pt-4 space-y-2">
        <div className="flex justify-center gap-4 text-[11px] font-bold text-slate-600">
          <Link href="/login">Tài khoản</Link>
          <span>•</span>
          <Link href="/cart">Giỏ hàng</Link>
          <span>•</span>
          <Link href="/wishlist">Yêu thích</Link>
        </div>
        <p className="text-[10px] text-slate-400">© 2026 F&B STORE. All rights reserved.</p>
      </div>
    </footer>
  )
}