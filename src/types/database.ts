export type UserRole = 'OWNER' | 'ADMIN' | 'STAFF';

export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'DEBT';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  phone?: string;
  store_name?: string;
  address?: string;
  is_locked?: boolean;
  custom_discount?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  sku: string;
  unit: string;
  base_unit: string;
  conversion_rate: number;
  price: number;
  cost_price: number;
  stock_quantity: number;
  min_stock_alert: number;
  is_disabled?: boolean;
}

export interface Order {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  total_amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  payment_status?: PaymentStatus;
  paid_amount?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Audit trail fields
  created_by_type?: string;
  created_by_user_id?: string;
  created_by_name?: string;
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
  unit_price: number;
  subtotal: number;
}