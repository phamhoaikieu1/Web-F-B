'use client'

import { Profile } from '@/types/database'
import { Inbox, CheckCircle2, XCircle } from 'lucide-react'

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

interface ApprovalRequestsListProps {
  deletionRequests: DeletionRequestItem[]
  onApprove: (reqItem: DeletionRequestItem) => void
  onReject: (reqItem: DeletionRequestItem) => void
}

export default function ApprovalRequestsList({
  deletionRequests,
  onApprove,
  onReject,
}: ApprovalRequestsListProps) {
  const pendingRequests = deletionRequests.filter((r) => r.status === 'PENDING')

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Inbox className="w-5 h-5 text-blue-600" /> Danh Sách Phiếu Xin Duyệt Xóa Nhân Sự
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Các yêu cầu xóa nhân viên gửi từ Trưởng Phòng chờ Giám Đốc (CEO) quyết định
          </p>
        </div>
        <span className="bg-amber-100 text-amber-800 font-bold text-xs px-3 py-1 rounded-full">
          Chờ duyệt: {pendingRequests.length} phiếu
        </span>
      </div>

      {deletionRequests.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          Hiện chưa có phiếu yêu cầu xóa nhân sự nào
        </div>
      ) : (
        <div className="space-y-3">
          {deletionRequests.map((req) => (
            <div
              key={req.id}
              className={`p-4 rounded-2xl border transition-all text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                req.status === 'PENDING'
                  ? 'bg-amber-50/60 border-amber-200'
                  : req.status === 'APPROVED'
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : 'bg-rose-50/50 border-rose-200 opacity-60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    Nhân sự xin xóa: <strong className="text-rose-600">{req.targetStaff?.full_name || req.staff_id}</strong>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({req.targetStaff?.email})
                  </span>
                </div>

                <p className="text-slate-600">
                  Người tạo yêu cầu: <strong>{req.requesterStaff?.full_name || 'Trưởng Phòng'}</strong>
                </p>

                <p className="text-slate-700 italic bg-white p-2 rounded-xl border border-slate-200/80">
                  <strong>Lý do xin xóa:</strong> &quot;{req.reason}&quot;
                </p>

                <p className="text-[10px] text-slate-400">
                  Ngày gửi: {new Date(req.created_at).toLocaleString('vi-VN')}
                </p>
              </div>

              {req.status === 'PENDING' ? (
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => onApprove(req)}
                    className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" /> ✅ Duyệt Xóa
                  </button>

                  <button
                    onClick={() => onReject(req)}
                    className="flex-1 sm:flex-none bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" /> ❌ Từ Chối
                  </button>
                </div>
              ) : (
                <span className="font-bold px-3 py-1 rounded-full text-xs shrink-0 bg-slate-200 text-slate-700">
                  Trạng thái: {req.status}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
