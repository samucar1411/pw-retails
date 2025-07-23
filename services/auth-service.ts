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
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const setToken = (token: string) => {
  try {
    const cleanToken = token.replace(/^(Bearer|Token)\s+/i, '').trim();
    localStorage.setItem(TOKEN_KEY, cleanToken);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('[Auth] Error setting token:', error.message);
    }
  }
};

const clearAuthData = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('[Auth] Error clearing auth data:', error.message);
    }
  }
};

const authenticateUser = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await api.post('api-token-auth2/', { username, password });

    if (!response.data?.token) {
      throw new Error('Invalid response format - no token found');
    }

    return response.data;
  } catch (error) {
    console.error('[Auth] Authentication error:', error);
    throw error;
  }
};

const login = async (username: string, password: string): Promise<boolean> => {
  try {
    const data = await authenticateUser(username, password);
    setToken(data.token);
    return true;
  } catch {
    clearAuthData();
    return false;
  }
};

const loginWithUserInfo = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    const data = await authenticateUser(username, password);
    setToken(data.token);
    return data;
  } catch (error) {
    clearAuthData();
    throw error;
  }
};

const logout = () => {
  clearAuthData();
};

const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};

const getCurrentUser = async (): Promise<AuthResponse | null> => {
  try {
    const token = getToken();
    if (!token) {
      return null;
    }

    // Intentar obtener información del usuario desde el endpoint de autenticación
    // Si no funciona, retornar null para que se use la información del login
    try {
      const response = await api.get('api-token-auth2/');
      return response.data;
    } catch {
      // Si el endpoint no existe, retornar null
      // La información del usuario se cargará desde el login
      return null;
    }
  } catch (error) {
    console.error('[Auth] Error getting current user:', error);
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