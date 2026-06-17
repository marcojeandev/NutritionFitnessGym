import api from '../lib/api';
import { Attendance } from '../types/models';

export const attendanceService = {
  async getAllAttendance(params?: Record<string, any>): Promise<Attendance[]> {
    const response = await api.get('admin/attendance', { params });
    return response.data?.data?.data || response.data?.data || response.data || [];
  },

  async getMemberAttendance(params?: Record<string, any>): Promise<Attendance[]> {
    const response = await api.get('member/attendance', { params });
    return response.data?.data?.data || response.data?.data || response.data || [];
  },

  async getAttendanceById(id: number): Promise<Attendance> {
    const response = await api.get(`admin/attendance/${id}`);
    return response.data?.data || response.data;
  },

  async recordAttendance(data: Partial<Attendance>): Promise<Attendance> {
    const response = await api.post('admin/attendance', data);
    return response.data?.data || response.data;
  },

  async updateAttendance(id: number, data: Partial<Attendance>): Promise<Attendance> {
    const response = await api.put(`admin/attendance/${id}`, data);
    return response.data?.data || response.data;
  },

  async deleteAttendance(id: number): Promise<void> {
    await api.delete(`admin/attendance/${id}`);
  },
};
