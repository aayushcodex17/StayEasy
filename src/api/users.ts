import api from './axios';
import type { Booking, User } from '../types';

export const usersApi = {
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/users/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch<User>('/users/profile', data);
    return response.data;
  },

  getMyBookings: async (): Promise<Booking[]> => {
    const response = await api.get<Booking[]>('/users/myBookings');
    const data = response.data;
    if (Array.isArray(data)) return data;
    if ((data as any)?.content) return (data as any).content;
    return [];
  },
};
