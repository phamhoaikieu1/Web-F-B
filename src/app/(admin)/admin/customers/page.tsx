'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Order } from '@/types/database'
import { Users, Search, ShoppingBag, Phone, MapPin, Tag, Lock, Unlock, Eye, X, Edit3, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface CustomerAggregated {
  phone: string
  name: string
  storeName: string
  address: string
  totalOrders: number
  totalRevenue: number
  totalDebt: number
  customDiscount: string
  isLocked: boolean
  profileId?: string
  ordersList: Order[]
}

type DebtFilter = 'ALL' | 'HAS_DEBT' | 'NO_DEBT'

export default function CustomersManagementPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [customers, setCustomers] = useState<CustomerAggregated[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debtFilter, setDebtFilter] = useState<DebtFilter>('ALL')

  // State cho Drawer Lịch sử Đơn & Modal Ghi chú Ưu đãi
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerAggregated | null>(null)
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false)
  const [discountModalCustomer, setDiscountModalCustomer] = useState<CustomerAggregated | null>(null)
  const [discountNote, setDiscountNote] = useState('')

  const fetchCustomerData = async () => {
    setLoading(true)
    const { data: ordersData, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Lỗi lấy dữ liệu đơn hàng khách sỉ:', error)
      setLoading(false)
      return
    }

    // Đọc danh sách profiles từ Supabase
    const { data: profData } = await supabase.from('profiles').select('*')
    const profileMap = new Map<string, any>()
    if (profData) {
      profData.forEach((p: any) => {
        if (p.phone) {
          profileMap.set(p.phone.trim(), p)
        }
      })
    }

    // Đọc danh sách blacklisted_phones từ Supabase
    const { data: blacklistData } = await supabase.from('blacklisted_phones').select('phone')
    const blacklistedSet = new Set<string>()
    if (blacklistData) {
      blacklistData.forEach((b: any) => {
        if (b.phone) {
          blacklistedSet.add(b.phone.trim())
        }
      })
    }

    // Tổng hợp khách sỉ theo Số Điện Thoại
    const map = new Map<string, CustomerAggregated>()

    for (const order of ordersData || []) {
      const phoneKey = order.customer_phone || 'N/A'
      const existing = map.get(phoneKey)
      const amount = Number(order.total_amount) || 0

      // Tính công nợ: Đơn COMPLETED có payment_status = UNPAID / PARTIAL / DEBT
      const isDebtOrder = (order.status === 'COMPLETED' || order.status === 'CONFIRMED') &&
        (order.payment_status === 'UNPAID' || order.payment_status === 'PARTIAL' || order.payment_status === 'DEBT' || !order.payment_status)
      const orderDebt = isDebtOrder ? (amount - (Number(order.paid_amount) || 0)) : 0

      if (existing) {
        existing.totalOrders += 1
        existing.totalRevenue += amount
        existing.totalDebt += Math.max(0, orderDebt)
        existing.ordersList.push(order)
      } else {
        const prof = profileMap.get(phoneKey)
        const isBlacklisted = blacklistedSet.has(phoneKey)
        map.set(phoneKey, {
          phone: phoneKey,
          name: order.customer_name,
          storeName: order.store_name || order.customer_name,
          address: order.customer_address || 'Chưa cập nhật',
          totalOrders: 1,
          totalRevenue: amount,
          totalDebt: Math.max(0, orderDebt),
          customDiscount: prof?.custom_discount || 'Chưa có chiết khấu riêng',
          isLocked: !!prof?.is_locked || isBlacklisted,
          profileId: prof?.id,
          ordersList: [order],
        })
      }
    }

    setCustomers(Array.from(map.values()))
    setLoading(false)
  }

  useEffect(() => {
    fetchCustomerData()
  }, [])

  const filteredCustomers = customers.filter((c) => {
    const matchSearch = !searchTerm ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)

    const matchDebt =
      debtFilter === 'ALL' ? true :
      debtFilter === 'HAS_DEBT' ? c.totalDebt > 0 :
      c.totalDebt === 0

    return matchSearch && matchDebt
  })

  // Tổng công nợ phải thu toàn hệ thống
  const totalSystemDebt = customers.reduce((sum, c) => sum + c.totalDebt, 0)

  const handleSaveDiscount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!discountModalCustomer) return

    const discountVal = discountNote.trim() || 'Chưa có chiết khấu riêng'

    try {
      if (discountModalCustomer.profileId) {
        const { error } = await supabase
          .from('profiles')
          .update({ custom_discount: discountVal })
          .eq('id', discountModalCustomer.profileId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            phone: discountModalCustomer.phone,
            full_name: discountModalCustomer.name,
            store_name: discountModalCustomer.storeName,
            address: discountModalCustomer.address,
            custom_discount: discountVal,
          }, { onConflict: 'phone' })
        if (error) throw error
      }

      toast.success(`Đã lưu ưu đãi riêng cho khách ${discountModalCustomer.name}!`)
      setDiscountModalCustomer(null)
      setDiscountNote('')
      fetchCustomerData()
    } catch (err: any) {
      toast.error(`Không thể lưu ưu đãi: ${err.message || 'Lỗi kết nối'}`)
    }
  }

  const handleToggleLockCustomer = async (customer: CustomerAggregated) => {
    const newLockState = !customer.isLocked
    const actionText = newLockState ? 'khóa' : 'mở khóa'

    if (!confirm(`Bạn có chắc muốn ${actionText} tài khoản sỉ của ${customer.name}?`)) return

    try {
      // 1. Cập nhật bảng profiles
      if (customer.profileId) {
        const { error } = await supabase
          .from('profiles')
          .update({ is_locked: newLockState })
          .eq('id', customer.profileId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            phone: customer.phone,
            full_name: customer.name,
            store_name: customer.storeName,
            address: customer.address,
            is_locked: newLockState,
          }, { onConflict: 'phone' })
        if (error) throw error
      }

      // 2. Đồng bộ bảng blacklisted_phones
      if (newLockState) {
        const { error: blError } = await supabase
          .from('blacklisted_phones')
          .upsert({ phone: customer.phone }, { onConflict: 'phone' })
        if (blError) console.error('Lỗi lưu blacklisted_phones:', blError)
      } else {
        const { error: blError } = await supabase
          .from('blacklisted_phones')
          .delete()
          .eq('phone', customer.phone)
        if (blError) console.error('Lỗi xóa blacklisted_phones:', blError)
      }

      toast.success(`Đã ${actionText} tài khoản khách sỉ ${customer.name}!`)
      fetchCustomerData()
    } catch (err: any) {
      toast.error(`Không thể ${actionText} tài khoản: ${err.message || 'Lỗi kết nối'}`)
    }
  }

  // Helper hiển thị payment status badge
  const PaymentBadge = ({ status }: { status?: string }) => {
    if (!status || status === 'UNPAID') return <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-bold">⏳ Chưa trả</span>
    if (status === 'PARTIAL') return <span className="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded text-[9px] font-bold">🔶 Trả 1 phần</span>
    if (status === 'PAID') return <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-bold">✅ Đã trả</span>
    if (status === 'DEBT') return <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded text-[9px] font-bold">🔴 Ghi nợ</span>
    return null
  }

  return (
    <main className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" /> Quản Lý Khách Hàng Sỉ B2B
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hồ sơ quán F&B, doanh số, công nợ phải thu & lịch sử đặt hàng
          </p>
        </div>

        {/* TỔNG CÔNG NỢ PHẢI THU */}
        {totalSystemDebt > 0 && (
          <div className="bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <div className="text-xs">
              <span className="text-rose-700 font-bold">Tổng Công Nợ Phải Thu:</span>
              <span className="font-extrabold text-rose-600 font-mono ml-1">{totalSystemDebt.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        )}
      </header>

      {/* BỘ LỌC & TÌM KIẾM */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Tên quán, Chủ quán hoặc SĐT..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-blue-500 shadow-2xs"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {([
            { key: 'ALL', label: 'Tất cả' },
            { key: 'HAS_DEBT', label: '🔴 Còn nợ' },
            { key: 'NO_DEBT', label: '✅ Không nợ' },
          ] as const).map((f) => (
            <button
              key={f.key}
              onClick={() => setDebtFilter(f.key as DebtFilter)}
              className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                debtFilter === f.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* DANH SÁCH KHÁCH HÀNG: DESKTOP TABLE + MOBILE CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="p-4">Chủ Quán / SĐT Zalo</th>
                <th className="p-4">Tên Quán & Địa Chỉ</th>
                <th className="p-4 text-center">Số Đơn</th>
                <th className="p-4 text-right">Tổng Doanh Số</th>
                <th className="p-4 text-right">Công Nợ</th>
                <th className="p-4">Ghi Chú Ưu Đãi</th>
                <th className="p-4 text-center">Trạng Thái</th>
                <th className="p-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Đang tải danh sách khách hàng sỉ...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Không tìm thấy dữ liệu khách hàng nào
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                      <p className="font-mono text-blue-600 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" /> {c.phone}
                      </p>
                    </td>

                    <td className="p-4 max-w-xs">
                      <p className="font-bold text-slate-800">{c.storeName}</p>
                      <p className="text-slate-500 truncate text-[11px] mt-0.5">{c.address}</p>
                    </td>

                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                        <ShoppingBag className="w-3 h-3 text-blue-600" /> {c.totalOrders}
                      </span>
                    </td>

                    <td className="p-4 text-right font-extrabold text-blue-600 font-mono text-sm">
                      {c.totalRevenue.toLocaleString('vi-VN')} đ
                    </td>

                    {/* CỘT CÔNG NỢ PHẢI THU */}
                    <td className="p-4 text-right">
                      {c.totalDebt > 0 ? (
                        <span className="font-extrabold text-rose-600 font-mono text-sm">
                          {c.totalDebt.toLocaleString('vi-VN')} đ
                        </span>
                      ) : (
                        <span className="text-emerald-600 text-[11px] font-bold">✅ Không nợ</span>
                      )}
                    </td>

                    <td className="p-4 max-w-xs">
                      <div className="flex items-center justify-between gap-1 bg-amber-50 border border-amber-200/80 p-2 rounded-xl text-amber-900">
                        <span className="truncate text-[11px] font-medium">{c.customDiscount}</span>
                        <button
                          onClick={() => {
                            setDiscountModalCustomer(c)
                            setDiscountNote(c.customDiscount)
                          }}
                          className="text-amber-700 hover:text-amber-950 p-1 cursor-pointer shrink-0"
                          title="Sửa ưu đãi riêng"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      {c.isLocked ? (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full font-bold text-[11px]">
                          <Lock className="w-3 h-3" /> Đã Khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold text-[11px]">
                          <Unlock className="w-3 h-3" /> Hoạt Động
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedCustomer(c)
                            setIsHistoryDrawerOpen(true)
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Xem lịch sử đặt hàng"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleLockCustomer(c)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            c.isLocked
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-rose-600 hover:bg-rose-50'
                          }`}
                          title={c.isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản khách sỉ'}
                        >
                          {c.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Đang tải...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">Không tìm thấy khách hàng</div>
          ) : (
            filteredCustomers.map((c, idx) => (
              <div key={idx} className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                    <p className="text-[11px] text-blue-600 font-mono">{c.phone}</p>
                    <p className="text-[10px] text-slate-500">{c.storeName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600 font-mono text-sm">{c.totalRevenue.toLocaleString('vi-VN')}đ</p>
                    {c.totalDebt > 0 && (
                      <p className="text-rose-600 font-bold text-[11px]">Nợ: {c.totalDebt.toLocaleString('vi-VN')}đ</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">{c.totalOrders} đơn</span>
                  {c.isLocked ? (
                    <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[10px] font-bold">Đã khóa</span>
                  ) : (
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">Hoạt động</span>
                  )}
                  <button
                    onClick={() => { setSelectedCustomer(c); setIsHistoryDrawerOpen(true) }}
                    className="ml-auto text-blue-600 text-[11px] font-bold cursor-pointer"
                  >
                    Xem đơn →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DRAWER XEM LỊCH SỬ ĐẶT HÀNG CỦA KHÁCH SỈ */}
      {isHistoryDrawerOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xl h-full overflow-y-auto p-6 space-y-5 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Hồ Sơ Khách Hàng Sỉ</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedCustomer.name}</h3>
                <p className="text-xs text-blue-600 font-mono">SĐT Zalo: {selectedCustomer.phone}</p>
              </div>
              <button
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-400">Tên quán / Chuỗi:</p>
                <p className="font-bold text-slate-800 text-sm">{selectedCustomer.storeName}</p>
              </div>
              <div>
                <p className="text-slate-400">Tổng doanh số tích lũy:</p>
                <p className="font-bold text-blue-600 text-sm font-mono">{selectedCustomer.totalRevenue.toLocaleString('vi-VN')} đ</p>
              </div>
              <div>
                <p className="text-slate-400">Công nợ phải thu:</p>
                <p className={`font-bold text-sm font-mono ${selectedCustomer.totalDebt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {selectedCustomer.totalDebt > 0 ? `${selectedCustomer.totalDebt.toLocaleString('vi-VN')} đ` : '✅ Không nợ'}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Địa chỉ giao hàng:</p>
                <p className="font-medium text-slate-800">{selectedCustomer.address}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center justify-between">
                <span>Lịch Sử Đơn Hàng ({selectedCustomer.ordersList.length})</span>
              </h4>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {selectedCustomer.ordersList.map((ord) => (
                  <div key={ord.id} className="bg-white border border-slate-200 rounded-xl p-3 text-xs space-y-1.5 shadow-2xs">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-blue-600">{ord.order_code}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(ord.created_at || Date.now()).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600">Trạng thái: <strong>{ord.status}</strong></span>
                        <PaymentBadge status={(ord as any).payment_status} />
                      </div>
                      <span className="font-extrabold text-slate-900 font-mono">
                        {Number(ord.total_amount).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    {ord.notes && (
                      <p className="text-[10px] italic text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        Ghi chú: {ord.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsHistoryDrawerOpen(false)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Đóng Cửa Sổ
            </button>
          </div>
        </div>
      )}

      {/* MODAL SỬA GHI CHÚ ƯU ĐÃI RIÊNG */}
      {discountModalCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveDiscount}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Cập Nhật Ưu Đãi Riêng</h3>
              <button
                type="button"
                onClick={() => setDiscountModalCustomer(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Cấu hình ưu đãi/chiết khấu riêng cho khách sỉ: <strong className="text-blue-600">{discountModalCustomer.name}</strong> ({discountModalCustomer.storeName})
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nội dung ưu đãi / Chiết khấu riêng:</label>
              <input
                type="text"
                required
                value={discountNote}
                onChange={(e) => setDiscountNote(e.target.value)}
                placeholder="Ví dụ: Giảm 5% đơn trên 10tr, Chiết khấu 10k/thùng siro..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDiscountModalCustomer(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}
