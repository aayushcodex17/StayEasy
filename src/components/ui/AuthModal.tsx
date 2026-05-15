import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Building2, User } from 'lucide-react';
import { Modal } from './Modal';
import { useAuth } from '../../hooks/useAuth';

type AuthMode = 'login' | 'signup' | 'manager';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: AuthMode;
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const { login, register, registerAsManager } = useAuth();
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
        toast.success('Welcome back!');
      } else if (mode === 'signup') {
        await register({ name: form.name, email: form.email, password: form.password, role: 'GUEST' });
        toast.success('Account created! Welcome to StayEase.');
      } else {
        await registerAsManager({ name: form.name, email: form.email, password: form.password });
        toast.success('Hotel manager account created!');
      }
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Something went wrong.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const titles: Record<AuthMode, string> = {
    login: 'Log in',
    signup: 'Create account',
    manager: 'Become a host',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titles[mode]}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode !== 'login' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full name</label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Smith"
              className="input-field"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input-field pr-10"
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3 text-sm"
        >
          {isLoading ? 'Please wait…' : titles[mode]}
        </button>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400 font-semibold">or</span>
          </div>
        </div>

        {/* Mode switchers */}
        {mode === 'login' && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="btn-outline w-full py-3 text-sm flex items-center justify-center gap-2"
            >
              <User size={16} />
              Create a guest account
            </button>
            <button
              type="button"
              onClick={() => setMode('manager')}
              className="btn-outline w-full py-3 text-sm flex items-center justify-center gap-2"
            >
              <Building2 size={16} />
              Register as hotel manager
            </button>
          </div>
        )}

        {mode !== 'login' && (
          <button
            type="button"
            onClick={() => setMode('login')}
            className="btn-outline w-full py-3 text-sm"
          >
            Already have an account? Log in
          </button>
        )}
      </form>
    </Modal>
  );
}
