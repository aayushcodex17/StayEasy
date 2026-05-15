import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, differenceInCalendarDays } from 'date-fns';
import { CalendarDays, MapPin, Clock, CheckCircle2, XCircle, CreditCard } from 'lucide-react';
import { usersApi } from '../api/users';
import { bookingsApi } from '../api/bookings';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { BookingStatus } from '../types';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={13} /> },
  CONFIRMED: { label: 'Confirmed', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 size={13} /> },
  PAYMENT_PENDING: { label: 'Awaiting Payment', color: 'bg-blue-100 text-blue-800', icon: <CreditCard size={13} /> },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: <XCircle size={13} /> },
  COMPLETED: { label: 'Completed', color: 'bg-gray-100 text-gray-700', icon: <CheckCircle2 size={13} /> },
};

const TABS = ['All', 'Upcoming', 'Past', 'Cancelled'] as const;
type TabType = typeof TABS[number];

export function MyBookings() {
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: usersApi.getMyBookings,
    staleTime: 0,
  });

  const cancelMutation = useMutation({
    mutationFn: bookingsApi.cancel,
    onSuccess: () => {
      toast.success('Booking cancelled successfully.');
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    },
    onError: () => toast.error('Could not cancel booking.'),
  });

  const now = new Date();
  const filtered = bookings.filter((b) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Upcoming') return new Date(b.checkInDate) >= now && b.status !== 'CANCELLED';
    if (activeTab === 'Past') return new Date(b.checkOutDate) < now && b.status !== 'CANCELLED';
    if (activeTab === 'Cancelled') return b.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">My bookings</h1>
        <p className="text-sm text-gray-500 mb-6">
          {bookings.length} total booking{bookings.length !== 1 ? 's' : ''}
        </p>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                activeTab === tab
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" text="Loading your bookings…" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">No bookings found</h3>
            <p className="text-sm text-gray-500 mb-6">
              {activeTab === 'All'
                ? "You haven't made any bookings yet."
                : `No ${activeTab.toLowerCase()} bookings.`}
            </p>
            <Link to="/" className="btn-primary px-6 py-2.5 text-sm">
              Explore stays
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => {
              const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
              const nights = Math.max(
                differenceInCalendarDays(
                  new Date(booking.checkOutDate),
                  new Date(booking.checkInDate)
                ),
                1
              );
              const hotelName = booking.hotel?.name || `Hotel #${booking.hotelId.slice(-4)}`;
              const city = booking.hotel?.city || '';
              const roomName = booking.room?.name || booking.room?.type || 'Standard Room';
              const total = booking.totalAmount || 0;
              const imgSrc = booking.hotel?.thumbnailUrl || `https://picsum.photos/seed/${booking.hotelId}/300/200`;

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow animate-fade-in"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="sm:w-48 h-40 sm:h-auto flex-shrink-0 bg-gray-100">
                      <img
                        src={imgSrc}
                        alt={hotelName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${booking.hotelId}/300/200`;
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full mb-2 ${status.color}`}>
                            {status.icon}
                            {status.label}
                          </span>
                          <h3 className="font-extrabold text-gray-900 text-base">{hotelName}</h3>
                          {city && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin size={11} />{city}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">{roomName}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {total > 0 && (
                            <>
                              <p className="text-lg font-extrabold text-gray-900">
                                ₹{total.toLocaleString('en-IN')}
                              </p>
                              <p className="text-xs text-gray-400">total</p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={12} />
                          {format(new Date(booking.checkInDate), 'MMM d')} –{' '}
                          {format(new Date(booking.checkOutDate), 'MMM d, yyyy')}
                        </span>
                        <span>·</span>
                        <span>{nights} night{nights > 1 ? 's' : ''}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {(booking.status === 'PENDING' || booking.status === 'PAYMENT_PENDING') && (
                          <Link
                            to={`/bookings/${booking.id}/confirm`}
                            className="btn-primary px-4 py-2 text-xs"
                          >
                            <CreditCard size={13} />
                            Complete payment
                          </Link>
                        )}
                        <Link
                          to={`/hotels/${booking.hotelId}`}
                          className="btn-outline px-4 py-2 text-xs"
                        >
                          View hotel
                        </Link>
                        {(booking.status === 'PENDING' || booking.status === 'CONFIRMED' || booking.status === 'PAYMENT_PENDING') && (
                          <button
                            onClick={() => {
                              if (confirm('Cancel this booking?')) {
                                cancelMutation.mutate(booking.id);
                              }
                            }}
                            disabled={cancelMutation.isPending}
                            className="px-4 py-2 text-xs text-red-500 border border-red-200 rounded-full hover:bg-red-50 transition-colors font-semibold"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 px-5 py-2 bg-gray-50 flex items-center justify-between text-xs text-gray-400">
                    <span>Booking #{booking.id.slice(-8).toUpperCase()}</span>
                    <span>Created {format(new Date(booking.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
