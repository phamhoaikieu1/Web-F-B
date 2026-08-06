'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Store, Phone, MessageSquare, MapPin, FileCheck, Send, CheckCircle } from 'lucide-react'

export default function FooterMobile() {
  const [contactInput, setContactInput] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (contactInput.trim()) {
      setIsSubmitted(true)
      setContactInput('')
    }
  }

  return (
    <footer className="md:hidden bg-white border-t border-slate-200 text-slate-600 py-8 px-4 space-y-6 text-center">
      {/* Logo LINH LÂM B2B Điều hướng Trang chủ */}
      <Link href="/" className="inline-flex items-center justify-center gap-2.5">
        <div className="bg-[#006838] p-2 rounded-2xl text-white shadow-xs">
          <Store className="w-6 h-6" />
        </div>
        <div className="text-left">
          <span className="font-black text-lg tracking-tight text-slate-900 block leading-none">LINH LÂM B2B</span>
          <span className="text-[9px] font-bold text-[#006838] tracking-widest block uppercase mt-0.5">Kho Nguyên Liệu F&B</span>
        </div>
      </Link>

      <div className="space-y-1 max-w-xs mx-auto text-left bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100/80">
        <strong className="text-xs font-black text-slate-900 block">TỔNG KHO NGUYÊN LIỆU PHA CHẾ LINH LÂM</strong>
        <p className="text-[11px] text-slate-500 flex items-start gap-1.5 mt-1">
          <MapPin className="w-3.5 h-3.5 text-[#006838] shrink-0 mt-0.5" />
          <span>Số 9, Ngõ 7 Lê Đức Thọ, Từ Liêm, Hà Nội</span>
        </p>
        <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <FileCheck className="w-3.5 h-3.5 text-[#006838] shrink-0" />
          <span>Mã Số Thuế: 0111331261</span>
        </p>
      </div>

      {/* KÊNH MẠNG XÃ HỘI B2B MOBILE */}
      <div className="flex justify-center items-center gap-3">
        <a
          href="https://zalo.me/0989830347"
          target="_blank"
          rel="noreferrer"
          className="w-10 h-10 rounded-2xl bg-slate-100 active:bg-[#006838] active:text-white text-slate-800 font-extrabold text-[11px] flex items-center justify-center border border-slate-200/80 shadow-2xs"
          title="Zalo B2B"
        >
          Zalo
        </a>
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noreferrer"
          className="w-10 h-10 rounded-2xl bg-slate-100 active:bg-[#006838] active:text-white text-slate-800 flex items-center justify-center border border-slate-200/80 shadow-2xs"
          title="Facebook Linh Lâm"
        >
          <svg className="w-4 h-4 fill-current text-slate-700" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </a>
        <a
          href="https://tiktok.com"
          target="_blank"
          rel="noreferrer"
          className="w-10 h-10 rounded-2xl bg-slate-100 active:bg-[#006838] active:text-white text-slate-800 flex items-center justify-center border border-slate-200/80 shadow-2xs"
          title="TikTok Công Thức"
        >
          <svg className="w-4 h-4 fill-current text-slate-700" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.35a6.33 6.33 0 0 0-1-.08 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.28 8.28 0 0 0 4.93 1.6v-3.9a4.84 4.84 0 0 1-1.04-.06z"/></svg>
        </a>
        <a
          href="https://youtube.com"
          target="_blank"
          rel="noreferrer"
          className="w-10 h-10 rounded-2xl bg-slate-100 active:bg-[#006838] active:text-white text-slate-800 flex items-center justify-center border border-slate-200/80 shadow-2xs"
          title="YouTube Hướng Dẫn"
        >
          <svg className="w-4 h-4 fill-current text-slate-700" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
        </a>
      </div>

      <div className="flex justify-center gap-2.5">
        <a
          href="https://zalo.me/0989830347"
          target="_blank"
          rel="noreferrer"
          className="bg-[#006838] hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
        >
          <MessageSquare className="w-4 h-4" /> Zalo B2B 24/7
        </a>
        <a
          href="tel:0989830347"
          className="bg-white border border-slate-200 text-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
        >
          <Phone className="w-4 h-4 text-[#006838]" /> Hotline: 0989.830.347
        </a>
      </div>

      {/* Form Đăng ký Bảng giá sỉ */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-left space-y-2">
        <h4 className="font-extrabold text-xs text-slate-900 uppercase">Đăng Ký Nhận Bảng Giá Sỉ</h4>
        <p className="text-[11px] text-slate-500">Nhập SĐT/Zalo để nhận bảng giá sỉ nguyên liệu cho quán.</p>

        {isSubmitted ? (
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-[#006838] flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#006838] shrink-0" />
            <span>Đã gửi! Kho Linh Lâm sẽ Zalo bảng giá trong 5 phút.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập SĐT/Zalo..."
              value={contactInput}
              onChange={(e) => setContactInput(e.target.value)}
              required
              className="flex-1 px-3 py-2 bg-white border border-slate-200 focus:border-[#006838] rounded-xl text-xs font-medium focus:outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="bg-[#006838] hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>

      {/* Embedded Map Mobile */}
      <div className="w-full h-36 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs relative bg-slate-100">
        <iframe
          title="Bản đồ Tổng kho Linh Lâm"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.6293933096417!2d105.84277717604473!3d21.007487288514154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac77d6f51cd1%3A0x6b801a6be1a80695!2zUGjhu5EgVsG7jW5nLCBIw6AgTuG7mWksIFZpZXRuYW0!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        />
      </div>

      <div className="border-t border-slate-200/80 pt-4 space-y-2">
        <div className="flex justify-center gap-4 text-[11px] font-bold text-slate-600">
          <Link href="/products">Sản phẩm</Link>
          <span>•</span>
          <Link href="/cart">Giỏ hàng</Link>
          <span>•</span>
          <a href="https://zalo.me/0989830347" target="_blank" rel="noreferrer">Zalo B2B</a>
        </div>
        <p className="text-[10px] text-slate-400">© 2026 LINH LÂM B2B. All rights reserved.</p>
      </div>
    </footer>
  )
}