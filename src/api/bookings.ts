import api from './axios';
import type { Booking, BookingRequest, Guest, PaymentSession } from '../types';

export const bookingsApi = {
  create: async (data: BookingRequest): Promise<Booking> => {
    const response = await api.post<Booking>('/bookings', data);
    return response.data;
  },

  addGuests: async (bookingId: string, guests: Guest[]): Promise<Booking> => {
    const response = await api.post<Booking>(`/bookings/${bookingId}/addGuests`, guests);
    return response.data;
  },

  initiatePayment: async (bookingId: string): Promise<PaymentSession> => {
    const response = await api.post<PaymentSession>(`/bookings/${bookingId}/payments`);
    return response.data;
  },

  cancel: async (bookingId: string): Promise<Booking> => {
    const response = await api.post<Booking>(`/bookings/${bookingId}/cancel`);
    return response.data;
  },

  updateStatus: async (bookingId: string, status: string): Promise<Booking> => {
    const response = await api.post<Booking>(`/bookings/${bookingId}/status`, { status });
    return response.data;
  },
};
