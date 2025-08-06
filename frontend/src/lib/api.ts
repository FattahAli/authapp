import axios from 'axios';
import { ApiResponse, SignupFormData, LoginFormData, UpdateProfileFormData, OAuthLoginData } from '@/types';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Don't automatically redirect on 401 - let components handle it
    return Promise.reject(error);
  }
);

export const authApi = {
  signup: async (formData: FormData): Promise<ApiResponse> => {
    const response = await api.post('/auth/signup', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  login: async (data: LoginFormData): Promise<ApiResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  oauthLogin: async (data: OAuthLoginData & { userData?: any }): Promise<ApiResponse> => {
    const response = await api.post('/auth/oauth/login', data);
    return response.data;
  },

  resetPassword: async (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse> => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getMe: async (): Promise<ApiResponse> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const usersApi = {
  getAllUsers: async (page = 1, limit = 10): Promise<ApiResponse> => {
    const response = await api.get(`/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  getUserById: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateProfile: async (formData: FormData): Promise<ApiResponse> => {
    const response = await api.put('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default api; 