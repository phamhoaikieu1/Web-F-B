-- Migration: Fix orders_status_check constraint & Add blacklisted_phones table

-- 1. Sửa lỗi Check Constraint cho bảng orders
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED'));

-- 2. Tạo bảng blacklisted_phones để lưu danh sách SĐT bị khóa đặt sỉ
CREATE TABLE IF NOT EXISTS public.blacklisted_phones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kích hoạt RLS cho blacklisted_phones
ALTER TABLE public.blacklisted_phones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Blacklisted Phones Public Read" ON public.blacklisted_phones;
CREATE POLICY "Blacklisted Phones Public Read"
ON public.blacklisted_phones FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Blacklisted Phones Staff Write" ON public.blacklisted_phones;
CREATE POLICY "Blacklisted Phones Staff Write"
ON public.blacklisted_phones FOR ALL
USING (
  auth.role() = 'authenticated' AND (
    public.get_user_role() IN ('STAFF', 'ADMIN', 'OWNER')
  )
);
