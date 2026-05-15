import api from './axios';
import type { Hotel, HotelFormData, HotelSearchParams, Room, RoomFormData, Booking, HotelReport } from '../types';

// ─── Public ──────────────────────────────────────────────────────────────────

export const hotelsApi = {
  search: async (params: HotelSearchParams): Promise<Hotel[]> => {
    const response = await api.get<Hotel[]>('/hotels/search', { params });
    // Handle both array and wrapped response
    const data = response.data;
    if (Array.isArray(data)) return data;
    if ((data as any)?.content) return (data as any).content;
    if ((data as any)?.hotels) return (data as any).hotels;
    return [];
  },

  getById: async (hotelId: string): Promise<Hotel> => {
    const response = await api.get<Hotel>(`/hotels/${hotelId}`);
    return response.data;
  },
};

// ─── Admin / Hotel Manager ────────────────────────────────────────────────────

export const adminHotelsApi = {
  getMyHotels: async (): Promise<Hotel[]> => {
    const response = await api.get<Hotel[]>('/admin/hotels');
    const data = response.data;
    if (Array.isArray(data)) return data;
    if ((data as any)?.content) return (data as any).content;
    return [];
  },

  createHotel: async (data: HotelFormData): Promise<Hotel> => {
    const response = await api.post<Hotel>('/admin/hotels', data);
    return response.data;
  },

  updateHotel: async (hotelId: string, data: Partial<HotelFormData>): Promise<Hotel> => {
    const response = await api.put<Hotel>(`/admin/hotels/${hotelId}`, data);
    return response.data;
  },

  deleteHotel: async (hotelId: string): Promise<void> => {
    await api.delete(`/admin/hotels/${hotelId}`);
  },

  getHotelBookings: async (hotelId: string): Promise<Booking[]> => {
    const response = await api.get<Booking[]>(`/admin/hotels/${hotelId}/bookings`);
    const data = response.data;
    if (Array.isArray(data)) return data;
    if ((data as any)?.content) return (data as any).content;
    return [];
  },

  getHotelReport: async (hotelId: string): Promise<HotelReport> => {
    const response = await api.get<HotelReport>(`/admin/hotels/${hotelId}/reports`);
    return response.data;
  },

  // Rooms
  getRooms: async (hotelId: string): Promise<Room[]> => {
    const response = await api.get<Room[]>(`/admin/hotels/${hotelId}/rooms`);
    const data = response.data;
    if (Array.isArray(data)) return data;
    if ((data as any)?.content) return (data as any).content;
    return [];
  },

  createRoom: async (hotelId: string, data: RoomFormData): Promise<Room> => {
    const response = await api.post<Room>(`/admin/hotels/${hotelId}/rooms`, data);
    return response.data;
  },

  updateRoom: async (hotelId: string, roomId: string, data: Partial<RoomFormData>): Promise<Room> => {
    const response = await api.put<Room>(`/admin/hotels/${hotelId}/rooms/${roomId}`, data);
    return response.data;
  },

  deleteRoom: async (hotelId: string, roomId: string): Promise<void> => {
    await api.delete(`/admin/hotels/${hotelId}/rooms/${roomId}`);
  },

  // Inventory
  getRoomInventory: async (roomId: string): Promise<any> => {
    const response = await api.get(`/admin/inventory/rooms/${roomId}`);
    return response.data;
  },

  updateRoomInventory: async (roomId: string, data: any): Promise<any> => {
    const response = await api.patch(`/admin/inventory/rooms/${roomId}`, data);
    return response.data;
  },
};
