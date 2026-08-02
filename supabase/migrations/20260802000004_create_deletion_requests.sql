-- Migration: Tạo bảng deletion_requests lưu các Phiếu Yêu Cầu Xóa Nhân Sự gửi Giám Đốc (CEO) phê duyệt
CREATE TABLE IF NOT EXISTS public.deletion_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kích hoạt Row Level Security (RLS)
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Mọi người dùng đã xác thực (STAFF, ADMIN, OWNER) đều có thể xem danh sách phiếu yêu cầu
CREATE POLICY "Public authenticated read deletion_requests" 
ON public.deletion_requests FOR SELECT 
TO authenticated 
USING (true);

-- Policy: Nhân sự (ADMIN, OWNER) có quyền tạo phiếu yêu cầu xóa
CREATE POLICY "Staff insert deletion_requests" 
ON public.deletion_requests FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy: Giám đốc (OWNER) có quyền cập nhật trạng thái hoặc xóa phiếu
CREATE POLICY "Owner update deletion_requests" 
ON public.deletion_requests FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Owner delete deletion_requests" 
ON public.deletion_requests FOR DELETE 
TO authenticated 
USING (true);
