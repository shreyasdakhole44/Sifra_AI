'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi } from './api';

interface User {
  id: string;
  worker_id?: string;
  name: string;
  email: string;
  role: 'Admin' | 'HSE Officer' | 'HSC Officer' | 'Worker';
  site_id?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { name: string; email: string; password: string; role: string; site_id?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedToken = localStorage.getItem('sifra_token');
    const savedUser = localStorage.getItem('sifra_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('sifra_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('sifra_token', data.access_token);
    localStorage.setItem('sifra_user', JSON.stringify(data.user));

    if (data.user.role === 'Worker') {
      router.push('/worker');
    } else {
      router.push('/admin');
    }
  };

  const signup = async (formData: { name: string; email: string; password: string; role: string; site_id?: string }) => {
    const data = await authApi.signup(formData);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('sifra_token', data.access_token);
    localStorage.setItem('sifra_user', JSON.stringify(data.user));

    if (data.user.role === 'Worker') {
      router.push('/worker');
    } else {
      router.push('/admin');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sifra_token');
    localStorage.removeItem('sifra_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
