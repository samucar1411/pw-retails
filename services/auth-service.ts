import { api } from './api';

interface AuthResponse {
  token: string;
  user_id: number;
  email: string;
  firts_name: string; // API typo - should be "first_name"
  last_name: string;
}

const TOKEN_KEY = 'auth_token';
const USER_INFO_KEY = 'user_info';

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

const getUserInfo = (): AuthResponse | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(USER_INFO_KEY);
    return stored ? JSON.parse(stored) : null;
  }
  return null;
};

const setUserInfo = (userInfo: AuthResponse) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
  }
};

const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
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
    // Save the real token and user info
    if (userData.token) {
      setToken(userData.token);
      setUserInfo(userData); // Guardar info del usuario
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


export const authService = {
  getToken,
  getUserInfo,
  login,
  loginWithUserInfo,
  logout,
  isAuthenticated,
};