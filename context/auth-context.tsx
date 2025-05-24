'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/auth-service';

interface UserInfo {
  user_id?: number;
  email?: string;
  first_name?: string; // This is the normalized field name we use in the app
  firts_name?: string; // This is the actual field name from the API with typo
  last_name?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  login: (username: string, password: string) => Promise<void>;
  loginWithUserInfo: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const token = authService.getToken();
      const storedUserInfo = localStorage.getItem('user_info');
      
      if (token) {
        setIsAuthenticated(true);
        if (storedUserInfo) {
          setUserInfo(JSON.parse(storedUserInfo));
        }
      } else {
        setIsAuthenticated(false);
        setUserInfo(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const authPages = ['/login', '/forgot-password', '/register'];
      const isAuthPage = authPages.includes(pathname);

      if (!isAuthenticated && pathname.startsWith('/dashboard')) {
        router.replace('/login');
      } else if (isAuthenticated && isAuthPage) {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const success = await authService.login(username, password);
      if (!success) {
        throw new Error('Login failed');
      }
      setIsAuthenticated(true);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [router]);

  const loginWithUserInfo = useCallback(async (username: string, password: string) => {
    try {
      const response = await authService.loginWithUserInfo(username, password);
      const userInfo = {
        user_id: response.user_id,
        email: response.email,
        first_name: response.firts_name, // Using the correct field name with the typo
        last_name: response.last_name,
      };
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      setUserInfo(userInfo);
      setIsAuthenticated(true);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login with user info error:', error);
      throw error;
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      // First clear all auth data
      authService.logout();
      
      // Then update the state
      setIsAuthenticated(false);
      setUserInfo(null);
      
      // Force a router replace instead of push to prevent back navigation
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, we should still clear the local state
      setIsAuthenticated(false);
      setUserInfo(null);
      router.replace('/login');
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userInfo, 
      login, 
      loginWithUserInfo, 
      logout,
      isLoading 
    }}>
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