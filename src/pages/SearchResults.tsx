import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, MapPin, X, ChevronDown } from 'lucide-react';
import { hotelsApi } from '../api/hotels';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { HotelCard, HotelCardSkeleton } from '../components/home/HotelCard';
import { SearchBar } from '../components/home/SearchBar';

const SORT_OPTIONS = ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Top Rated'];
const PRICE_RANGES = [
  { label: 'Under ₹2,000', min: 0, max: 2000 },
  { label: '₹2,000–₹5,000', min: 2000, max: 5000 },
  { label: '₹5,000–₹10,000', min: 5000, max: 10000 },
  { label: '₹10,000+', min: 10000, max: Infinity },
];

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const city = searchParams.get('city') || '';
  const checkInDate = searchParams.get('checkInDate') || '';
  const checkOutDate = searchParams.get('checkOutDate') || '';
  const roomsCount = Number(searchParams.get('roomsCount')) || 1;

  const [sortBy, setSortBy] = useState('Recommended');
  const [priceFilter, setPriceFilter] = useState<number | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ['hotels', 'search', city, checkInDate, checkOutDate, roomsCount],
    queryFn: () => hotelsApi.search({ city, checkInDate, checkOutDate, roomsCount }),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  // Filter + sort
  const filtered = hotels
    .filter((h) => {
      if (priceFilter === null) return true;
      const range = PRICE_RANGES[priceFilter];
      return h.pricePerNight >= range.min && h.pricePerNight < range.max;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'Price: Low to High': return a.pricePerNight - b.pricePerNight;
        case 'Price: High to Low': return b.pricePerNight - a.pricePerNight;
        case 'Top Rated': return (b.rating ?? 0) - (a.rating ?? 0);
        default: return 0;
      }
    });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Search refinement bar */}
      <div className="border-b border-gray-200 py-3 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SearchBar
            compact
            initialValues={{ city, checkInDate, checkOutDate, roomsCount }}
          />
        </div>
      </div>

      {/* Results header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">
            {isLoading ? 'Searching…' : `${filtered.length} stay${filtered.length !== 1 ? 's' : ''} in ${city || 'all cities'}`}
          </h1>
          {checkInDate && checkOutDate && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <MapPin size={12} />
              {checkInDate} — {checkOutDate} · {roomsCount} room{roomsCount > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none border border-gray-200 rounded-full px-4 py-2 text-sm font-semibold text-gray-700 bg-white cursor-pointer outline-none hover:border-gray-400 transition-colors pr-8"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Filter button */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-2 border rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              priceFilter !== null
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 text-gray-700 hover:border-gray-400'
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters
            {priceFilter !== null && (
              <span className="w-2 h-2 bg-white rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-lg animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Price per night</h3>
              {priceFilter !== null && (
                <button
                  onClick={() => setPriceFilter(null)}
                  className="text-xs text-primary-red font-semibold hover:underline flex items-center gap-1"
                >
                  <X size={12} /> Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map((range, i) => (
                <button
                  key={range.label}
                  onClick={() => setPriceFilter(priceFilter === i ? null : i)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    priceFilter === i
                      ? 'bg-gray-900 border-gray-900 text-white'
                      : 'border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 flex-1">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <HotelCardSkeleton key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin size={36} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-800 mb-2">No results found</h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              We couldn't find any stays matching your search. Try different dates or explore other cities.
            </p>
            <Link to="/" className="btn-primary px-8 py-3 text-sm">
              Explore all stays
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
