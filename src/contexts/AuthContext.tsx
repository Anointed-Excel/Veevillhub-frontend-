import React, { createContext, useContext, useState, useEffect } from 'react';

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

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (data: SignupData) => Promise<void>;
  isAuthenticated: boolean;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  documents?: {
    cac?: File;
    tin?: File;
    nin?: File;
    proofOfAddress?: File;
    selfie?: File;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - check localStorage for users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const signup = async (data: SignupData) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    if (users.find((u: any) => u.email === data.email)) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: Date.now().toString(),
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role,
      verificationStatus: data.role === 'buyer' ? 'approved' : 'pending',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=BE220E&color=fff`,
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Auto-login for buyers
    if (data.role === 'buyer') {
      const { password, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      signup,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
