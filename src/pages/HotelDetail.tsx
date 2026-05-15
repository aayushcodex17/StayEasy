import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Wifi, Car, Coffee, Dumbbell, Wind, Share2, Heart, Grid3X3 } from 'lucide-react';
import { hotelsApi, adminHotelsApi } from '../api/hotels';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { BookingWidget } from '../components/hotel/BookingWidget';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi size={18} />,
  parking: <Car size={18} />,
  breakfast: <Coffee size={18} />,
  gym: <Dumbbell size={18} />,
  ac: <Wind size={18} />,
};

function getAmenityIcon(amenity: string) {
  const lower = amenity.toLowerCase();
  for (const [key, icon] of Object.entries(AMENITY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return null;
}

function PhotoGrid({ images, name }: { images: string[]; name: string }) {
  const [showAll, setShowAll] = useState(false);

  const placeholders = Array.from(
    { length: Math.max(0, 5 - images.length) },
    (_, i) => `https://picsum.photos/seed/${name.replace(/\s/g, '')}${i}/800/600`
  );
  const allImages = [...images, ...placeholders].slice(0, 5);

  return (
    <div className="relative">
      <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[380px] sm:h-[440px]">
        {/* Main large photo */}
        <div className="col-span-2 row-span-2">
          <img
            src={allImages[0] || `https://picsum.photos/seed/${name}/800/600`}
            alt={name}
            className="w-full h-full object-cover hover:brightness-95 transition-all cursor-pointer"
          />
        </div>
        {/* 4 smaller photos */}
        {allImages.slice(1, 5).map((img, i) => (
          <div key={i} className="overflow-hidden">
            <img
              src={img}
              alt={`${name} ${i + 2}`}
              className="w-full h-full object-cover hover:brightness-95 transition-all cursor-pointer"
            />
          </div>
        ))}
      </div>

      {/* Show all photos button */}
      <button
        onClick={() => setShowAll(!showAll)}
        className="absolute bottom-4 right-4 bg-white border border-gray-900 rounded-xl px-4 py-2 text-sm font-semibold text-gray-900 flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
      >
        <Grid3X3 size={14} />
        Show all photos
      </button>
    </div>
  );
}

export function HotelDetail() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [saved, setSaved] = useState(false);

  const { data: hotel, isLoading } = useQuery({
    queryKey: ['hotel', hotelId],
    queryFn: () => hotelsApi.getById(hotelId!),
    enabled: !!hotelId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['admin-rooms', hotelId],
    queryFn: () => adminHotelsApi.getRooms(hotelId!),
    enabled: !!hotelId,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading hotel details…" />
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-bold text-gray-700">Hotel not found</h2>
          <Link to="/" className="btn-primary px-6 py-2.5 text-sm">Go home</Link>
        </div>
      </div>
    );
  }

  const images = hotel.images?.length
    ? hotel.images
    : hotel.thumbnailUrl
    ? [hotel.thumbnailUrl]
    : [];

  const amenities = hotel.amenities || ['WiFi', 'Parking', 'Breakfast', 'AC', 'Gym'];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link to={`/hotels/search?city=${hotel.city}`} className="hover:underline">{hotel.city}</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">{hotel.name}</span>
        </nav>

        {/* Title row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">{hotel.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              {hotel.rating !== undefined && (
                <span className="flex items-center gap-1 font-semibold">
                  <Star size={14} className="text-primary-red fill-current" />
                  {hotel.rating.toFixed(1)}
                  {hotel.reviewCount && <span className="font-normal text-gray-400">({hotel.reviewCount} reviews)</span>}
                </span>
              )}
              <span className="flex items-center gap-1">
                <MapPin size={13} />
                {hotel.address ? `${hotel.address}, ` : ''}{hotel.city}
                {hotel.country ? `, ${hotel.country}` : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-semibold text-gray-700 transition-colors">
              <Share2 size={15} /> Share
            </button>
            <button
              onClick={() => setSaved(!saved)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-semibold transition-colors"
              style={{ color: saved ? '#FF385C' : '#374151' }}
            >
              <Heart size={15} className={saved ? 'fill-current' : ''} />
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="mb-8">
          <PhotoGrid images={images} name={hotel.name} />
        </div>

        {/* Content + Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Host / Overview */}
            <div className="pb-8 border-b border-gray-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 mb-1">
                    {hotel.name}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {rooms.length > 0 ? `${rooms.length} room type${rooms.length > 1 ? 's' : ''}` : 'Comfortable rooms available'} ·
                    Best in {hotel.city}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-red to-red-400 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {hotel.name.charAt(0)}
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8 border-b border-gray-200">
              {[
                { icon: '🏨', title: 'Great location', desc: `Rated highly for ${hotel.city} location` },
                { icon: '✨', title: 'Self check-in', desc: 'Check yourself in with ease' },
                { icon: '🎉', title: 'Free cancellation', desc: 'Cancel up to 24h before check-in' },
                { icon: '🛡️', title: 'StayEase guaranteed', desc: 'Every booking is protected' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="pb-8 border-b border-gray-200">
              <h3 className="text-lg font-extrabold text-gray-900 mb-3">About this place</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {hotel.description || `Welcome to ${hotel.name}, a premium property located in the heart of ${hotel.city}.
                Enjoy world-class amenities, impeccable service, and unforgettable experiences during your stay.
                Whether you're here for business or leisure, our property has everything you need for a comfortable and memorable visit.`}
              </p>
            </div>

            {/* Amenities */}
            <div className="pb-8 border-b border-gray-200">
              <h3 className="text-lg font-extrabold text-gray-900 mb-4">What this place offers</h3>
              <div className="grid grid-cols-2 gap-3">
                {amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="text-gray-500">{getAmenityIcon(amenity) || '✓'}</span>
                    <span className="font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rooms */}
            {rooms.length > 0 && (
              <div className="pb-8 border-b border-gray-200">
                <h3 className="text-lg font-extrabold text-gray-900 mb-4">Available room types</h3>
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="border border-gray-200 rounded-2xl p-5 hover:border-gray-400 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-gray-900">
                            {room.name || room.type}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Up to {room.capacity} guests
                            {room.floorNumber ? ` · Floor ${room.floorNumber}` : ''}
                            {room.roomNumber ? ` · Room ${room.roomNumber}` : ''}
                          </p>
                          {room.description && (
                            <p className="text-sm text-gray-600 mt-2">{room.description}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-extrabold text-gray-900">
                            ₹{room.pricePerNight?.toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-gray-500">per night</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 mb-4">Location</h3>
              <div className="bg-gray-100 rounded-2xl h-48 flex items-center justify-center border border-gray-200">
                <div className="text-center">
                  <MapPin size={28} className="text-primary-red mx-auto mb-2" />
                  <p className="font-semibold text-gray-700 text-sm">
                    {hotel.address ? `${hotel.address}, ` : ''}{hotel.city}
                  </p>
                  {hotel.country && <p className="text-xs text-gray-500">{hotel.country}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Booking Widget */}
          <div className="lg:col-span-1">
            <BookingWidget hotel={hotel} rooms={rooms} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
