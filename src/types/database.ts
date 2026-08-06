export type UserRole = 'ADMIN' | 'USER';

export type PaymentStatus = 'UNPAID' | 'PAID';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role?: UserRole;
  created_at?: string;
  phone?: string;
  store_name?: string;
  address?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
}

export interface Product {
  id: string;
  category_id?: string;
  sku: string;
  name: string;
  unit: string;             // Đơn vị sỉ (VD: Thùng)
  base_unit: string;        // Đơn vị lẻ (VD: Hộp/Chai)
  conversion_rate: number;  // Tỷ lệ quy đổi (1 Thùng = X Hộp)

  // Cụm định giá B2B theo ngưỡng số lượng (BR-01)
  retail_price: number;       // Giá bán lẻ khi mua dưới ngưỡng (< wholesale_min_qty)
  wholesale_price: number;    // Giá sỉ ưu đãi khi mua đủ ngưỡng (>= wholesale_min_qty)
  wholesale_min_qty: number;  // Số lượng tối thiểu để được giá sỉ (VD: 24)

  // Cụm quản lý tồn kho & Giá vốn MAC
  cost_price?: number;        // Giá nhập đợt gần nhất
  avg_cost_price?: number;    // Giá vốn bình quân di động (Moving Average Cost)
  stock_quantity: number;     // Số lượng tồn kho (tính theo base_unit)
  min_stock_alert: number;    // Ngưỡng cảnh báo tồn kho thấp
  is_disabled?: boolean;      // Trạng thái ngừng kinh doanh
}

export interface Order {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  store_name?: string;       // Tên quán/chuỗi F&B của khách B2B
  total_amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'; // 4 trạng thái chuẩn UC5
  payment_status?: PaymentStatus;
  paid_amount?: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
  approved_by_user_id?: string;
  approved_by_name?: string;
  cancelled_by_user_id?: string;
  cancelled_by_name?: string;
  completed_by_user_id?: string;
  completed_by_name?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number; // Snapshot Giá bán chốt tại thời điểm đặt
  cost_price?: number; // Snapshot Giá vốn MAC tại thời điểm xuất
  subtotal: number;   // quantity * unit_price
  products?: Product; // Relation join nếu có
}

export interface InventoryReceipt {
  id: string;
  product_id: string;
  import_quantity: number;
  import_price: number;
  notes?: string;
  created_at: string;
  products?: Product;
}

export interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  category?: string;
  thumbnail_url?: string;
  excerpt?: string;
  content?: string;
  is_published: boolean;
  created_at?: string;
}