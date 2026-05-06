'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User } from '@/types';
import api, { getErrorMessage } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data.success) {
        setUser(data.data);
        localStorage.setItem('luxecart_user', JSON.stringify(data.data));
      }
    } catch {
      // Token might be expired
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('luxecart_token');
    const storedUser = localStorage.getItem('luxecart_user');

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // ignore parse errors
        }
      }
      // Refresh user data from server
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('luxecart_token', newToken);
    localStorage.setItem('luxecart_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('luxecart_token');
    localStorage.removeItem('luxecart_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('luxecart_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
