'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/auth-service';

interface AuthContextType {
  isAuthenticated: boolean;
  userInfo: {
    first_name?: string;
    last_name?: string;
    email?: string;
  } | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<AuthContextType['userInfo']>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Verificar autenticación inicial
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);

      // Si no está autenticado y no estamos en login, redirigir
      if (!isAuth && pathname !== '/login') {
        router.push('/login');
      }
    };

    checkAuth();
  }, [pathname, router]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const data = await authService.loginWithUserInfo(username, password);
      if (data.token) {
        setIsAuthenticated(true);
        setUserInfo({
          first_name: data.firts_name, // Note: API has a typo in the field name
          last_name: data.last_name,
          email: data.email
        });
        router.push('/dashboard');
        return true;
      }
      return false;
    } catch {
      setIsAuthenticated(false);
      setUserInfo(null);
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUserInfo(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userInfo, login, logout }}>
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