import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, differenceInCalendarDays } from 'date-fns';
import {
  MapPin, Calendar, Users, Shield, CreditCard,
  ChevronLeft, CheckCircle2, AlertCircle
} from 'lucide-react';
import { usersApi } from '../api/users';
import { bookingsApi } from '../api/bookings';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';
import type { Guest } from '../types';

export function BookingConfirm() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // Fetch user bookings to find this one
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: usersApi.getMyBookings,
    staleTime: 0,
  });

  const booking = bookings.find((b) => b.id === bookingId);

  const nights = booking
    ? Math.max(differenceInCalendarDays(new Date(booking.checkOutDate), new Date(booking.checkInDate)), 1)
    : 1;

  const pricePerNight = booking?.room?.pricePerNight ?? booking?.hotel?.pricePerNight ?? 0;
  const subtotal = pricePerNight * nights;
  const serviceFee = Math.round(subtotal * 0.14);
  const taxes = Math.round(subtotal * 0.18);
  const total = subtotal + serviceFee + taxes;

  const handlePay = async () => {
    if (!bookingId) return;
    setIsProcessing(true);
    try {
      // Optionally add guests
      if (guestName.trim()) {
        const guests: Guest[] = [{
          name: guestName.trim(),
          email: guestEmail.trim() || undefined,
          phone: guestPhone.trim() || undefined,
        }];
        await bookingsApi.addGuests(bookingId, guests);
      }

      const { sessionUrl } = await bookingsApi.initiatePayment(bookingId);
      if (sessionUrl) {
        window.location.href = sessionUrl;
      } else {
        toast.error('Could not initiate payment. Please try again.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Payment initiation failed.';
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!bookingId || !confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingsApi.cancel(bookingId);
      toast.success('Booking cancelled.');
      navigate('/my-bookings');
    } catch {
      toast.error('Could not cancel booking.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading booking details…" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
          <AlertCircle size={48} className="text-red-400" />
          <h2 className="text-xl font-bold text-gray-700">Booking not found</h2>
          <p className="text-sm text-gray-500 text-center">
            We couldn't find booking #{bookingId}. It may have been cancelled or doesn't exist.
          </p>
          <Link to="/my-bookings" className="btn-primary px-6 py-2.5 text-sm">
            View my bookings
          </Link>
        </div>
      </div>
    );
  }

  const hotelName = booking.hotel?.name || 'Hotel';
  const city = booking.hotel?.city || '';
  const roomName = booking.room?.name || booking.room?.type || 'Standard Room';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Back */}
        <Link
          to={`/hotels/${booking.hotelId}`}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 font-semibold"
        >
          <ChevronLeft size={16} /> Back to hotel
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: booking details */}
          <div className="lg:col-span-3 space-y-5">
            {/* Status */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <div className="flex items-center gap-3 mb-1">
                {booking.status === 'PENDING' || booking.status === 'PAYMENT_PENDING' ? (
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <AlertCircle size={16} className="text-yellow-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-green-600" />
                  </div>
                )}
                <div>
                  <h1 className="text-lg font-extrabold text-gray-900">Confirm your booking</h1>
                  <p className="text-xs text-gray-500">Booking ID: {bookingId}</p>
                </div>
              </div>
            </div>

            {/* Hotel info */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h2 className="font-bold text-gray-900 mb-4 text-base">Your trip</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} className="text-primary-red" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Hotel</p>
                    <p className="font-semibold text-gray-900">{hotelName}</p>
                    {city && <p className="text-xs text-gray-500">{city}</p>}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar size={16} className="text-primary-red" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Dates</p>
                    <p className="font-semibold text-gray-900">
                      {format(new Date(booking.checkInDate), 'MMM d, yyyy')} →{' '}
                      {format(new Date(booking.checkOutDate), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-gray-500">{nights} night{nights > 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users size={16} className="text-primary-red" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Room</p>
                    <p className="font-semibold text-gray-900">{roomName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest details */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h2 className="font-bold text-gray-900 mb-4 text-base">Guest information (optional)</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Guest name</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Full name"
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Guest email</label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="guest@example.com"
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Phone (optional)</label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="input-field text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Cancellation policy */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h2 className="font-bold text-gray-900 mb-3 text-base">Cancellation policy</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Free cancellation before{' '}
                <span className="font-semibold">
                  {format(new Date(booking.checkInDate), 'MMM d, yyyy')}
                </span>
                . Cancel within 24 hours of booking to receive a full refund.
              </p>
            </div>
          </div>

          {/* Right: price summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg sticky top-24">
              {/* Hotel thumbnail */}
              <div className="rounded-xl overflow-hidden mb-4 aspect-video bg-gray-100">
                <img
                  src={
                    booking.hotel?.thumbnailUrl ||
                    `https://picsum.photos/seed/${booking.hotelId}/400/240`
                  }
                  alt={hotelName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${booking.hotelId}/400/240`;
                  }}
                />
              </div>

              <div className="mb-4">
                <p className="font-bold text-gray-900">{hotelName}</p>
                <p className="text-xs text-gray-500">{roomName}</p>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <h3 className="font-extrabold text-gray-900 mb-3">Price details</h3>
                <div className="flex justify-between text-gray-700">
                  <span>₹{pricePerNight.toLocaleString('en-IN')} × {nights} nights</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Service fee (14%)</span>
                  <span className="font-semibold">₹{serviceFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Taxes (18% GST)</span>
                  <span className="font-semibold">₹{taxes.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-extrabold text-gray-900 text-base">
                  <span>Total (INR)</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Pay button */}
              <button
                onClick={handlePay}
                disabled={isProcessing}
                className="btn-primary w-full py-4 mt-5 text-base"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner size="sm" color="white" />
                    Processing…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CreditCard size={18} />
                    Pay with Stripe
                  </span>
                )}
              </button>

              <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 justify-center">
                <Shield size={12} className="text-green-500" />
                Secured by Stripe · 256-bit SSL encryption
              </div>

              {/* Cancel */}
              <button
                onClick={handleCancel}
                className="mt-3 w-full py-2 text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
              >
                Cancel this booking
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
