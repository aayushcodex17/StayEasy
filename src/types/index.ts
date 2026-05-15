// ─── Auth ────────────────────────────────────────────────────────────────────

export type UserRole = 'GUEST' | 'HOTEL_MANAGER' | 'ADMIN';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;           // user id or email
  email?: string;
  name?: string;
  role?: UserRole;
  roles?: UserRole[];
  exp: number;
  iat: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// ─── Hotels ──────────────────────────────────────────────────────────────────

export interface Hotel {
  id: string;
  name: string;
  description: string;
  city: string;
  address: string;
  country?: string;
  thumbnailUrl?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  pricePerNight: number;
  amenities?: string[];
  latitude?: number;
  longitude?: number;
  managerId?: string;
  rooms?: Room[];
  createdAt?: string;
}

export interface HotelSearchParams {
  city?: string;
  checkInDate?: string;
  checkOutDate?: string;
  roomsCount?: number;
}

export interface HotelSearchResult {
  hotels: Hotel[];
  total?: number;
}

// ─── Rooms ───────────────────────────────────────────────────────────────────

export type RoomType = 'SINGLE' | 'DOUBLE' | 'SUITE' | 'DELUXE' | 'FAMILY' | 'STANDARD';

export interface Room {
  id: string;
  hotelId: string;
  type: RoomType;
  name?: string;
  description?: string;
  pricePerNight: number;
  capacity: number;
  available?: boolean;
  amenities?: string[];
  images?: string[];
  floorNumber?: number;
  roomNumber?: string;
}

export interface RoomInventory {
  roomId: string;
  date: string;
  available: boolean;
  price?: number;
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'PAYMENT_PENDING';

export interface BookingRequest {
  hotelId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
}

export interface Guest {
  name: string;
  email?: string;
  phone?: string;
  age?: number;
}

export interface Booking {
  id: string;
  userId: string;
  hotelId: string;
  roomId: string;
  hotel?: Hotel;
  room?: Room;
  checkInDate: string;
  checkOutDate: string;
  status: BookingStatus;
  totalAmount: number;
  guests?: Guest[];
  createdAt: string;
  updatedAt?: string;
  paymentSessionUrl?: string;
}

export interface PaymentSession {
  sessionUrl: string;
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export interface HotelReport {
  hotelId: string;
  totalRevenue: number;
  totalBookings: number;
  occupancyRate: number;
  period?: string;
}

// ─── Forms ───────────────────────────────────────────────────────────────────

export interface HotelFormData {
  name: string;
  description: string;
  city: string;
  address: string;
  country: string;
  pricePerNight: number;
  amenities: string[];
  thumbnailUrl?: string;
}

export interface RoomFormData {
  type: RoomType;
  name: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  floorNumber?: number;
  roomNumber?: string;
  amenities: string[];
}

// ─── API Response ────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// ─── UI ──────────────────────────────────────────────────────────────────────

export interface SearchState {
  city: string;
  checkInDate: string;
  checkOutDate: string;
  roomsCount: number;
}

export interface GuestCount {
  adults: number;
  children: number;
  infants: number;
}
