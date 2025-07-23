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
    const checkAuth = async () => {
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);

      // Si está autenticado, intentar cargar la información del usuario
      if (isAuth && !userInfo) {
        try {
          const token = authService.getToken();
          if (token) {
            // Cargar información del usuario desde la API
            const userData = await authService.getCurrentUser();
            if (userData) {
              setUserInfo({
                first_name: userData.firts_name, // API returns "firts_name" (typo)
                last_name: userData.last_name,
                email: userData.email
              });
            } else {
              // Si no se puede obtener la información del usuario, usar información básica
              setUserInfo({
                first_name: 'Usuario',
                last_name: '',
                email: 'usuario@pwretails.com'
              });
            }
          }
        } catch (error) {
          console.error('Error loading user info:', error);
          // En caso de error, usar información básica
          setUserInfo({
            first_name: 'Usuario',
            last_name: '',
            email: 'usuario@pwretails.com'
          });
        }
      }

      // Si no está autenticado y no estamos en login, redirigir
      if (!isAuth && pathname !== '/login') {
        router.push('/login');
      }
    };

    checkAuth();
  }, [pathname, router, userInfo]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const data = await authService.loginWithUserInfo(username, password);
      if (data.token) {
        setIsAuthenticated(true);
        setUserInfo({
          first_name: data.firts_name, // API returns "firts_name" (typo)
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