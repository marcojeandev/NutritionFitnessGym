import api from '../lib/api';
import { User } from '../types/models';
import { useAuthStore } from '../store/useAuthStore';

const getPrefix = () => {
  const role = useAuthStore.getState().user?.role;
  return role === 'cashier' ? 'cashier' : 'admin';
};

export const userService = {
  async getAllUsers(params?: Record<string, any>): Promise<User[]> {
    const response = await api.get(`${getPrefix()}/users`, { params });
    // Laravel paginates the admin/users response: response.data.data.data contains the actual array
    return response.data?.data?.data || [];
  },

  async approveUser(id: number, paymentDetails?: { payment_type: string, or_number?: string, payment_amount: number }): Promise<any> {
    const response = await api.patch(`${getPrefix()}/users/${id}/approve`, paymentDetails);
    return response.data;
  },

  async getUserById(id: number): Promise<User> {
    const response = await api.get(`${getPrefix()}/users/${id}`);
    return response.data;
  },

  async createUser(data: Partial<User>): Promise<User> {
    const response = await api.post(`${getPrefix()}/users`, data);
    return response.data;
  },

  async createSystemAccount(data: Partial<User> | FormData): Promise<User> {
    const response = await api.post(`${getPrefix()}/users/systemAccount`, data);
    return response.data;
  },

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const response = await api.put(`${getPrefix()}/users/${id}`, data);
    return response.data;
  },

  async updateRole(id: number, role: string): Promise<any> {
    // Note: Cashier does not have this endpoint, only admin
    const response = await api.patch(`admin/users/${id}/role`, { role });
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`${getPrefix()}/users/${id}`);
  },
};
