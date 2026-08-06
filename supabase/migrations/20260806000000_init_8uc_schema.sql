-- 1. DANH MỤC (CATEGORIES) & TÀI KHOẢN (PROFILES)
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'ADMIN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  phone TEXT,
  store_name TEXT,
  address TEXT
);

-- 2. SẢN PHẨM / NGUYÊN LIỆU (PRODUCTS) - Giữ cost_price & avg_cost_price cho MAC
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR PRIMARY KEY,
  category_id VARCHAR REFERENCES categories(id),
  sku VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  unit VARCHAR NOT NULL,
  base_unit VARCHAR NOT NULL,
  conversion_rate INT DEFAULT 1,
  cost_price NUMERIC(12,2) DEFAULT 0,
  avg_cost_price NUMERIC(12,2) DEFAULT 0,
  retail_price NUMERIC(12,2) DEFAULT 0,
  wholesale_price NUMERIC(12,2) DEFAULT 0,
  wholesale_min_qty INT DEFAULT 24,
  stock_quantity INT DEFAULT 0,
  min_stock_alert INT DEFAULT 10,
  is_disabled BOOLEAN DEFAULT FALSE
);

-- 3. ĐƠN HÀNG (ORDERS) & CHI TIẾT ĐƠN HÀNG (ORDER_ITEMS)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  store_name TEXT,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')) DEFAULT 'PENDING',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR REFERENCES products(id),
  quantity INT NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,       -- Snapshot Giá bán tại thời điểm chốt
  cost_price NUMERIC(12,2) DEFAULT 0,        -- Snapshot Giá vốn MAC tại thời điểm xuất
  subtotal NUMERIC(12,2) NOT NULL            -- quantity * unit_price
);

-- 4. PHIẾU NHẬP KHO (INVENTORY_RECEIPTS) - Dùng cho UC7 & Thuật toán MAC
CREATE TABLE IF NOT EXISTS inventory_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id VARCHAR REFERENCES products(id),
  import_quantity INT NOT NULL,
  import_price NUMERIC(12,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);