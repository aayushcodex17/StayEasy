import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { GuestCounter } from '../ui/GuestCounter';
import { format, addDays } from 'date-fns';

interface SearchBarProps {
  onSearch?: () => void;
  compact?: boolean;
  initialValues?: {
    city?: string;
    checkInDate?: string;
    checkOutDate?: string;
    roomsCount?: number;
  };
}

export function SearchBar({ onSearch, compact = false, initialValues }: SearchBarProps) {
  const navigate = useNavigate();
  const tomorrow = addDays(new Date(), 1);
  const dayAfter = addDays(new Date(), 2);

  const [city, setCity] = useState(initialValues?.city || '');
  const [checkIn, setCheckIn] = useState(
    initialValues?.checkInDate || format(tomorrow, 'yyyy-MM-dd')
  );
  const [checkOut, setCheckOut] = useState(
    initialValues?.checkOutDate || format(dayAfter, 'yyyy-MM-dd')
  );
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [guestOpen, setGuestOpen] = useState(false);
  const guestRef = useRef<HTMLDivElement>(null);

  const totalGuests = adults + children;

  // Close guest dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (guestRef.current && !guestRef.current.contains(e.target as Node)) {
        setGuestOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = () => {
    if (!city.trim()) return;
    const params = new URLSearchParams({
      city: city.trim(),
      checkInDate: checkIn,
      checkOutDate: checkOut,
      roomsCount: String(Math.max(1, Math.ceil(totalGuests / 2))),
    });
    navigate(`/hotels/search?${params.toString()}`);
    onSearch?.();
  };

  const guestLabel = () => {
    const parts: string[] = [];
    if (totalGuests > 0) parts.push(`${totalGuests} guest${totalGuests > 1 ? 's' : ''}`);
    if (infants > 0) parts.push(`${infants} infant${infants > 1 ? 's' : ''}`);
    return parts.join(', ') || 'Add guests';
  };

  if (compact) {
    return (
      <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 flex-1 min-w-0">
          <MapPin size={14} className="text-primary-red flex-shrink-0" />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Where are you going?"
            className="outline-none text-sm font-semibold bg-transparent w-full placeholder-gray-400"
          />
        </div>
        <div className="hidden sm:flex items-center border-l border-gray-200 px-3 py-2 gap-1">
          <Calendar size={14} className="text-gray-400" />
          <input
            type="date"
            value={checkIn}
            min={format(new Date(), 'yyyy-MM-dd')}
            onChange={(e) => setCheckIn(e.target.value)}
            className="outline-none text-xs font-semibold bg-transparent text-gray-700 w-28"
          />
        </div>
        <div className="hidden sm:flex items-center border-l border-gray-200 px-3 py-2 gap-1">
          <Calendar size={14} className="text-gray-400" />
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
            className="outline-none text-xs font-semibold bg-transparent text-gray-700 w-28"
          />
        </div>
        <button
          onClick={handleSearch}
          className="btn-primary m-1.5 w-10 h-10 rounded-full flex-shrink-0"
        >
          <Search size={14} />
        </button>
      </div>
    );
  }

  // Hero variant
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex flex-col md:flex-row items-stretch md:items-center gap-1">
        {/* Location */}
        <div className="flex-1 flex flex-col px-4 py-3 rounded-xl hover:bg-gray-50 cursor-text transition-colors min-w-0">
          <label className="text-xs font-bold text-gray-800 mb-0.5">Where</label>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-primary-red flex-shrink-0" />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search destinations"
              className="outline-none text-sm bg-transparent w-full text-gray-700 placeholder-gray-400 font-medium"
            />
          </div>
        </div>

        <div className="hidden md:block w-px h-10 bg-gray-200 self-center" />

        {/* Check-in */}
        <div className="flex-1 flex flex-col px-4 py-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
          <label className="text-xs font-bold text-gray-800 mb-0.5">Check in</label>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400 flex-shrink-0" />
            <input
              type="date"
              value={checkIn}
              min={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setCheckIn(e.target.value)}
              className="outline-none text-sm bg-transparent text-gray-700 font-medium w-full"
            />
          </div>
        </div>

        <div className="hidden md:block w-px h-10 bg-gray-200 self-center" />

        {/* Check-out */}
        <div className="flex-1 flex flex-col px-4 py-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
          <label className="text-xs font-bold text-gray-800 mb-0.5">Check out</label>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400 flex-shrink-0" />
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="outline-none text-sm bg-transparent text-gray-700 font-medium w-full"
            />
          </div>
        </div>

        <div className="hidden md:block w-px h-10 bg-gray-200 self-center" />

        {/* Guests */}
        <div className="flex items-center gap-2 pr-2" ref={guestRef}>
          <div
            className="flex-1 flex flex-col px-4 py-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => setGuestOpen(!guestOpen)}
          >
            <label className="text-xs font-bold text-gray-800 mb-0.5 cursor-pointer">Who</label>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-gray-400 flex-shrink-0" />
              <span className={`text-sm font-medium ${totalGuests > 0 || infants > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                {guestLabel()}
              </span>
            </div>
          </div>

          {/* Guest dropdown */}
          {guestOpen && (
            <div className="absolute top-full left-0 right-0 md:right-auto md:left-auto mt-2 z-50 md:w-80 w-full px-4 md:px-0"
              style={{ position: 'absolute', top: 'calc(100% + 8px)', right: '60px', left: 'auto' }}
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4">
                <GuestCounter
                  adults={adults}
                  children={children}
                  infants={infants}
                  onAdultsChange={setAdults}
                  onChildrenChange={setChildren}
                  onInfantsChange={setInfants}
                />
              </div>
            </div>
          )}

          {/* Search button */}
          <button
            onClick={handleSearch}
            className="btn-primary px-5 py-3.5 rounded-xl text-sm gap-2 flex-shrink-0"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>
    </div>
  );
}
