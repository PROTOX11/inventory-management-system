import { ApiError, Product, Customer, Order, DashboardStats } from './types';
import { getToken, setAuth, AuthUser } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = false
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (requiresAuth) {
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 204) return undefined as T;

    if (!response.ok) {
      let error: ApiError = {
        message: 'An error occurred',
        code: 'UNKNOWN_ERROR',
      };

      try {
        const body = await response.json();
        error.message = body.detail || body.message || `HTTP ${response.status}`;
        error.code = `HTTP_${response.status}`;
      } catch {
        error.message = `HTTP ${response.status}: ${response.statusText}`;
        error.code = `HTTP_${response.status}`;
      }

      throw error;
    }

    return response.json();
  }


  async loginMerchant(email: string, password: string): Promise<AuthUser> {
    const result = await this.request<AuthUser>('/auth/merchant/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuth(result);
    return result;
  }

  async registerMerchant(name: string, email: string, password: string): Promise<any> {
    return this.request('/auth/merchant/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async loginCustomer(email: string, password: string): Promise<AuthUser> {
    const result = await this.request<AuthUser>('/auth/customer/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuth(result);
    return result;
  }

  async registerCustomer(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  }): Promise<any> {
    return this.request('/auth/customer/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<any> {
    return this.request('/auth/me', {}, true);
  }


  async getProducts(skip: number = 0, limit: number = 100): Promise<Product[]> {
    return this.request<Product[]>(`/products?skip=${skip}&limit=${limit}`);
  }

  async getProduct(id: string | number): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(data: any): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async updateProduct(id: string | number, data: any): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  }

  async deleteProduct(id: string | number): Promise<void> {
    return this.request<void>(`/products/${id}`, { method: 'DELETE' }, true);
  }


  async getCustomers(skip: number = 0, limit: number = 100): Promise<Customer[]> {
    return this.request<Customer[]>(`/customers?skip=${skip}&limit=${limit}`, {}, true);
  }

  async getCustomer(id: string | number): Promise<Customer> {
    return this.request<Customer>(`/customers/${id}`, {}, true);
  }

  async createCustomer(data: any): Promise<Customer> {
    return this.request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async updateCustomer(id: string | number, data: any): Promise<Customer> {
    return this.request<Customer>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  }

  async deleteCustomer(id: string | number): Promise<void> {
    return this.request<void>(`/customers/${id}`, { method: 'DELETE' }, true);
  }


  async getOrders(skip: number = 0, limit: number = 100): Promise<Order[]> {
    return this.request<Order[]>(`/orders?skip=${skip}&limit=${limit}`, {}, true);
  }

  async getMyOrders(skip: number = 0, limit: number = 100): Promise<Order[]> {
    return this.request<Order[]>(`/orders/my?skip=${skip}&limit=${limit}`, {}, true);
  }

  async getOrder(id: string | number): Promise<Order> {
    return this.request<Order>(`/orders/${id}`, {}, true);
  }

  async createOrder(data: { customer_id?: string | number; items: { product_id: number; quantity: number }[]; notes?: string }): Promise<Order> {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async updateOrder(id: string | number, data: any): Promise<Order> {
    return this.request<Order>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  }

  async deleteOrder(id: string | number): Promise<void> {
    return this.request<void>(`/orders/${id}`, {
      method: 'DELETE',
    }, true);
  }


  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/stats', {}, true);
  }
}

export const apiClient = new ApiClient();
