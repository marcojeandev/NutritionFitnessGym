import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`,
  headers: {
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config: any) => {
    // Assuming token is stored in localStorage after login
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Response Interceptor: Handle Errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('token');
      // A full page reload or routing via React Router can happen here
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;
