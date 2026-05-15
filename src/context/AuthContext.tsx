import React, { createContext, useCallback, useEffect, useState } from 'react';
import { authApi } from '../api/auth';
import type { JwtPayload, LoginRequest, SignupRequest, User, UserRole } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64 = token.split('.')[1];
    const padded = base64 + '=='.slice((base64.length % 4) || 4);
    const json = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function buildUserFromToken(token: string): User | null {
  const payload = decodeJwt(token);
  if (!payload) return null;

  const role: UserRole =
    (payload.role as UserRole) ||
    (Array.isArray(payload.roles) ? payload.roles[0] : 'GUEST');

  return {
    id: payload.sub,
    name: payload.name || payload.email || 'User',
    email: payload.email || payload.sub,
    role,
  };
}

// ─── Context Types ────────────────────────────────────────────────────────────

export interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  register: (data: SignupRequest) => Promise<void>;
  registerAsManager: (data: Omit<SignupRequest, 'role'>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Initialise from localStorage ────────────────────────────────────────
  useEffect(() => {
    const storedAccess = localStorage.getItem('accessToken');
    const storedRefresh = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');

    if (storedAccess) {
      // Check token hasn't expired
      const payload = decodeJwt(storedAccess);
      const isExpired = payload ? payload.exp * 1000 < Date.now() : true;

      if (!isExpired) {
        setAccessToken(storedAccess);
        setRefreshToken(storedRefresh);
        const parsedUser = storedUser ? JSON.parse(storedUser) : buildUserFromToken(storedAccess);
        setUser(parsedUser);
      } else {
        // Clear stale tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // ─── Listen for forced logout from axios interceptor ─────────────────────
  useEffect(() => {
    const handler = () => {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  // ─── Persist helpers ──────────────────────────────────────────────────────
  const persistTokens = useCallback((access: string, refresh: string | null) => {
    localStorage.setItem('accessToken', access);
    if (refresh) localStorage.setItem('refreshToken', refresh);
    const u = buildUserFromToken(access);
    if (u) {
      setUser(u);
      localStorage.setItem('user', JSON.stringify(u));
    }
    setAccessToken(access);
    setRefreshToken(refresh);
  }, []);

  // ─── Auth actions ─────────────────────────────────────────────────────────
  const login = useCallback(async (data: LoginRequest) => {
    const tokens = await authApi.login(data);
    persistTokens(tokens.accessToken, tokens.refreshToken);
  }, [persistTokens]);

  const register = useCallback(async (data: SignupRequest) => {
    const tokens = await authApi.signup(data);
    persistTokens(tokens.accessToken, tokens.refreshToken ?? null);
  }, [persistTokens]);

  const registerAsManager = useCallback(async (data: Omit<SignupRequest, 'role'>) => {
    const tokens = await authApi.registerAsHotelManager(data);
    persistTokens(tokens.accessToken, tokens.refreshToken ?? null);
  }, [persistTokens]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        registerAsManager,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
