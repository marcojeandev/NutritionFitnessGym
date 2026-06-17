import api from '@/lib/api';

export interface Reservation {
  id?: number;
  fullname: string;
  date: string;
  time_start: string;
  time_end: string;
  payment_type: 'cash' | 'gcash';
  reservation_amount: number;
  payment_amount: number;
  or_number?: string;
  transaction_id?: string;
  payment_status: 'pending' | 'paid' | 'failed';
  reservation_status: 'active' | 'expired';
  created_at?: string;
  updated_at?: string;
}

export const reservationService = {
  async getReservations(): Promise<Reservation[]> {
    const response = await api.get('/admin/reservations');
    return response.data?.data || response.data;
  },

  async getReservationById(id: number): Promise<Reservation> {
    const response = await api.get(`/admin/reservations/${id}`);
    return response.data?.data || response.data;
  },

  async createReservation(data: Reservation): Promise<Reservation> {
    const response = await api.post('/admin/reservations', data);
    return response.data?.data || response.data;
  },

  async updateReservation(id: number, data: Partial<Reservation>): Promise<Reservation> {
    const response = await api.put(`/admin/reservations/${id}`, data);
    return response.data?.data || response.data;
  },

  async deleteReservation(id: number): Promise<void> {
    await api.delete(`/admin/reservations/${id}`);
  },
};
