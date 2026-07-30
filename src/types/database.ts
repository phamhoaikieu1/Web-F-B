export type UserRole = 'OWNER' | 'ADMIN' | 'STAFF';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
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
}

export interface Order {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  total_amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}