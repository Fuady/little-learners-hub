import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as api from '@/services/api';
import { User } from '@/services/api';
import { tokenStorage } from '@/lib/tokenStorage';
import { ApiError } from '@/lib/apiErrors';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string, role: 'parent' | 'educator') => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (tokenStorage.isAuthenticated()) {
        try {
          const userData = await api.getCurrentUser();
          setUser(userData);
        } catch (error) {
          // Token invalid or expired, clear it
          tokenStorage.removeToken();
        }
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userData = await api.login(email, password);
      setUser(userData);
      return { success: true };
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Login failed';
      return { success: false, error: message };
    }
  };

  const register = async (email: string, password: string, name: string, role: 'parent' | 'educator') => {
    try {
      const userData = await api.register({ email, password, name, role });
      setUser(userData);
      return { success: true };
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Registration failed';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
