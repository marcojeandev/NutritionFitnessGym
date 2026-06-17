import api from '../lib/api';
import { User } from '../types/models';

export const authService = {
  async login(credentials: Record<string, any>) {
    const response = await api.post('/login', credentials);
    return response.data; // e.g., { token: '...', user: {...} }
  },

  async register(data: Record<string, any> | FormData) {
    const response = await api.post('/register', data);
    return response.data;
  },

  async logout() {
    const response = await api.post('/logout');
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/user');
    // Laravel Resource wraps the response in a 'data' object
    return response.data.data ? response.data.data : response.data;
  },

  async changePassword(data: Record<string, any>) {
    const response = await api.post('/change-password', data);
    return response.data;
  },
};
