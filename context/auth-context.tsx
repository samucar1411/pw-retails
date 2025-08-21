'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/auth-service';

interface AuthContextType {
  isAuthenticated: boolean;
  userInfo: {
    user_id?: number;
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
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  // Initial auth check and user info restoration
  useEffect(() => {
    const isAuth = authService.isAuthenticated();
    setIsAuthenticated(isAuth);
    
    // If authenticated, try to get current user info
    if (isAuth) {
      authService.getCurrentUser().then((userData) => {
        if (userData) {
          setUserInfo({
            user_id: userData.user_id,
            first_name: userData.firts_name,
            last_name: userData.last_name,
            email: userData.email
          });
        }
      }).catch((error) => {
        console.error('Failed to get current user:', error);
      });
      
      // If on login page, redirect to dashboard
      if (pathname === '/login') {
        window.location.href = '/dashboard';
      }
    }
  }, [pathname]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const data = await authService.loginWithUserInfo(username, password);
      
      if (data.token) {
        setIsAuthenticated(true);
        setUserInfo({
          user_id: data.user_id,
          first_name: data.firts_name,
          last_name: data.last_name,
          email: data.email
        });
        
        // Direct redirect
        window.location.href = '/dashboard';
        return true;
      }
      return false;
    } catch (error) {
      setIsAuthenticated(false);
      setUserInfo(null);
      return false;
    }
  };

  const logout = async () => {
    await authService.logout();
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