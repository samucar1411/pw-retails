import { api } from './api';

interface AuthResponse {
  token: string;
  user_id: number;
  email: string;
  firts_name: string; // API typo - should be "first_name"
  last_name: string;
}

const TOKEN_KEY = 'auth_token';

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

const authenticateUser = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch('/api-token-auth2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Authentication failed' }));
      throw new Error(errorData.error || 'Authentication failed');
    }

    const userData = await response.json();
    // Save the real token and return the data
    if (userData.token) {
      setToken(userData.token);
    }
    return userData;
  } catch (error) {
    throw error;
  }
};

const login = async (username: string, password: string): Promise<boolean> => {
  try {
    await authenticateUser(username, password);
    return true;
  } catch {
    return false;
  }
};

const loginWithUserInfo = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    const data = await authenticateUser(username, password);
    return data;
  } catch (error) {
    throw error;
  }
};

const logout = async () => {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
  }
  clearAuthData();
};

const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};

const getCurrentUser = async (): Promise<AuthResponse | null> => {
  try {
    const response = await fetch('/api/auth/me');
    
    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    return null;
  }
};

export const authService = {
  getToken,
  login,
  loginWithUserInfo,
  logout,
  isAuthenticated,
  getCurrentUser
};