import api from './axios';
import type { AuthTokens, LoginRequest, SignupRequest } from '../types';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthTokens> => {
    const response = await api.post<AuthTokens>('/auth/login', data);
    return response.data;
  },

  signup: async (data: SignupRequest): Promise<AuthTokens> => {
    const response = await api.post<AuthTokens>('/auth/signup', data);
    return response.data;
  },

  registerAsHotelManager: async (data: Omit<SignupRequest, 'role'>): Promise<AuthTokens> => {
    const response = await api.post<AuthTokens>('/auth/registerAsHotelManager', {
      ...data,
      role: 'HOTEL_MANAGER',
    });
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await api.post<{ accessToken: string }>('/auth/refresh', { refreshToken });
    return response.data;
  },
};
