import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Sparkles, TrendingUp, Shield } from 'lucide-react';
import { hotelsApi } from '../api/hotels';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { SearchBar } from '../components/home/SearchBar';
import { HotelCard, HotelCardSkeleton } from '../components/home/HotelCard';

const FEATURED_CITIES = [
  { name: 'Mumbai', image: 'https://picsum.photos/seed/mumbai/300/200', count: '120+ hotels' },
  { name: 'Delhi', image: 'https://picsum.photos/seed/delhi/300/200', count: '95+ hotels' },
  { name: 'Goa', image: 'https://picsum.photos/seed/goa/300/200', count: '80+ hotels' },
  { name: 'Jaipur', image: 'https://picsum.photos/seed/jaipur/300/200', count: '60+ hotels' },
  { name: 'Bangalore', image: 'https://picsum.photos/seed/bangalore/300/200', count: '110+ hotels' },
  { name: 'Chennai', image: 'https://picsum.photos/seed/chennai/300/200', count: '75+ hotels' },
];

const CATEGORIES = [
  { label: 'Trending', icon: TrendingUp },
  { label: 'Beachfront', icon: null },
  { label: 'Luxury', icon: null },
  { label: 'Budget', icon: null },
  { label: 'Heritage', icon: null },
  { label: 'Business', icon: null },
  { label: 'Family', icon: null },
  { label: 'Boutique', icon: null },
];

export function Home() {
  const [activeCategory, setActiveCategory] = useState('Trending');
  const [searchCity, setSearchCity] = useState('Mumbai');

  const { data: hotels, isLoading } = useQuery({
    queryKey: ['hotels', 'featured'],
    queryFn: () => hotelsApi.search({ city: searchCity }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden hero-gradient py-16 sm:py-24">
        {/* Background blobs */}
        <div
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #FF385C, transparent)' }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #FF385C, transparent)' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-primary-red border border-red-100 mb-6">
            <Sparkles size={12} />
            Discover your perfect stay
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
            Find your home<br />
            <span className="text-primary-red">away from home</span>
          </h1>
          <p className="text-gray-600 text-lg sm:text-xl mb-10 max-w-xl mx-auto">
            Book unique hotels, resorts, and boutique stays across India.
            Best prices guaranteed.
          </p>

          {/* Search */}
          <div className="animate-fade-in">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* ── Popular Destinations ────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900">Popular destinations</h2>
          <a href="#" className="text-sm font-semibold text-primary-red hover:underline">View all</a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {FEATURED_CITIES.map((city) => (
            <button
              key={city.name}
              onClick={() => setSearchCity(city.name)}
              className="group text-left rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-3">
                <p className="font-bold text-gray-900 text-sm">{city.name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin size={10} />
                  {city.count}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Category Filter ─────────────────────────────────── */}
      <section className="border-t border-b border-gray-100 py-3 sticky top-[80px] bg-white z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat.label
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Listings ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900">
            {searchCity ? `Hotels in ${searchCity}` : 'Featured stays'}
          </h2>
          {hotels && (
            <p className="text-sm text-gray-500 font-medium">
              {hotels.length} place{hotels.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <HotelCardSkeleton key={i} />)}
          </div>
        ) : hotels && hotels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">No hotels found</h3>
            <p className="text-sm text-gray-500 mb-6">
              Try a different city or check back later for new listings.
            </p>
            <button
              onClick={() => setSearchCity('Delhi')}
              className="btn-primary px-6 py-2.5 text-sm"
            >
              Browse Delhi hotels
            </button>
          </div>
        )}
      </section>

      {/* ── Trust Badges ────────────────────────────────────── */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              {
                icon: Shield,
                title: 'Secure Booking',
                desc: 'Your payment is protected with Stripe. Book with confidence.',
              },
              {
                icon: Sparkles,
                title: 'Curated Stays',
                desc: 'Every property is verified and reviewed by our quality team.',
              },
              {
                icon: TrendingUp,
                title: 'Best Price Guarantee',
                desc: "Find a lower price? We'll match it or refund the difference.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                  <Icon size={22} className="text-primary-red" />
                </div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
