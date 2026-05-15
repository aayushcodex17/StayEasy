import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Hotel, Pencil, Trash2, Users, BarChart2, Eye, BedDouble } from 'lucide-react';
import { adminHotelsApi } from '../../api/hotels';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';
import type { Hotel as HotelType } from '../../types';

function HotelRow({ hotel, onDelete }: { hotel: HotelType; onDelete: () => void }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${hotel.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    onDelete();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail */}
        <div className="sm:w-40 h-32 sm:h-auto flex-shrink-0 bg-gray-100">
          <img
            src={hotel.thumbnailUrl || `https://picsum.photos/seed/${hotel.id}/300/200`}
            alt={hotel.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${hotel.id}/300/200`;
            }}
          />
        </div>

        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-gray-900 text-base mb-1">{hotel.name}</h3>
              <p className="text-xs text-gray-500 mb-1">{hotel.address}, {hotel.city}</p>
              <p className="text-sm font-bold text-primary-red">
                ₹{hotel.pricePerNight?.toLocaleString('en-IN')}/night
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Link
                to={`/hotels/${hotel.id}`}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                title="View listing"
              >
                <Eye size={16} />
              </Link>
              <Link
                to={`/host/hotels/${hotel.id}/rooms`}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                title="Manage rooms"
              >
                <BedDouble size={16} />
              </Link>
              <Link
                to={`/host/hotels/${hotel.id}/edit`}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                title="Edit hotel"
              >
                <Pencil size={16} />
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete hotel"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
            <Link
              to={`/host/hotels/${hotel.id}/rooms`}
              className="flex items-center gap-1.5 hover:text-gray-800 transition-colors font-semibold"
            >
              <BedDouble size={12} /> Manage rooms
            </Link>
            <Link
              to={`/host/hotels/${hotel.id}/rooms`}
              className="flex items-center gap-1.5 hover:text-gray-800 transition-colors font-semibold"
            >
              <Users size={12} /> View bookings
            </Link>
            <Link
              to={`/host/hotels/${hotel.id}/rooms`}
              className="flex items-center gap-1.5 hover:text-gray-800 transition-colors font-semibold"
            >
              <BarChart2 size={12} /> Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HostDashboard() {
  const queryClient = useQueryClient();

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ['admin-hotels'],
    queryFn: adminHotelsApi.getMyHotels,
    staleTime: 2 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: adminHotelsApi.deleteHotel,
    onSuccess: () => {
      toast.success('Hotel deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-hotels'] });
    },
    onError: () => toast.error('Could not delete hotel.'),
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Host Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              {hotels.length} hotel{hotels.length !== 1 ? 's' : ''} listed
            </p>
          </div>
          <Link
            to="/host/hotels/new"
            className="btn-primary px-5 py-2.5 text-sm"
          >
            <Plus size={16} />
            Add hotel
          </Link>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total hotels', value: hotels.length, icon: Hotel, color: 'text-blue-600 bg-blue-50' },
            { label: 'Active listings', value: hotels.length, icon: Eye, color: 'text-green-600 bg-green-50' },
            { label: 'Avg. price/night', value: hotels.length > 0 ? `₹${Math.round(hotels.reduce((s, h) => s + (h.pricePerNight || 0), 0) / hotels.length).toLocaleString('en-IN')}` : '—', icon: BarChart2, color: 'text-purple-600 bg-purple-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
                  <p className="text-2xl font-extrabold text-gray-900">{value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hotel list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" text="Loading your hotels…" />
          </div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Hotel size={36} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-800 mb-2">No hotels yet</h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              Start by listing your first property. It only takes a few minutes.
            </p>
            <Link to="/host/hotels/new" className="btn-primary px-8 py-3 text-sm">
              <Plus size={16} />
              List your first hotel
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {hotels.map((hotel) => (
              <HotelRow
                key={hotel.id}
                hotel={hotel}
                onDelete={() => deleteMutation.mutate(hotel.id)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
