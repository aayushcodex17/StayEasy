import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Phone, Shield, Edit2, Save, X } from 'lucide-react';
import { usersApi } from '../api/users';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export function ProfilePage() {
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: usersApi.getProfile,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    } else if (authUser) {
      setForm({
        name: authUser.name || '',
        email: authUser.email || '',
        phone: '',
      });
    }
  }, [profile, authUser]);

  const updateMutation = useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: () => {
      toast.success('Profile updated!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
    },
    onError: () => toast.error('Failed to update profile.'),
  });

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  const displayUser = profile || authUser;
  const roleLabel = displayUser?.role === 'HOTEL_MANAGER' ? 'Hotel Manager' : 'Guest';
  const roleColor = displayUser?.role === 'HOTEL_MANAGER' ? 'text-purple-600 bg-purple-50' : 'text-blue-600 bg-blue-50';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Your profile</h1>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" text="Loading profile…" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Avatar + role card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-5">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-extrabold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #FF385C, #E31C5F)' }}
                >
                  {(form.name || authUser?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">{form.name || 'User'}</h2>
                  <p className="text-sm text-gray-500">{form.email}</p>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mt-2 ${roleColor}`}>
                    <Shield size={11} />
                    {roleLabel}
                  </span>
                </div>
                <div className="ml-auto">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 btn-outline px-4 py-2 text-sm"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2 btn-primary px-4 py-2 text-sm"
                      >
                        <Save size={14} />
                        {updateMutation.isPending ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 btn-outline px-3 py-2 text-sm"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              <h3 className="font-extrabold text-gray-900">Personal information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5">
                    <User size={12} /> Full name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="input-field text-sm"
                    />
                  ) : (
                    <p className="text-sm text-gray-800 font-semibold py-2.5 px-3 bg-gray-50 rounded-lg">
                      {form.name || '—'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5">
                    <Mail size={12} /> Email address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="input-field text-sm"
                    />
                  ) : (
                    <p className="text-sm text-gray-800 font-semibold py-2.5 px-3 bg-gray-50 rounded-lg">
                      {form.email || '—'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5">
                    <Phone size={12} /> Phone number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="input-field text-sm"
                    />
                  ) : (
                    <p className="text-sm text-gray-800 font-semibold py-2.5 px-3 bg-gray-50 rounded-lg">
                      {form.phone || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5">
                    <Shield size={12} /> Account type
                  </label>
                  <p className="text-sm text-gray-800 font-semibold py-2.5 px-3 bg-gray-50 rounded-lg">
                    {roleLabel}
                  </p>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-extrabold text-gray-900 mb-4">Login & security</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Password</p>
                    <p className="text-xs text-gray-500">Last changed —</p>
                  </div>
                  <button className="btn-outline px-4 py-1.5 text-xs">Update</button>
                </div>
                <div className="border-t border-gray-100" />
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Two-factor authentication</p>
                    <p className="text-xs text-gray-500">Add extra security to your account</p>
                  </div>
                  <button className="btn-outline px-4 py-1.5 text-xs">Enable</button>
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="bg-white rounded-2xl border border-red-100 p-6">
              <h3 className="font-extrabold text-red-600 mb-4">Danger zone</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Delete account</p>
                  <p className="text-xs text-gray-500">Permanently remove your account and all data</p>
                </div>
                <button className="px-4 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-full hover:bg-red-50 transition-colors">
                  Delete account
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
