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
  // Tokens are now handled via httpOnly cookies through middleware
  return null;
};

const setToken = (token: string) => {
  // Tokens are now handled via httpOnly cookies
  // This function is kept for backward compatibility but does nothing
};

const clearAuthData = () => {
  // Auth data is now cleared via API endpoint
};

const authenticateUser = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch('/api/auth/login', {
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
    // Add a dummy token for backward compatibility
    return { ...userData, token: 'cookie-based-auth' };
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
};

const isAuthenticated = (): boolean => {
  // Check will be done server-side via middleware
  // For client-side, we assume authenticated if not redirected to login
  return true;
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