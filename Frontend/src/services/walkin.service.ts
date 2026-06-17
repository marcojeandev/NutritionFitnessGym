import api from '../lib/api';
import { WalkInInfo, WalkInAttendance } from '../types/models';
import { useAuthStore } from '../store/useAuthStore';

const getPrefix = () => {
  const role = useAuthStore.getState().user?.role;
  return role === 'cashier' ? 'cashier' : 'admin';
};

export const walkinService = {
  async getWalkins(): Promise<WalkInInfo[]> {
    const response = await api.get(`${getPrefix()}/walkins`);
    return response.data?.data || response.data || [];
  },

  async registerWalkin(data: Partial<WalkInInfo>): Promise<WalkInInfo> {
    const response = await api.post(`${getPrefix()}/walkins`, data);
    return response.data?.data || response.data;
  },

  async getWalkinAttendance(): Promise<WalkInAttendance[]> {
    const response = await api.get(`${getPrefix()}/walkins-attendance`);
    return response.data?.data || response.data || [];
  },

  async recordAttendance(data: Partial<WalkInAttendance>): Promise<WalkInAttendance> {
    const response = await api.post(`${getPrefix()}/walkins-attendance`, data);
    return response.data?.data || response.data;
  },

  async getWalkinById(id: number): Promise<WalkInInfo> {
    const response = await api.get(`${getPrefix()}/walkins/${id}`);
    return response.data?.data || response.data;
  },

  async updateWalkin(id: number, data: Partial<WalkInInfo>): Promise<WalkInInfo> {
    const response = await api.put(`${getPrefix()}/walkins/${id}`, data);
    return response.data?.data || response.data;
  },

  async deleteWalkin(id: number): Promise<void> {
    await api.delete(`${getPrefix()}/walkins/${id}`);
  },

  async getWalkinAttendanceById(id: number): Promise<WalkInAttendance> {
    const response = await api.get(`${getPrefix()}/walkins-attendance/${id}`);
    return response.data?.data || response.data;
  },

  async updateWalkinAttendance(id: number, data: Partial<WalkInAttendance>): Promise<WalkInAttendance> {
    const response = await api.put(`${getPrefix()}/walkins-attendance/${id}`, data);
    return response.data?.data || response.data;
  },

  async deleteWalkinAttendance(id: number): Promise<void> {
    await api.delete(`${getPrefix()}/walkins-attendance/${id}`);
  },
};
