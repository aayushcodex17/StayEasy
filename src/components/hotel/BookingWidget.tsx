import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ChevronDown, Shield } from 'lucide-react';
import { differenceInCalendarDays, format, addDays } from 'date-fns';
import type { Hotel, Room } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { bookingsApi } from '../../api/bookings';
import { toast } from 'react-hot-toast';

interface BookingWidgetProps {
  hotel: Hotel;
  rooms?: Room[];
}

export function BookingWidget({ hotel, rooms = [] }: BookingWidgetProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const tomorrow = addDays(new Date(), 1);
  const dayAfter = addDays(new Date(), 2);

  const [checkIn, setCheckIn] = useState(format(tomorrow, 'yyyy-MM-dd'));
  const [checkOut, setCheckOut] = useState(format(dayAfter, 'yyyy-MM-dd'));
  const [guests, setGuests] = useState(1);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || '');
  const [isLoading, setIsLoading] = useState(false);

  const nights = Math.max(
    differenceInCalendarDays(new Date(checkOut), new Date(checkIn)),
    1
  );

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const pricePerNight = selectedRoom?.pricePerNight ?? hotel.pricePerNight ?? 0;
  const subtotal = pricePerNight * nights;
  const serviceFee = Math.round(subtotal * 0.14);
  const taxes = Math.round(subtotal * 0.18);
  const total = subtotal + serviceFee + taxes;

  const handleReserve = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to make a reservation.');
      return;
    }

    if (!selectedRoomId && rooms.length > 0) {
      toast.error('Please select a room.');
      return;
    }

    setIsLoading(true);
    try {
      const booking = await bookingsApi.create({
        hotelId: hotel.id,
        roomId: selectedRoomId || (rooms[0]?.id ?? ''),
        checkInDate: checkIn,
        checkOutDate: checkOut,
      });
      navigate(`/bookings/${booking.id}/confirm`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Could not create booking. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xl sticky top-24">
      {/* Price */}
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <span className="text-2xl font-extrabold text-gray-900">
            ₹{pricePerNight.toLocaleString('en-IN')}
          </span>
          <span className="text-gray-500 text-sm font-normal"> / night</span>
        </div>
        {hotel.rating !== undefined && (
          <div className="flex items-center gap-1">
            <Star size={14} className="text-primary-red fill-current" />
            <span className="text-sm font-bold">{hotel.rating.toFixed(1)}</span>
            {hotel.reviewCount && (
              <span className="text-xs text-gray-400">({hotel.reviewCount})</span>
            )}
          </div>
        )}
      </div>

      {/* Room selector */}
      {rooms.length > 0 && (
        <div className="mb-3">
          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
            Room type
          </label>
          <div className="relative">
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="input-field appearance-none pr-8 text-sm font-semibold"
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name || room.type} — ₹{room.pricePerNight?.toLocaleString('en-IN')}/night
                  {room.capacity ? ` (up to ${room.capacity} guests)` : ''}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Dates grid */}
      <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
        <div className="grid grid-cols-2 divide-x divide-gray-200">
          <div className="p-3">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Check-in</p>
            <input
              type="date"
              value={checkIn}
              min={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full text-sm font-semibold text-gray-800 outline-none bg-transparent"
            />
          </div>
          <div className="p-3">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Check-out</p>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full text-sm font-semibold text-gray-800 outline-none bg-transparent"
            />
          </div>
        </div>
        <div className="border-t border-gray-200 p-3">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Guests</p>
          <input
            type="number"
            value={guests}
            min={1}
            max={selectedRoom?.capacity ?? 10}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full text-sm font-semibold text-gray-800 outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Reserve button */}
      <button
        onClick={handleReserve}
        disabled={isLoading}
        className="btn-primary w-full py-4 text-base mb-3"
      >
        {isLoading ? 'Creating booking…' : 'Reserve'}
      </button>

      <p className="text-center text-xs text-gray-500 mb-4">You won't be charged yet</p>

      {/* Price breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-700">
          <span className="underline decoration-dotted cursor-help">
            ₹{pricePerNight.toLocaleString('en-IN')} × {nights} night{nights > 1 ? 's' : ''}
          </span>
          <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span className="underline decoration-dotted cursor-help">StayEase service fee</span>
          <span className="font-semibold">₹{serviceFee.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span className="underline decoration-dotted cursor-help">Taxes (18% GST)</span>
          <span className="font-semibold">₹{taxes.toLocaleString('en-IN')}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span>₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Trust badge */}
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <Shield size={14} className="text-green-500 flex-shrink-0" />
        <span>Secure payment powered by Stripe. Your booking is protected.</span>
      </div>
    </div>
  );
}
