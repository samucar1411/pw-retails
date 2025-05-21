// Importamos axios directamente para evitar problemas con el proxy
import axios from 'axios';
import https from 'https';

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
  }
};

const authenticateUser = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    // Usar el proxy de Next.js en lugar de llamar directamente a la API
    const endpoint = `/api/api-token-auth2/`;
    
    console.log(`[Auth] Intentando autenticar al usuario: ${username} en endpoint: ${endpoint}`);
    
    // Configurar axios para ignorar errores de SSL
    const axiosInstance = axios.create({
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });
    
    // Usamos axios para hacer la petición al proxy de Next.js
    const response = await axiosInstance.post(endpoint, 
      { username, password }, // Enviamos como JSON, el proxy lo convertirá a form-urlencoded
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000
      }
    );
    
    console.log(`[Auth] Respuesta recibida:`, response.status, response.statusText);
    
    console.log('[Auth] Respuesta recibida:', response.data);

    if (!response.data.token) {
      console.error('[Auth] No se encontró token en la respuesta:', response.data);
      throw new Error('Invalid response format - no token in response');
    }

    const token = response.data.token.replace(/^(Bearer|Token)\s+/i, '');
    const authResponse: AuthResponse = {
      ...response.data,
      token: token
    };

    console.log('[Auth] Autenticación exitosa, token obtenido');
    return authResponse;
  } catch (error) {
    console.error('[Auth] Error en authenticateUser:', error);
    throw error;
  }
};

const login = async (username: string, password: string): Promise<boolean> => {
  try {
    console.log('[Auth] Iniciando login básico');
    const data = await authenticateUser(username, password);
    setToken(data.token);
    console.log('[Auth] Login básico exitoso');
    return true;
  } catch (error) {
    console.error('[Auth] Error en login básico:', error);
    return false;
  }
};

const loginWithUserInfo = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('[Auth] Iniciando login con info de usuario');
    const data = await authenticateUser(username, password);
    setToken(data.token);
    console.log('[Auth] Login con info exitoso, datos de usuario:', data);
    return data;
  } catch (error) {
    console.error('[Auth] Error en loginWithUserInfo:', error);
    throw error;
  }
};

const logout = () => {
  if (typeof window !== 'undefined') {
    console.log('[Auth] Cerrando sesión del usuario');
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    
    // Clear the auth cookie
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
    
    // Clear any other auth-related data
    sessionStorage.clear();
    console.log('[Auth] Sesión cerrada correctamente');
  }
};

const isAuthenticated = (): boolean => {
  const token = getToken();
  console.log(`[Auth] Verificando autenticación. Token existe: ${!!token}`);
  return !!token;
};

export const authService = {
  getToken,
  login,
  loginWithUserInfo,
  logout,
  isAuthenticated
};