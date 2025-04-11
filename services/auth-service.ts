import { fetchApi } from './api';

const ENDPOINT = '/api-token-auth';

interface AuthResponse {
  token: string;
  user_id?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
}

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    return token;
  }
  return null;
};

const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    document.cookie = `auth_token=${token}; path=/; secure; samesite=strict`;
    const storedToken = localStorage.getItem('auth_token');
  }
};

const authenticateUser = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetchApi<AuthResponse>(ENDPOINT, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: {
        username,
        password,
      }
    });

    if (!response.data.token) {
      throw new Error('Invalid response format - no token in response');
    }

    const token = response.data.token.replace(/^(Bearer|Token)\s+/i, '');
    response.data.token = token;

    return response.data;
  } catch (error) {
    throw error;
  }
};

const login = async (username: string, password: string): Promise<boolean> => {
  try {
    const data = await authenticateUser(username, password);
    setToken(data.token);
    return true;
  } catch (error) {
    return false;
  }
};

const loginWithUserInfo = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    const data = await authenticateUser(username, password);
    setToken(data.token);
    return data;
  } catch (error) {
    throw error;
  }
};

const logout = () => {
  if (typeof window !== 'undefined') {
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    
    // Clear the auth cookie
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
    
    // Clear any other auth-related data
    sessionStorage.clear();
  }
};

const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const authService = {
  getToken,
  login,
  loginWithUserInfo,
  logout,
  isAuthenticated
};