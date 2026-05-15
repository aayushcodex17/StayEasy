import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Hotel } from '../../types';

interface HotelCardProps {
  hotel: Hotel;
  checkInDate?: string;
  checkOutDate?: string;
}

const PLACEHOLDER_IMAGES = [
  'https://picsum.photos/seed/{id}1/800/600',
  'https://picsum.photos/seed/{id}2/800/600',
  'https://picsum.photos/seed/{id}3/800/600',
];

function getImages(hotel: Hotel): string[] {
  if (hotel.images && hotel.images.length > 0) return hotel.images;
  if (hotel.thumbnailUrl) return [hotel.thumbnailUrl];
  return PLACEHOLDER_IMAGES.map((u) => u.replace('{id}', hotel.id?.slice(-4) || 'abc'));
}

export function HotelCard({ hotel, checkInDate, checkOutDate }: HotelCardProps) {
  const [saved, setSaved] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const images = getImages(hotel);

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex((i) => (i - 1 + images.length) % images.length);
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex((i) => (i + 1) % images.length);
  };

  const detailUrl = `/hotels/${hotel.id}${checkInDate ? `?checkIn=${checkInDate}&checkOut=${checkOutDate}` : ''}`;

  return (
    <Link to={detailUrl} className="group block">
      <div className="card-hover rounded-2xl overflow-hidden bg-white">
        {/* Image carousel */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden rounded-2xl">
          <img
            src={images[imgIndex]}
            alt={hotel.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${hotel.id}/800/600`;
            }}
          />

          {/* Save button */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSaved(!saved); }}
            className="absolute top-3 right-3 p-1.5 rounded-full transition-all hover:scale-110"
            aria-label="Save"
          >
            <Heart
              size={22}
              className={`drop-shadow transition-colors ${saved ? 'text-primary-red fill-current' : 'text-white fill-transparent'}`}
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
            />
          </button>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              {imgIndex > 0 && (
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                >
                  <ChevronLeft size={14} />
                </button>
              )}
              {imgIndex < images.length - 1 && (
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                >
                  <ChevronRight size={14} />
                </button>
              )}
              {/* Dot indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIndex ? 'bg-white scale-125' : 'bg-white/60'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="pt-3 pb-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-900 text-sm truncate">{hotel.name}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <MapPin size={11} />
                <span className="truncate">{hotel.city}{hotel.address ? `, ${hotel.address}` : ''}</span>
              </div>
            </div>
            {hotel.rating !== undefined && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star size={13} className="text-primary-red fill-current" />
                <span className="text-sm font-semibold text-gray-800">
                  {hotel.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {hotel.reviewCount !== undefined && (
            <p className="text-xs text-gray-400 mt-0.5">{hotel.reviewCount} reviews</p>
          )}

          <div className="mt-2">
            <span className="text-sm font-bold text-gray-900">
              ₹{hotel.pricePerNight?.toLocaleString('en-IN') ?? '—'}
            </span>
            <span className="text-sm text-gray-500 font-normal"> / night</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Skeleton card for loading state
export function HotelCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="skeleton aspect-[4/3] rounded-2xl mb-3" />
      <div className="skeleton h-4 w-3/4 mb-2" />
      <div className="skeleton h-3 w-1/2 mb-2" />
      <div className="skeleton h-4 w-1/3" />
    </div>
  );
}
