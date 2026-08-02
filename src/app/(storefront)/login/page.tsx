'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { User, Lock, Mail, Phone, MapPin, Store, LogOut, CheckCircle2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { mergeGuestCartToUser, clearLocalGuestData } from '@/lib/syncCart'

export default function CustomerLoginPage() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isRegister, setIsRegister] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [storeName, setStoreName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUser(user)
      }
    }
    checkUser()

    const savedInfo = localStorage.getItem('b2b_customer_info')
    if (savedInfo) {
      try {
        const info = JSON.parse(savedInfo)
        setFullName(info.customerName || '')
        setStoreName(info.storeName || '')
        setPhone(info.customerPhone || '')
        setAddress(info.customerAddress || '')
      } catch (e) {}
    }
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isRegister) {
        // ĐĂNG KÝ KHÁCH HÀNG MỚI
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { 
                full_name: fullName.trim(), 
                store_name: storeName.trim(), 
                phone: phone.trim(), 
                address: address.trim(),
                role: 'STAFF'
            }
          }
        })
        if (error) throw error

        // Lưu địa chỉ giao hàng sẵn cho các đợt tạo đơn sau
        localStorage.setItem('b2b_customer_info', JSON.stringify({
          customerName: fullName.trim(),
          storeName: storeName.trim(),
          customerPhone: phone.trim(),
          customerAddress: address.trim()
        }))

        if (data.user) {
          await mergeGuestCartToUser(supabase, data.user)
        }

        toast.success('Đăng ký tài khoản sỉ thành công! Giỏ hàng đã được đồng bộ.')
        router.push('/')
      } else {
        // ĐĂNG NHẬP
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) throw error

        if (data.user) {
          await mergeGuestCartToUser(supabase, data.user)
        }

        toast.success('Đăng nhập thành công! Hệ thống đã đồng bộ giỏ hàng và danh sách yêu thích.')
        router.push('/')
      }
    } catch (err: any) {
      toast.error(`Lỗi xác thực: ${err.message || 'Không thể thao tác'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDefaultInfo = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('b2b_customer_info', JSON.stringify({
      customerName: fullName.trim(),
      storeName: storeName.trim(),
      customerPhone: phone.trim(),
      customerAddress: address.trim()
    }))
    toast.success('Đã lưu thông tin quán & địa chỉ giao hàng mặc định!')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    clearLocalGuestData()
    setCurrentUser(null)
    toast.info('Đã đăng xuất và dọn dẹp dữ liệu cá nhân')
    router.refresh()
  }

  // NẾU ĐÃ ĐĂNG NHẬP -> HIỂN THỊ THÔNG TIN TÀI KHOẢN CỦA KHÁCH
  if (currentUser) {
    return (
      <main className="p-4 md:p-8 max-w-2xl mx-auto space-y-6 bg-slate-50 min-h-[80vh]">
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 font-bold rounded-2xl flex items-center justify-center text-lg">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-base">Tài Khoản Khách Hàng B2B</h1>
                <p className="text-xs text-slate-400 font-mono">{currentUser.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" /> Thoát
            </button>
          </div>

          <form onSubmit={handleSaveDefaultInfo} className="space-y-4">
            <h2 className="font-bold text-xs uppercase text-slate-700 tracking-wider">Cài Đặt Địa Chỉ Giao Hàng Mặc Định</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tên Chủ Quán / Người Đặt:</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tên Quán / Thương Hiệu:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Trà Sữa Mixue"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Số Điện Thoại Zalo Nhận Đơn:</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Địa Chỉ Nhận Hàng Chi Tiết:</label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              LƯU THÔNG TIN GIAO HÀNG MẶC ĐỊNH
            </button>
          </form>
        </div>
      </main>
    )
  }

  // NẾU CHƯA ĐĂNG NHẬP -> FORM ĐĂNG NHẬP / ĐĂNG KÝ KHÁCH MUA SỈ
  return (
    <main className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex bg-emerald-600 p-3.5 rounded-2xl text-white mb-1 shadow-md">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            {isRegister ? 'Đăng Ký Tài Khoản Khách Sỉ' : 'Đăng Nhập Khách Hàng B2B'}
          </h1>
          <p className="text-xs text-slate-400">Tự động đồng bộ giỏ hàng và lưu địa chỉ nhận sỉ ưu đãi</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Chủ Quán / Người Đặt:</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Quán / Thương Hiệu F&B:</label>
                <div className="relative">
                  <Store className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ví dụ: Cafe Trà Sữa Đô Thành"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số Điện Thoại Zalo:</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Địa Chỉ Nhận Hàng Mặc Định:</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <textarea
                    rows={2}
                    required
                    placeholder="Số nhà, đường, quận/huyện..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Đăng Nhập:</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="khachhang@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mật Khẩu:</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all text-xs cursor-pointer shadow-md disabled:bg-slate-300 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'ĐANG XỬ LÝ...' : isRegister ? 'ĐĂNG KÝ TÀI KHOẢN MỚI' : 'ĐĂNG NHẬP KHÁCH HÀNG'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
          >
            {isRegister ? 'Đã có tài khoản? Đăng nhập ngay' : 'Chưa có tài khoản? Đăng ký tại đây'}
          </button>
        </div>
      </div>
    </main>
  )
}