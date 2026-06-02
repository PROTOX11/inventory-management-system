export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  initial_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProductInput {
  sku: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  initial_quantity: number;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  initial_quantity?: number;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerInput {
  email: string;
  name: string;
  phone: string;
  address: string;
}

export interface UpdateCustomerInput {
  name?: string;
  phone?: string;
  address?: string;
}

export interface OrderItem {
  id?: number;
  product_id: string;
  quantity: number;
  price: number;
  unit_price: number;
  total_price: number;
  created_at?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderInput {
  customer_id: string;
  items: OrderItem[];
}

export interface UpdateOrderInput {
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
}

export interface InventoryRecord {
  product_id: string;
  quantity: number;
  reserved: number;
  available: number;
}

export interface DashboardStats {
  total_products: number;
  total_customers: number;
  total_orders: number;
  total_revenue: number;
  low_stock_products: number;
  pending_orders: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string>;
}
