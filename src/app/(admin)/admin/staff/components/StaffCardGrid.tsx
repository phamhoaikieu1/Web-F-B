'use client'

import { useState, useRef, useEffect } from 'react'
import { Profile, UserRole } from '@/types/database'
import { Crown, Briefcase, UserCheck, Clock, MoreVertical, Key, Trash2 } from 'lucide-react'

export interface DeletionRequestItem {
  id: string
  staff_id: string
  requested_by: string
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  created_at: string
  targetStaff?: Profile
  requesterStaff?: Profile
}

interface StaffCardGridProps {
  profiles: Profile[]
  currentUserProfile: Profile | null
  pendingRequests: DeletionRequestItem[]
  onResetPasswordClick: (staff: Profile) => void
  onRequestDeleteClick: (staff: Profile) => void
  onDirectDelete: (staff: Profile) => void
  onUpdateRole: (staff: Profile, newRole: UserRole) => void
}

export default function StaffCardGrid({
  profiles,
  currentUserProfile,
  pendingRequests,
  onResetPasswordClick,
  onRequestDeleteClick,
  onDirectDelete,
  onUpdateRole,
}: StaffCardGridProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const isCeo = currentUserProfile?.role === 'OWNER'

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (profiles.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">
        Không tìm thấy nhân sự nào
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" ref={menuRef}>
      {profiles.map((p) => {
        const hasPendingDelete = pendingRequests.some((r) => r.staff_id === p.id)
        const isMenuOpen = openMenuId === p.id

        return (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 relative hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center text-base uppercase shrink-0 border border-blue-100">
                    {p.full_name.slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{p.full_name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{p.email}</p>
                  </div>
                </div>

                {/* PHÂN CẤP VAI TRÒ VIỆT HÓA CHUẨN ERP */}
                {p.role === 'OWNER' && (
                  <span className="bg-gradient-to-r from-amber-500 to-purple-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs shrink-0">
                    <Crown className="w-3 h-3 text-amber-200" /> CEO
                  </span>
                )}
                {p.role === 'ADMIN' && (
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                    <Briefcase className="w-3 h-3 text-blue-600" /> Trưởng Phòng
                  </span>
                )}
                {p.role === 'STAFF' && (
                  <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                    <UserCheck className="w-3 h-3 text-slate-500" /> Nhân Viên
                  </span>
                )}
              </div>

              {hasPendingDelete && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-xl text-[11px] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Đã gửi Phiếu Xin Xóa ➔ Chờ CEO duyệt</span>
                </div>
              )}

              <p className="text-[10px] text-slate-400">
                Ngày tạo: {new Date(p.created_at).toLocaleDateString('vi-VN')}
              </p>
            </div>

            {/* MENU THAO TÁC ⋮ GỌN GÀNG */}
            {p.role !== 'OWNER' && (
              <div className="border-t border-slate-100 pt-3 flex items-center justify-end relative">
                <button
                  onClick={() => setOpenMenuId(isMenuOpen ? null : p.id)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
                  title="Thao tác"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* DROPDOWN MENU */}
                {isMenuOpen && (
                  <div className="absolute right-0 bottom-12 z-30 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 w-56 animate-in fade-in zoom-in-95 duration-150">
                    {/* Reset Mật Khẩu */}
                    <button
                      onClick={() => {
                        onResetPasswordClick(p)
                        setOpenMenuId(null)
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5 text-blue-600" /> Reset Mật Khẩu
                    </button>

                    {/* Đổi chức vụ (CEO only) */}
                    {isCeo && (
                      <button
                        onClick={() => {
                          onUpdateRole(p, p.role === 'ADMIN' ? 'STAFF' : 'ADMIN')
                          setOpenMenuId(null)
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                        {p.role === 'ADMIN' ? 'Hạ chức → Nhân Viên' : 'Thăng chức → Trưởng Phòng'}
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    {/* CEO xóa trực tiếp */}
                    {isCeo ? (
                      <button
                        onClick={() => {
                          onDirectDelete(p)
                          setOpenMenuId(null)
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa Vĩnh Viễn Tài Khoản
                      </button>
                    ) : (
                      // Trưởng Phòng xin xóa
                      p.role === 'STAFF' && (
                        <button
                          onClick={() => {
                            onRequestDeleteClick(p)
                            setOpenMenuId(null)
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Xin Xóa NV (Trình CEO)
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
