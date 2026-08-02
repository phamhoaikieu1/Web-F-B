-- Migration: Bổ sung các cột truy vết nguồn gốc và nhân sự thao tác cho bảng orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS approved_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS created_by_type TEXT DEFAULT 'CUSTOMER_SELF',
ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS cancelled_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
