-- Migration: Add customer and product fields for cloud database sync

-- 1. Bổ sung cột is_disabled vào bảng products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN DEFAULT FALSE;

-- 2. Bổ sung các cột is_locked và custom_discount vào bảng profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS custom_discount TEXT DEFAULT NULL;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS store_name TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS address TEXT;

-- 3. Tạo UNIQUE constraint cho phone trong profiles nếu chưa có (phục vụ upsert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_phone_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_phone_key UNIQUE (phone);
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 4. Cập nhật RLS Policies cho bảng profiles
DROP POLICY IF EXISTS "Profiles Self Admin Update" ON public.profiles;

CREATE POLICY "Profiles Self Admin Update"
ON public.profiles FOR UPDATE
USING (
  auth.uid() = id OR (
    auth.role() = 'authenticated' AND public.get_user_role() IN ('STAFF', 'ADMIN', 'OWNER')
  )
);

DROP POLICY IF EXISTS "Profiles Staff Insert" ON public.profiles;

CREATE POLICY "Profiles Staff Insert"
ON public.profiles FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND public.get_user_role() IN ('STAFF', 'ADMIN', 'OWNER')
);
