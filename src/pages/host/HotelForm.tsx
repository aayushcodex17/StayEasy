import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Plus, X, Save, Hotel } from 'lucide-react';
import { adminHotelsApi } from '../../api/hotels';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { HotelFormData } from '../../types';
import { toast } from 'react-hot-toast';

const AMENITY_OPTIONS = [
  'WiFi', 'Parking', 'Breakfast', 'AC', 'Gym', 'Swimming Pool',
  'Restaurant', 'Bar', 'Spa', 'Room Service', 'Laundry', 'Conference Room',
  'Pet Friendly', 'Non-smoking', 'Wheelchair Accessible', 'Airport Shuttle',
];

const defaultForm: HotelFormData = {
  name: '',
  description: '',
  city: '',
  address: '',
  country: 'India',
  pricePerNight: 0,
  amenities: [],
  thumbnailUrl: '',
};

export function HotelForm() {
  const { hotelId } = useParams<{ hotelId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!hotelId;
  const [form, setForm] = useState<HotelFormData>(defaultForm);
  const [customAmenity, setCustomAmenity] = useState('');

  // Load hotel data for edit mode
  const { isLoading: loadingHotel } = useQuery({
    queryKey: ['hotel-edit', hotelId],
    queryFn: async () => {
      const hotels = await adminHotelsApi.getMyHotels();
      return hotels.find((h) => h.id === hotelId) || null;
    },
    enabled: isEdit,
    staleTime: 0,
  });

  const { data: hotelData } = useQuery({
    queryKey: ['hotel-edit', hotelId],
    queryFn: async () => {
      const hotels = await adminHotelsApi.getMyHotels();
      return hotels.find((h) => h.id === hotelId) || null;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (hotelData) {
      setForm({
        name: hotelData.name || '',
        description: hotelData.description || '',
        city: hotelData.city || '',
        address: hotelData.address || '',
        country: hotelData.country || 'India',
        pricePerNight: hotelData.pricePerNight || 0,
        amenities: hotelData.amenities || [],
        thumbnailUrl: hotelData.thumbnailUrl || '',
      });
    }
  }, [hotelData]);

  const createMutation = useMutation({
    mutationFn: adminHotelsApi.createHotel,
    onSuccess: (hotel) => {
      toast.success('Hotel created successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-hotels'] });
      navigate(`/host/hotels/${hotel.id}/rooms`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create hotel.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<HotelFormData>) => adminHotelsApi.updateHotel(hotelId!, data),
    onSuccess: () => {
      toast.success('Hotel updated!');
      queryClient.invalidateQueries({ queryKey: ['admin-hotels'] });
      navigate('/host');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update hotel.');
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.city || !form.address || form.pricePerNight <= 0) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (isEdit) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  };

  const toggleAmenity = (a: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }));
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !form.amenities.includes(customAmenity.trim())) {
      setForm((f) => ({ ...f, amenities: [...f.amenities, customAmenity.trim()] }));
      setCustomAmenity('');
    }
  };

  if (isEdit && loadingHotel) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading hotel…" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        <Link
          to="/host"
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft size={16} /> Back to dashboard
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <Hotel size={18} className="text-primary-red" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">
              {isEdit ? 'Edit hotel' : 'List a new hotel'}
            </h1>
            <p className="text-sm text-gray-500">
              {isEdit ? 'Update your hotel information' : 'Fill in the details to list your property'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-extrabold text-gray-900">Basic information</h2>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Hotel name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. The Grand Palace Hotel"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe your property — highlight what makes it special…"
                rows={4}
                className="input-field resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Thumbnail image URL</label>
              <input
                type="url"
                value={form.thumbnailUrl}
                onChange={(e) => setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className="input-field"
              />
              {form.thumbnailUrl && (
                <img
                  src={form.thumbnailUrl}
                  alt="Preview"
                  className="mt-2 w-full h-40 object-cover rounded-xl border border-gray-200"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/preview/400/200`; }}
                />
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-extrabold text-gray-900">Location</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="Mumbai"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Country</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  placeholder="India"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Full address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="123 Marine Drive, Colaba"
                className="input-field"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-extrabold text-gray-900 mb-4">Pricing</h2>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Base price per night (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.pricePerNight || ''}
                  onChange={(e) => setForm((f) => ({ ...f, pricePerNight: Number(e.target.value) }))}
                  placeholder="2500"
                  className="input-field pl-8"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">This is the base price. Room-specific prices can be set per room.</p>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-extrabold text-gray-900 mb-4">Amenities</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {AMENITY_OPTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                    form.amenities.includes(a)
                      ? 'bg-gray-900 border-gray-900 text-white'
                      : 'border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>

            {/* Custom amenity */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAmenity())}
                placeholder="Add custom amenity…"
                className="input-field text-sm flex-1"
              />
              <button
                type="button"
                onClick={addCustomAmenity}
                className="btn-outline px-4 py-2 text-sm flex items-center gap-1"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {/* Selected custom amenities */}
            {form.amenities.filter((a) => !AMENITY_OPTIONS.includes(a)).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.amenities
                  .filter((a) => !AMENITY_OPTIONS.includes(a))
                  .map((a) => (
                    <span
                      key={a}
                      className="flex items-center gap-1 px-3 py-1 bg-red-50 text-primary-red text-sm rounded-full font-semibold"
                    >
                      {a}
                      <button
                        type="button"
                        onClick={() => toggleAmenity(a)}
                        className="hover:text-red-700"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <Link to="/host" className="btn-outline px-6 py-3 text-sm">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary px-8 py-3 text-sm"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" color="white" />
                  Saving…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save size={16} />
                  {isEdit ? 'Save changes' : 'Create hotel'}
                </span>
              )}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
