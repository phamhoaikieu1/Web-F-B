-- Migration: Bổ sung các cột Audit Trail cho bảng orders và tạo bảng system_audit_logs

-- 1. Bổ sung các cột truy vết nguồn gốc và nhân sự thao tác cho bảng orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS created_by_type TEXT DEFAULT 'CUSTOMER_SELF' CHECK (created_by_type IN ('CUSTOMER_SELF', 'ANONYMOUS_GUEST', 'STAFF_POS')),
ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS cancelled_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Tạo bảng system_audit_logs lưu lịch sử nhật ký biến động nhân sự và thao tác hệ thống
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    target_user_id UUID,
    target_name TEXT,
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kích hoạt Row Level Security (RLS) cho system_audit_logs
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Mọi người dùng authenticated có thể đọc nhật ký hệ thống
CREATE POLICY "Public authenticated read system_audit_logs" 
ON public.system_audit_logs FOR SELECT 
TO authenticated 
USING (true);

-- Policy: Nhân sự có quyền ghi nhật ký hệ thống
CREATE POLICY "Staff insert system_audit_logs" 
ON public.system_audit_logs FOR INSERT 
TO authenticated 
WITH CHECK (true);
