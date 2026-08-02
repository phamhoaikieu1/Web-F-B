-- ============================================================
-- MIGRATION: Nâng cấp hệ thống B2B - Công nợ, Vết thao tác, Tồn kho
-- Ngày: 2026-08-02
-- ============================================================

-- 1. Bổ sung cột Công nợ & Vết hoàn thành cho bảng orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'UNPAID',
ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_by_user_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS completed_by_name TEXT;

-- 2. Bổ sung cột ẩn sản phẩm ngừng bán cho bảng products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN DEFAULT false;

-- 3. Đảm bảo các cột audit trail trước đó vẫn tồn tại
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS approved_by_user_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS created_by_type TEXT DEFAULT 'CUSTOMER_SELF',
ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS cancelled_by_user_id UUID REFERENCES public.profiles(id);
