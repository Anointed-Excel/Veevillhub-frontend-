import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, ApiError } from '@/lib/api';
import { token } from '@/lib/token';

export type UserRole = 'brand' | 'manufacturer' | 'retailer' | 'buyer';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  verificationStatus?: VerificationStatus;
  rejectionReason?: string;
  avatar?: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (data: SignupData) => Promise<void>;
  isAuthenticated: boolean;
}

// ── Backend response shapes ───────────────────────────────────────────────────

interface BackendTokens {
  access: { token: string };
  refresh: { token: string };
}

interface BackendUser {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  is_verified?: boolean;
  status?: string;
}

interface BackendAdmin {
  id: string;
  full_name: string;
  business_email: string;
  company_name?: string;
  role: string;
  status?: string;
}

// ── Normalizers ───────────────────────────────────────────────────────────────

function normalizeUser(u: BackendUser): User {
  return {
    id: u.id,
    email: u.email,
    name: u.full_name,
    role: 'buyer',
    verificationStatus: 'approved',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name)}&background=BE220E&color=fff`,
  };
}

function normalizeAdmin(a: BackendAdmin): User {
  return {
    id: a.id,
    email: a.business_email,
    name: a.full_name,
    role: 'brand',
    verificationStatus: 'approved',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(a.full_name)}&background=BE220E&color=fff`,
  };
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Restore session from stored user on mount
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored && token.getAccess()) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Try buyer login first, then admin login
    let normalizedUser: User;
    let tokens: BackendTokens;

    try {
      const res = await api.post<{ user: BackendUser; tokens: BackendTokens }>(
        '/users/login',
        { email, password },
      );
      normalizedUser = normalizeUser(res.data.user);
      tokens = res.data.tokens;
      token.set(tokens.access.token, tokens.refresh.token, 'user');
    } catch (userErr) {
      // If user login fails, attempt admin login
      try {
        const res = await api.post<{ admin: BackendAdmin; tokens: BackendTokens }>(
          '/admin/login',
          { email, password },
        );
        normalizedUser = normalizeAdmin(res.data.admin);
        tokens = res.data.tokens;
        token.set(tokens.access.token, tokens.refresh.token, 'admin');
      } catch {
        // Surface the original error message if both fail
        const msg = userErr instanceof ApiError ? userErr.message : 'Invalid email or password';
        throw new Error(msg);
      }
    }

    setUser(normalizedUser);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  };

  const logout = () => {
    setUser(null);
    token.clearTokens();
    localStorage.removeItem('user');
  };

  const signup = async (data: SignupData) => {
    // Only buyer self-registration is supported via API
    if (data.role !== 'buyer') {
      throw new Error('Only buyer accounts can self-register');
    }

    await api.post('/users/register', {
      full_name: data.name,
      email: data.email,
      phone_number: data.phone ?? '',
      password: data.password,
    });
    // Registration triggers an OTP email — caller handles next step
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
