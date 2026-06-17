import api from '../lib/api';
import { Trainer } from '@/types/models';

export const trainerService = {
  getAllTrainers: async () => {
    const response = await api.get('/admin/trainers');
    return response.data?.data || [];
  },

  getTrainer: async (id: number) => {
    const response = await api.get(`/admin/trainers/${id}`);
    return response.data;
  },

  createTrainer: async (data: Partial<Trainer>) => {
    const response = await api.post('/admin/trainers', data);
    return response.data;
  },

  updateTrainer: async (id: number, data: Partial<Trainer>) => {
    const response = await api.put(`/admin/trainers/${id}`, data);
    return response.data;
  },

  deleteTrainer: async (id: number) => {
    const response = await api.delete(`/admin/trainers/${id}`);
    return response.data;
  }
};
