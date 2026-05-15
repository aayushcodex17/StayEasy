import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const SearchResults = lazy(() => import('./pages/SearchResults').then((m) => ({ default: m.SearchResults })));
const HotelDetail = lazy(() => import('./pages/HotelDetail').then((m) => ({ default: m.HotelDetail })));
const BookingConfirm = lazy(() => import('./pages/BookingConfirm').then((m) => ({ default: m.BookingConfirm })));
const MyBookings = lazy(() => import('./pages/MyBookings').then((m) => ({ default: m.MyBookings })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const HostDashboard = lazy(() => import('./pages/host/HostDashboard').then((m) => ({ default: m.HostDashboard })));
const HotelForm = lazy(() => import('./pages/host/HotelForm').then((m) => ({ default: m.HotelForm })));
const RoomManager = lazy(() => import('./pages/host/RoomManager').then((m) => ({ default: m.RoomManager })));

// ─── Query Client ─────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ─── Protected Route ──────────────────────────────────────────────────────────
function ProtectedRoute({ children, requireRole }: { children: React.ReactNode; requireRole?: string }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requireRole && user?.role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// ─── Page Fallback ────────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading page…" />
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────
function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/hotels/search" element={<SearchResults />} />
          <Route path="/hotels/:hotelId" element={<HotelDetail />} />

          {/* Authenticated */}
          <Route
            path="/bookings/:bookingId/confirm"
            element={
              <ProtectedRoute>
                <BookingConfirm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Hotel Manager */}
          <Route
            path="/host"
            element={
              <ProtectedRoute requireRole="HOTEL_MANAGER">
                <HostDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/hotels/new"
            element={
              <ProtectedRoute requireRole="HOTEL_MANAGER">
                <HotelForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/hotels/:hotelId/edit"
            element={
              <ProtectedRoute requireRole="HOTEL_MANAGER">
                <HotelForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/hotels/:hotelId/rooms"
            element={
              <ProtectedRoute requireRole="HOTEL_MANAGER">
                <RoomManager />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: "'Nunito', sans-serif",
              fontWeight: '600',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#FF385C', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
