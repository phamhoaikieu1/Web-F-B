'use client'

import Link from 'next/link'
import { Store, Phone, Mail, MapPin } from 'lucide-react'

export default function FooterDesktop() {
  return (
    <footer className="hidden md:block bg-white border-t border-slate-200 text-slate-600 pt-12 pb-8">
      <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-4 gap-8 mb-12">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-xl text-white">
              <Store className="w-5 h-5" />
            </div>
            <span className="font-black text-lg text-slate-900">F&B STORE</span>
          </Link>
          <p className="text-xs text-slate-500 leading-relaxed">
            Tổng kho nguyên liệu pha chế sỉ B2B toàn quốc. Cam kết chính hãng 100%.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase text-slate-900 tracking-wider">Hỗ Trợ Khách Hàng</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/login" className="hover:text-emerald-600">Tài khoản của tôi</Link></li>
            <li><Link href="/cart" className="hover:text-emerald-600">Giỏ hàng đặt sỉ</Link></li>
            <li><Link href="/wishlist" className="hover:text-emerald-600">Danh sách yêu thích</Link></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase text-slate-900 tracking-wider">Thông Tin Liên Hệ</h4>
          <div className="space-y-2 text-xs">
            <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-600" /> Hà Nội & TP. Hồ Chí Minh</p>
            <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-600" /> 0989.830.347</p>
            <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-600" /> hotro@fbstore.vn</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase text-slate-900 tracking-wider">Thanh Toán An Toàn</h4>
          <div className="flex flex-wrap gap-2 text-[10px] font-bold">
            <span className="bg-slate-100 px-3 py-1.5 rounded-lg">VISA / MASTER</span>
            <span className="bg-slate-100 px-3 py-1.5 rounded-lg">MOMO</span>
            <span className="bg-slate-100 px-3 py-1.5 rounded-lg">ZALOPAY</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6 text-center text-xs text-slate-400 max-w-[1600px] mx-auto px-6">
        © 2026 F&B STORE B2B System. All rights reserved.
      </div>
    </footer>
  )
}