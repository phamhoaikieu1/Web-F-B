'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Store, Phone, Mail, MapPin, ShieldCheck, Truck, FileCheck, Send, CheckCircle } from 'lucide-react'

export default function FooterDesktop() {
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
    <footer className="hidden md:block bg-white border-t border-slate-200 text-slate-600 pt-12 pb-8">
      <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-4 gap-8 mb-12">
        {/* COLUMN 1: KHO LINH LÂM (Store Name, Address, MST, Hotline, Email & Social Media) */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-[#006838] p-2 rounded-xl text-white shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-lg text-slate-900 block leading-none">LINH LÂM B2B</span>
              <span className="text-[9px] font-bold text-[#006838] tracking-widest block uppercase mt-0.5">Kho Nguyên Liệu F&B</span>
            </div>
          </Link>

          <p className="text-xs text-slate-600 font-semibold leading-snug">
            TỔNG KHO NGUYÊN LIỆU PHA CHẾ LINH LÂM
          </p>

          <div className="space-y-2 text-xs text-slate-500">
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#006838] shrink-0 mt-0.5" />
              <span><strong>Địa chỉ:</strong> Số 9, Ngõ 7 Lê Đức Thọ, Từ Liêm, Hà Nội</span>
            </p>
            <p className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#006838] shrink-0" />
              <span><strong>Mã Số Thuế:</strong> 0111331261</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#006838] shrink-0" />
              <span><strong>Hotline / Zalo:</strong> <a href="https://zalo.me/0989830347" target="_blank" rel="noreferrer" className="text-[#006838] font-bold hover:underline">0989.830.347</a></span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#006838] shrink-0" />
              <span><strong>Email:</strong> kholinhlam@gmail.com</span>
            </p>
          </div>

          {/* CỤM MẠNG XÃ HỘI CHÍNH THỨC DÀNH CHO B2B */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Kênh Truyền Thông Doanh Nghiệp:</span>
            <div className="flex items-center gap-2">
              <a
                href="https://zalo.me/0989830347"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#006838] hover:text-white text-slate-700 font-extrabold text-[11px] flex items-center justify-center transition-all shadow-2xs cursor-pointer border border-slate-200/60"
                title="Kênh Zalo B2B"
              >
                Zalo
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#006838] hover:text-white text-slate-700 flex items-center justify-center transition-all shadow-2xs cursor-pointer border border-slate-200/60"
                title="Trang Facebook Linh Lâm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#006838] hover:text-white text-slate-700 flex items-center justify-center transition-all shadow-2xs cursor-pointer border border-slate-200/60"
                title="Kênh TikTok Công Thức Pha Chế"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.35a6.33 6.33 0 0 0-1-.08 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.28 8.28 0 0 0 4.93 1.6v-3.9a4.84 4.84 0 0 1-1.04-.06z"/></svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#006838] hover:text-white text-slate-700 flex items-center justify-center transition-all shadow-2xs cursor-pointer border border-slate-200/60"
                title="Kênh YouTube Hướng Dẫn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* COLUMN 2: CHÍNH SÁCH & HƯỚNG DẪN */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-xs uppercase text-slate-900 tracking-wider border-b border-emerald-100 pb-2">
            Chính Sách & Hướng Dẫn B2B
          </h4>
          <ul className="space-y-3 text-xs">
            <li className="flex items-start gap-2">
              <Truck className="w-4 h-4 text-[#006838] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">Vận Chuyển Chành Xe Toàn Quốc</strong>
                <span className="text-slate-500 text-[11px]">Giao hỏa tốc nội thành trong 2h, gửi xe khách/chành xe đi tỉnh.</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#006838] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">Chính Sách Đổi Trả 7 Ngày</strong>
                <span className="text-slate-500 text-[11px]">Đổi trả miễn phí 100% nếu hàng rách vỡ hoặc hết hạn sử dụng.</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <FileCheck className="w-4 h-4 text-[#006838] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">Cam Kết ATVSTP & Hóa Đơn VAT</strong>
                <span className="text-slate-500 text-[11px]">Cung cấp đủ giấy công bố chất lượng & hóa đơn VAT cho chủ quán.</span>
              </div>
            </li>
          </ul>
        </div>

        {/* COLUMN 3: ĐĂNG KÝ BẢNG GIÁ SỈ (FORM) */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-xs uppercase text-slate-900 tracking-wider border-b border-emerald-100 pb-2">
            Đăng Ký Nhận Bảng Giá Sỉ
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Nhập SĐT/Zalo hoặc Email để Kho Linh Lâm gửi bảng giá sỉ cập nhật mới nhất cho quán.
          </p>

          {isSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-xs text-[#006838] flex items-start gap-2.5">
              <CheckCircle className="w-5 h-5 shrink-0 text-[#006838] mt-0.5" />
              <div>
                <strong className="block font-bold">Đã gửi thông tin thành công!</strong>
                <span className="text-[11px] text-emerald-800">Chuyên viên B2B sẽ Zalo cho bạn bảng giá sỉ trong 5 phút.</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                type="text"
                placeholder="Nhập SĐT Zalo hoặc Email của bạn..."
                value={contactInput}
                onChange={(e) => setContactInput(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#006838] rounded-xl text-xs font-medium focus:outline-none transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="w-full bg-[#006838] hover:bg-emerald-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>GỬI YÊU CẦU BÁO GIÁ SỈ</span>
              </button>
            </form>
          )}

          <div className="pt-2 text-[10px] text-slate-400 flex items-center gap-2">
            <span>🔒 Bảo mật thông tin tuyệt đối</span>
            <span>•</span>
            <span>⚡ Báo giá tự động 24/7</span>
          </div>
        </div>

        {/* COLUMN 4: BẢN ĐỒ KHO (GOOGLE MAPS IFRAME) */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-xs uppercase text-slate-900 tracking-wider border-b border-emerald-100 pb-2">
            Bản Đồ Vị Trí Kho Linh Lâm
          </h4>
          <div className="w-full h-40 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs relative bg-slate-100">
            <iframe
              title="Bản đồ Tổng kho Nguyên liệu Linh Lâm"
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
          <p className="text-[10px] text-slate-400 text-center">
            Kho mở cửa: 08:00 - 18:00 từ Thứ 2 đến Chủ Nhật
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6 text-center text-xs text-slate-400 max-w-[1600px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>© 2026 LINH LÂM B2B - Tổng Kho Nguyên Liệu Pha Chế F&B. All rights reserved.</span>
        <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
          <Link href="/products" className="hover:text-[#006838]">Sản Phẩm</Link>
          <Link href="/cart" className="hover:text-[#006838]">Giỏ Hàng</Link>
          <a href="https://zalo.me/0989830347" target="_blank" rel="noreferrer" className="hover:text-[#006838]">Liên Hệ Zalo</a>
        </div>
      </div>
    </footer>
  )
}