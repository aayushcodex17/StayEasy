import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, Menu, User, LogOut, Heart, Building2, LayoutDashboard, CalendarDays } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { AuthModal } from '../ui/AuthModal';
import { SearchBar } from '../home/SearchBar';
import { toast } from 'react-hot-toast';

interface HeaderProps {
  variant?: 'default' | 'transparent' | 'minimal';
}

export function Header({ variant = 'default' }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          variant === 'transparent' ? 'bg-transparent' : 'bg-white border-b border-gray-200'
        }`}
        style={{ backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-1.5 flex-shrink-0 group"
            >
              <svg width="30" height="32" viewBox="0 0 30 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M15 0C10.5 0 6.5 2.5 4 6.5C1.5 10.5 1.5 15.5 3.5 19.5L15 32L26.5 19.5C28.5 15.5 28.5 10.5 26 6.5C23.5 2.5 19.5 0 15 0ZM15 16C12.8 16 11 14.2 11 12C11 9.8 12.8 8 15 8C17.2 8 19 9.8 19 12C19 14.2 17.2 16 15 16Z"
                  fill="#FF385C"
                />
              </svg>
              <span className="text-xl font-extrabold text-primary-red tracking-tight hidden sm:block">
                StayEase
              </span>
            </Link>

            {/* Center search pill (desktop) */}
            {variant === 'default' && (
              <div className="hidden md:flex flex-1 justify-center px-8">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="flex items-center gap-3 px-4 py-2.5 border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all duration-200 text-sm font-semibold text-gray-700 bg-white"
                >
                  <span className="text-gray-800">Anywhere</span>
                  <span className="w-px h-4 bg-gray-200" />
                  <span className="text-gray-800">Any week</span>
                  <span className="w-px h-4 bg-gray-200" />
                  <span className="text-gray-500 font-normal">Add guests</span>
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white ml-1 flex-shrink-0"
                    style={{ background: '#FF385C' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </span>
                </button>
              </div>
            )}

            {/* Right side */}
            <div className="flex items-center gap-2">
              {isAuthenticated && user?.role === 'HOTEL_MANAGER' && (
                <Link
                  to="/host"
                  className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <LayoutDashboard size={14} />
                  Host Dashboard
                </Link>
              )}

              <button className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-full transition-colors">
                <Globe size={16} />
              </button>

              {/* User menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 border border-gray-200 rounded-full py-2 px-3 hover:shadow-md transition-all duration-200 bg-white"
                >
                  <Menu size={16} className="text-gray-600" />
                  <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {isAuthenticated && user?.name ? (
                      <span className="text-white text-sm font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <User size={18} className="text-white" />
                    )}
                  </div>
                </button>

                {menuOpen && (
                  <div className="dropdown-menu absolute right-0 mt-2 animate-fade-in z-50">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <Link to="/my-bookings" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                          <CalendarDays size={15} /> My Bookings
                        </Link>
                        <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                          <User size={15} /> Profile
                        </Link>
                        {user?.role === 'HOTEL_MANAGER' && (
                          <>
                            <div className="dropdown-divider" />
                            <Link to="/host" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                              <LayoutDashboard size={15} /> Host Dashboard
                            </Link>
                            <Link to="/host/hotels/new" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                              <Building2 size={15} /> Add New Hotel
                            </Link>
                          </>
                        )}
                        <div className="dropdown-divider" />
                        <button onClick={handleLogout} className="dropdown-item w-full text-left text-red-500">
                          <LogOut size={15} /> Log out
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setMenuOpen(false); setAuthOpen(true); }}
                          className="dropdown-item w-full text-left font-bold"
                        >
                          Log in
                        </button>
                        <button
                          onClick={() => { setMenuOpen(false); setAuthOpen(true); }}
                          className="dropdown-item w-full text-left"
                        >
                          Sign up
                        </button>
                        <div className="dropdown-divider" />
                        <button className="dropdown-item w-full text-left">
                          <Heart size={15} /> Wishlists
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Expandable search bar */}
          {searchOpen && variant === 'default' && (
            <div className="pb-4 animate-fade-in">
              <SearchBar onSearch={() => setSearchOpen(false)} compact />
            </div>
          )}
        </div>
      </header>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
