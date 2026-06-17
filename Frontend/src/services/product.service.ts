import api from '../lib/api';
import { Product } from '@/types/models';
import { useAuthStore } from '../store/useAuthStore';

const getPrefix = () => {
  const role = useAuthStore.getState().user?.role;
  return role === 'cashier' ? 'cashier' : 'admin';
};

// Product sold item (from product_sold table)
export interface ProductSoldItem {
  id: number;
  paycheck_id: number;
  product_id: number;
  quantity: number;
  price_at_sale: number;
  product?: Product;
  created_at: string;
  updated_at: string;
}

// Paycheck/Receipt header
export interface Paycheck {
  id: number;
  sold_by: number;
  paid_by?: number | null;
  paid_by_name?: string | null;
  payment_type: 'cash' | 'gcash';
  or_number: string;
  transaction_id?: string | null;
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  updated_at: string;
  items?: ProductSoldItem[];
  product?: Product;
  quantity?: number;
  unit_price?: number;
  total_price?: number;
}

// Payload for creating a paycheck (multiple products)
export interface SubmitPaycheckPayload {
  sold_by: number;
  paid_by?: number | null;
  paid_by_name?: string | null;
  payment_type: 'cash' | 'gcash';
  or_number: string;
  transaction_id?: string | null;
  payment_status?: 'pending' | 'paid' | 'failed';
  products: Array<{
    product_id: number;
    quantity: number;
    price_at_sale: number;
  }>;
}

// Payload for updating a paycheck
export interface UpdatePaycheckPayload {
  payment_type?: 'cash' | 'gcash';
  transaction_id?: string | null;
  payment_status?: 'pending' | 'paid' | 'failed';
  products?: Array<{
    product_id: number;
    quantity: number;
    price_at_sale: number;
  }>;
}

export const productService = {
  // ==================== PRODUCT CRUD ====================
  
  async getAllProducts(): Promise<Product[]> {
    const response = await api.get(`${getPrefix()}/products`);
    return response.data?.data || response.data || [];
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const response = await api.post('admin/products', data);
    return response.data?.data || response.data;
  },

  async createProductWithImage(formData: FormData): Promise<Product> {
    const response = await api.post('admin/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data?.data || response.data;
  },

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    const response = await api.put(`admin/products/${id}`, data);
    return response.data?.data || response.data;
  },

  async updateProductWithImage(id: number, formData: FormData): Promise<Product> {
    const response = await api.post(`admin/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data?.data || response.data;
  },

  async deleteProduct(id: number): Promise<void> {
    await api.delete(`admin/products/${id}`);
  },

  // ==================== PAYCHECK CRUD ====================

  async getPaychecks(): Promise<Paycheck[]> {
    try {
      const response = await api.get(`${getPrefix()}/products-paycheck`);
      const data = response.data?.data || response.data || [];
      return data;
    } catch (error: any) {
      console.warn("Failed to fetch sales history:", error);
      return [];
    }
  },

  async submitPaycheck(payload: SubmitPaycheckPayload): Promise<Paycheck> {
    const response = await api.post(`${getPrefix()}/products-paycheck`, payload);
    return response.data?.data || response.data;
  },

  async getPaycheckById(id: number): Promise<Paycheck> {
    const response = await api.get(`${getPrefix()}/products-paycheck/${id}`);
    return response.data?.data || response.data;
  },

  async updatePaycheck(id: number, data: UpdatePaycheckPayload): Promise<Paycheck> {
    const response = await api.put(`${getPrefix()}/products-paycheck/${id}`, data);
    return response.data?.data || response.data;
  },

  async deletePaycheck(id: number): Promise<void> {
    await api.delete(`${getPrefix()}/products-paycheck/${id}`);
  }
};