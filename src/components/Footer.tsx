'use client'

import Link from 'next/link'
import { Store, ShieldCheck, Phone, Mail, MapPin, CreditCard, Truck } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#193224] text-emerald-100 text-xs border-t-4 border-emerald-600/80 pt-12 pb-8 mt-12">
      <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* CỘT 1: THÔNG TIN CÔNG TY & THƯƠNG HIỆU */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2.5 rounded-2xl text-white shadow-md">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="font-black text-lg text-white block tracking-tight">F&B B2B STORE</span>
              <span className="text-[10px] text-emerald-400 font-mono block font-bold tracking-widest uppercase">
                Tổng Kho Nguyên Liệu Trà & Cà Phê Giá Sỉ
              </span>
            </div>
          </div>

          <p className="text-emerald-200/80 text-[11px] leading-relaxed max-w-md">
            Hệ thống thương mại điện tử B2B cung cấp giải pháp quản lý đặt hàng sỉ, tự động tính tồn kho và tối ưu vận hành cho chuỗi quán F&B toàn quốc.
          </p>

          <div className="text-emerald-200/90 space-y-2 text-[11px]">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" /> 
              <strong>Trụ sở chính:</strong> Tầng 8, Tòa nhà Công Nghệ, Cầu Giấy, Hà Nội
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" /> 
              <strong>Hotline Zalo B2B:</strong> <span className="text-emerald-300 font-mono font-bold">0989.830.347</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" /> 
              <strong>Email hỗ trợ:</strong> hotro@fbstore.vn
            </p>
          </div>

          <div className="pt-1">
            <div className="inline-flex items-center gap-2.5 bg-emerald-900/60 border border-emerald-700/60 px-3.5 py-2 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-[10px] font-bold text-white block uppercase tracking-wider">ĐÃ THÔNG BÁO</span>
                <span className="text-[9px] text-emerald-300/80 block font-mono">BỘ CÔNG THƯƠNG</span>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT 2: DANH MỤC SẢN PHẨM */}
        <div className="md:col-span-3 space-y-3">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider border-b border-emerald-800/80 pb-2">
            Danh Mục Sản Phẩm
          </h3>
          <ul className="space-y-2 text-[11px] text-emerald-200/80">
            <li><Link href="/products" className="hover:text-white transition-colors">Trà Đậm Vị Sỉ</Link></li>
            <li><Link href="/products" className="hover:text-white transition-colors">Topping & Thạch Các Loại</Link></li>
            <li><Link href="/products" className="hover:text-white transition-colors">Bột Pha Chế & Frappe</Link></li>
            <li><Link href="/products" className="hover:text-white transition-colors">Kem Béo - Bột Béo</Link></li>
            <li><Link href="/products" className="hover:text-white transition-colors">Siro & Mứt Trái Cây</Link></li>
            <li><Link href="/products" className="hover:text-white transition-colors">Cà Phê Mộc Nguyên Chất</Link></li>
          </ul>
        </div>

        {/* CỘT 3: HƯỚNG DẪN & CHÍNH SÁCH DÀNH CHO KHÁCH (ĐÃ XÓA ADMIN) */}
        <div className="md:col-span-4 space-y-3">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider border-b border-emerald-800/80 pb-2">
            Chính Sách & Hỗ Trợ Khách Hàng
          </h3>
          <ul className="space-y-2 text-[11px] text-emerald-200/80 grid grid-cols-2 gap-x-2">
            <li><Link href="/login" className="hover:text-white transition-colors font-semibold">Tài khoản của tôi</Link></li>
            <li><Link href="/wishlist" className="hover:text-white transition-colors font-semibold">Danh sách yêu thích</Link></li>
            <li><Link href="/cart" className="hover:text-white transition-colors">Chính sách đổi trả</Link></li>
            <li><Link href="/cart" className="hover:text-white transition-colors">Chính sách bảo mật</Link></li>
            <li><Link href="/cart" className="hover:text-white transition-colors">Giao nhận & kiểm hàng</Link></li>
            <li><Link href="/cart" className="hover:text-white transition-colors">Chính sách thanh toán sỉ</Link></li>
          </ul>
        </div>

      </div>

      {/* THANH ĐỐI TÁC VẬN CHUYỂN & THANH TOÁN */}
      <div className="max-w-[1600px] mx-auto px-6 mt-10 pt-6 border-t border-emerald-800/80 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px]">
        <div className="flex items-center gap-3">
          <span className="text-emerald-300/70 flex items-center gap-1 font-medium">
            <Truck className="w-3.5 h-3.5 text-emerald-400" /> Đối tác vận chuyển:
          </span>
          <div className="flex items-center gap-1.5 font-bold font-mono text-[10px]">
            <span className="bg-emerald-900/80 border border-emerald-700/60 text-amber-300 px-2.5 py-1 rounded-lg">GHTK</span>
            <span className="bg-emerald-900/80 border border-emerald-700/60 text-orange-300 px-2.5 py-1 rounded-lg">GHN</span>
            <span className="bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 px-2.5 py-1 rounded-lg">GrabExpress</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-emerald-300/70 flex items-center gap-1 font-medium">
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Phương thức thanh toán:
          </span>
          <div className="flex items-center gap-1.5 font-bold font-mono text-[10px]">
            <span className="bg-emerald-900/80 border border-emerald-700/60 text-pink-300 px-2.5 py-1 rounded-lg">MOMO</span>
            <span className="bg-emerald-900/80 border border-emerald-700/60 text-blue-300 px-2.5 py-1 rounded-lg">ZaloPay</span>
            <span className="bg-emerald-900/80 border border-emerald-700/60 text-yellow-300 px-2.5 py-1 rounded-lg">VISA</span>
            <span className="bg-emerald-900/80 border border-emerald-700/60 text-slate-200 px-2.5 py-1 rounded-lg">Chuyển Khoản</span>
          </div>
        </div>
      </div>

      <div className="text-center pt-6 text-[10px] text-emerald-400/60 font-mono">
        © 2026 F&B STORE B2B SYSTEM. Tất cả quyền được bảo lưu.
      </div>
    </footer>
  )
}