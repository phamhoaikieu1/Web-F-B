'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Profile, UserRole } from '@/types/database'
import { ShieldCheck, UserPlus, Inbox, Search } from 'lucide-react'
import { toast } from 'sonner'
import CreateStaffModal from './components/CreateStaffModal'
import DeleteRequestModal from './components/DeleteRequestModal'
import ResetPasswordModal from './components/ResetPasswordModal'
import StaffCardGrid, { DeletionRequestItem } from './components/StaffCardGrid'
import ApprovalRequestsList from './components/ApprovalRequestsList'

export default function StaffManagementPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // State Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [requestDeleteStaff, setRequestDeleteStaff] = useState<Profile | null>(null)
  const [resetPassStaff, setResetPassStaff] = useState<Profile | null>(null)

  // Tab switcher dành cho Giám đốc CEO
  const [activeTab, setActiveTab] = useState<'STAFF_LIST' | 'APPROVAL_REQUESTS'>('STAFF_LIST')

  const fetchProfilesAndRequests = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: myProf } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (myProf) setCurrentUserProfile(myProf)
    }

    const { data: profData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    const profList = profData || []
    setProfiles(profList)

    // Lấy danh sách Phiếu Yêu Cầu Xóa
    const { data: reqData } = await supabase.from('deletion_requests').select('*').order('created_at', { ascending: false })
    if (reqData) {
      const formattedReqs: DeletionRequestItem[] = reqData.map((r: any) => ({
        ...r,
        targetStaff: profList.find((p) => p.id === r.staff_id),
        requesterStaff: profList.find((p) => p.id === r.requested_by),
      }))
      setDeletionRequests(formattedReqs)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchProfilesAndRequests()
  }, [])

  // GIÁM ĐỐC (CEO) DUYỆT XÓA VĨNH VIỄN PHIẾU YÊU CẦU
  const handleApproveDeleteRequest = async (reqItem: DeletionRequestItem) => {
    if (!confirm(`Xác nhận GIÁM ĐỐC (CEO) Phê duyệt xóa vĩnh viễn nhân sự ${reqItem.targetStaff?.full_name || ''}?`)) return

    try {
      const res = await fetch('/api/admin/staff/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE_DELETE',
          requestId: reqItem.id,
          staffId: reqItem.staff_id,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)

      toast.success(result.message)
      fetchProfilesAndRequests()
    } catch (err: any) {
      toast.error(`Lỗi phê duyệt: ${err.message}`)
    }
  }

  // GIÁM ĐỐC (CEO) TỪ CHỐI YÊU CẦU XÓA
  const handleRejectDeleteRequest = async (reqItem: DeletionRequestItem) => {
    try {
      const res = await fetch('/api/admin/staff/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT_DELETE', requestId: reqItem.id }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)

      toast.info(result.message)
      fetchProfilesAndRequests()
    } catch (err: any) {
      toast.error(`Lỗi thao tác: ${err.message}`)
    }
  }

  // GIÁM ĐỐC (CEO) XÓA TRỰC TIẾP TÀI KHOẢN
  const handleDirectDeleteStaff = async (p: Profile) => {
    if (!confirm(`Bạn có chắc muốn xóa vĩnh viễn tài khoản của ${p.full_name}?`)) return

    try {
      const res = await fetch('/api/admin/staff/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DIRECT_DELETE', staffId: p.id }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)

      toast.success(result.message)
      fetchProfilesAndRequests()
    } catch (err: any) {
      toast.error(`Lỗi xóa: ${err.message}`)
    }
  }

  // CHỨC NĂNG THĂNG CHỨC / HẠ CHỨC (OWNER)
  const handleUpdateRole = async (p: Profile, newRole: UserRole) => {
    try {
      const res = await fetch('/api/admin/staff/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_ROLE', staffId: p.id, newRole }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)

      toast.success(`Đã đổi chức vụ của ${p.full_name} thành ${newRole === 'ADMIN' ? 'Trưởng Phòng' : 'Nhân Viên'}`)
      fetchProfilesAndRequests()
    } catch (err: any) {
      toast.error(`Lỗi đổi chức vụ: ${err.message}`)
    }
  }

  const pendingRequests = deletionRequests.filter((r) => r.status === 'PENDING')
  const isCeo = currentUserProfile?.role === 'OWNER'

  // Lọc nhân sự theo tìm kiếm
  const filteredProfiles = profiles.filter((p) =>
    !searchTerm ||
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-blue-600" /> Quản Lý Nhân Sự
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Phân cấp: <strong>Giám Đốc (CEO)</strong> ➔ <strong>Trưởng Phòng (Leader)</strong> ➔ <strong>Nhân Viên (Sales/Kho)</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* NÚT CẤP TÀI KHOẢN MỚI */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            <UserPlus className="w-4 h-4" /> Cấp Tài Khoản Nhân Sự
          </button>

          {/* TAB CHUYỂN DÀNH CHO GIÁM ĐỐC CEO */}
          {isCeo && (
            <button
              onClick={() => setActiveTab(activeTab === 'STAFF_LIST' ? 'APPROVAL_REQUESTS' : 'STAFF_LIST')}
              className={`px-3.5 py-2.5 rounded-xl font-bold transition-all cursor-pointer text-xs flex items-center gap-1.5 relative ${
                activeTab === 'APPROVAL_REQUESTS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Inbox className="w-4 h-4" />
              📬 Duyệt Xóa
              {pendingRequests.length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse font-mono">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      {/* TAB 1: DANH SÁCH NHÂN SỰ DẠNG CARD-VIEW */}
      {activeTab === 'STAFF_LIST' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hoặc email nhân viên..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>

          <h2 className="font-bold text-slate-900 text-sm">
            Hồ Sơ Nhân Sự ({filteredProfiles.length})
          </h2>

          {loading ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">
              Đang tải danh sách nhân sự...
            </div>
          ) : (
            <StaffCardGrid
              profiles={filteredProfiles}
              currentUserProfile={currentUserProfile}
              pendingRequests={pendingRequests}
              onResetPasswordClick={(staff) => setResetPassStaff(staff)}
              onRequestDeleteClick={(staff) => setRequestDeleteStaff(staff)}
              onDirectDelete={handleDirectDeleteStaff}
              onUpdateRole={handleUpdateRole}
            />
          )}
        </div>
      )}

      {/* TAB 2: GIÁM ĐỐC (CEO) DUYỆT PHIẾU YÊU CẦU XÓA NHÂN SỰ */}
      {activeTab === 'APPROVAL_REQUESTS' && isCeo && (
        <ApprovalRequestsList
          deletionRequests={deletionRequests}
          onApprove={handleApproveDeleteRequest}
          onReject={handleRejectDeleteRequest}
        />
      )}

      {/* MODAL CẤP TÀI KHOẢN MỚI */}
      <CreateStaffModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchProfilesAndRequests}
      />

      {/* MODAL XIN XÓA NHÂN SỰ (TRÌNH CEO) */}
      <DeleteRequestModal
        staff={requestDeleteStaff}
        currentUserProfile={currentUserProfile}
        onClose={() => setRequestDeleteStaff(null)}
        onSuccess={fetchProfilesAndRequests}
      />

      {/* MODAL RESET MẬT KHẨU */}
      <ResetPasswordModal
        staff={resetPassStaff}
        onClose={() => setResetPassStaff(null)}
      />
    </main>
  )
}