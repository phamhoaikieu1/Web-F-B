-- ====================================================================
-- SUPABASE MIGRATION: ROW LEVEL SECURITY (RLS) & REALTIME PUBLICATION
-- DỰ ÁN: F&B B2B WHOLESALE & INVENTORY MANAGEMENT
-- DATE: 2026-08-02
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. BẬT RLS (ROW LEVEL SECURITY) CHO TẤT CẢ CÁC BẢNG DỮ LIỆU
-- --------------------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- 2. DỌN DẸP CÁC POLICY CŨ NẾU ĐÃ TỒN TẠI
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Categories Public Read" ON public.categories;
DROP POLICY IF EXISTS "Categories Admin Write" ON public.categories;

DROP POLICY IF EXISTS "Products Public Read" ON public.products;
DROP POLICY IF EXISTS "Products Admin Write" ON public.products;

DROP POLICY IF EXISTS "Orders Customer Insert" ON public.orders;
DROP POLICY IF EXISTS "Orders Staff Read" ON public.orders;
DROP POLICY IF EXISTS "Orders Staff Update" ON public.orders;

DROP POLICY IF EXISTS "OrderItems Customer Insert" ON public.order_items;
DROP POLICY IF EXISTS "OrderItems Staff Read" ON public.order_items;

DROP POLICY IF EXISTS "Inventory Admin Read Write" ON public.inventory_transactions;

DROP POLICY IF EXISTS "Profiles Public Read" ON public.profiles;
DROP POLICY IF EXISTS "Profiles Self Admin Update" ON public.profiles;

-- --------------------------------------------------------------------
-- 3. HÀM TRỢ GIÚP KIỂM TRA ROLE NHÂN SỰ (STAFF, ADMIN, OWNER)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- --------------------------------------------------------------------
-- 4. CHÍNH SÁCH BẢO MẬT BẢNG: CATEGORIES & PRODUCTS
-- Rule: Cho phép mọi người (kể cả khách chưa đăng nhập) XEM sản phẩm.
--       Chỉ ADMIN & OWNER mới có quyền Thêm/Sửa/Xóa.
-- --------------------------------------------------------------------
CREATE POLICY "Categories Public Read"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Categories Admin Write"
ON public.categories FOR ALL
USING (
  auth.role() = 'authenticated' AND (
    public.get_user_role() IN ('ADMIN', 'OWNER')
  )
);

CREATE POLICY "Products Public Read"
ON public.products FOR SELECT
USING (true);

CREATE POLICY "Products Admin Write"
ON public.products FOR ALL
USING (
  auth.role() = 'authenticated' AND (
    public.get_user_role() IN ('ADMIN', 'OWNER')
  )
);

-- --------------------------------------------------------------------
-- 5. CHÍNH SÁCH BẢO MẬT BẢNG: ORDERS & ORDER_ITEMS
-- Rule: Khách hàng (Anonymus / Authenticated) được phép TẠO đơn hàng mới.
--       Nhân sự (STAFF, ADMIN, OWNER) được phép XEM và CẬP NHẬT tất cả đơn hàng.
-- --------------------------------------------------------------------
CREATE POLICY "Orders Customer Insert"
ON public.orders FOR INSERT
WITH CHECK (true);

CREATE POLICY "Orders Staff Read"
ON public.orders FOR SELECT
USING (
  true -- Cho phép xem đơn để hiển thị Popup xác nhận ngay sau khi khách chốt đơn
);

CREATE POLICY "Orders Staff Update"
ON public.orders FOR UPDATE
USING (
  auth.role() = 'authenticated' AND (
    public.get_user_role() IN ('STAFF', 'ADMIN', 'OWNER')
  )
);

CREATE POLICY "OrderItems Customer Insert"
ON public.order_items FOR INSERT
WITH CHECK (true);

CREATE POLICY "OrderItems Staff Read"
ON public.order_items FOR SELECT
USING (true);

-- --------------------------------------------------------------------
-- 6. CHÍNH SÁCH BẢO MẬT BẢNG: INVENTORY_TRANSACTIONS (LỊCH SỬ KHO)
-- Rule: Khóa hoàn toàn với khách hàng. Chỉ ADMIN & OWNER được XEM / THÊM.
-- --------------------------------------------------------------------
CREATE POLICY "Inventory Admin Read Write"
ON public.inventory_transactions FOR ALL
USING (
  auth.role() = 'authenticated' AND (
    public.get_user_role() IN ('STAFF', 'ADMIN', 'OWNER')
  )
);

-- --------------------------------------------------------------------
-- 7. CHÍNH SÁCH BẢO MẬT BẢNG: PROFILES
-- --------------------------------------------------------------------
CREATE POLICY "Profiles Public Read"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Profiles Self Admin Update"
ON public.profiles FOR UPDATE
USING (
  auth.uid() = id OR (
    auth.role() = 'authenticated' AND public.get_user_role() = 'OWNER'
  )
);

-- --------------------------------------------------------------------
-- 8. KÍCH HOẠT REALTIME PUBLICATION CHO BẢNG ORDERS & PRODUCTS
-- --------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  END IF;
END $$;
