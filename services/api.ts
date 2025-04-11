import axios, { AxiosError, AxiosResponse, RawAxiosRequestHeaders, AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios';
import qs from 'qs';
import https from 'https';

// Extend AxiosRequestConfig to include our custom property
interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _requestStack?: string;
}

// Remove BASE_URL as we're using proxy
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface FetchOptions {
  method?: HttpMethod;
  data?: any;
  params?: Record<string, any>;
  headers?: RawAxiosRequestHeaders;
}

interface DefaultHeaders {
  'Accept': string;
  'Content-Type'?: string;
}


export const api = axios.create({
  baseURL: '', // Empty as we're using Next.js proxy
  headers: {
    'Accept': 'application/json'
  },
  withCredentials: true, 
  paramsSerializer: {
    serialize: (params) => qs.stringify(params, { arrayFormat: 'repeat' })
  },
  // Configure HTTPS agent for development
  httpsAgent: new https.Agent({
    rejectUnauthorized: false // Allow self-signed certificates
  })
});

if (process.env.NODE_ENV === "development") {
  api.defaults.httpsAgent = new (require("https").Agent)({
    rejectUnauthorized: false,
  });
}


api.interceptors.request.use((config) => {
  const stack = new Error().stack?.split('\n').slice(2, 5);
  
  const defaultHeaders: DefaultHeaders = {
    'Accept': 'application/json'
  };

  if (config.url?.includes('api-token-auth')) {
    defaultHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
    if (config.data && typeof config.data === 'object') {
      config.data = qs.stringify(config.data);
    }
  } else {
    defaultHeaders['Content-Type'] = 'application/json';
    config.params = { ...config.params, format: 'json' };
  }

  Object.entries(defaultHeaders).forEach(([key, value]) => {
    if (value) {
      config.headers.set(key, value);
    }
  });

  const token = localStorage.getItem('auth_token');
  if (token) {
    const cleanToken = token.replace(/^(Bearer|Token)\s+/i, '').trim();
    const authHeader = `Token ${cleanToken}`;
    config.headers.set('Authorization', authHeader);
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor with enhanced error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const stack = new Error().stack?.split('\n').slice(2, 5);
    
    if (error.code === 'ERR_NETWORK') {
      // Handle network errors
      console.error('Network error:', error);
    }

    const errorResponse = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data,
        params: error.config?.params
      }
    };

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Only clear auth data if we're not already on an auth page
      const isAuthPage = window.location.pathname.includes('/login') || 
                        window.location.pathname.includes('/register') ||
                        window.location.pathname.includes('/forgot-password');
      
      if (!isAuthPage) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
      }
    }

    return Promise.reject({
      data: error.response?.data,
      status: error.response?.status || 500,
      message: error.message || 'An unexpected error occurred'
    });
  }
);

// Enhanced fetchApi with better error handling
export const fetchApi = async <ResponseType>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<ResponseType>> => {
  try {
    console.log(`📡 Calling API: ${options.method || 'GET'} ${endpoint}`);
    
    const response: AxiosResponse<ResponseType> = await api.request({
      url: endpoint,
      method: options.method || 'GET',
      data: options.data,
      params: options.params,
      headers: options.headers
    });

    console.log(`✅ API Success: ${endpoint}`, { status: response.status });
    
    return {
      data: response.data,
      status: response.status,
      message: 'Success'
    };
  } catch (error) {
    // Mejorar el logging de errores
    console.error(`❌ API Error: ${endpoint}`, error);
    
    // Crear respuesta de error estandarizada
    let errorResponse: ApiResponse<ResponseType> = {
      data: null as unknown as ResponseType, // Casting null como ResponseType para compatibilidad
      status: 500,
      message: 'Unknown error occurred'
    };
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // Registrar detalles del error para depuración
      console.error('Axios error details:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data
      });
      
      errorResponse = {
        data: null as unknown as ResponseType,
        status: axiosError.response?.status || 500,
        message: axiosError.message || 'Request failed'
      };
      
      // Si la respuesta es un 404, podemos devolver un objeto vacío en lugar de null
      // para evitar errores en los componentes que esperan un objeto
      if (axiosError.response?.status === 404 && Array.isArray(null as unknown as ResponseType)) {
        errorResponse.data = [] as unknown as ResponseType;
      }
    } else {
      errorResponse.message = error instanceof Error ? error.message : 'An unexpected error occurred';
    }
    
    // En lugar de lanzar el error, lo devolvemos como respuesta con un indicador de error
    // Esto evita errores no manejados en los componentes
    return errorResponse;
  }
};

export const createResource = async <T>(endpoint: string, data: any): Promise<ApiResponse<T>> => {
  return fetchApi<T>(endpoint, { method: 'POST', data });
};

export const getResource = async <T>(endpoint: string, id?: string | number): Promise<ApiResponse<T>> => {
  const path = id ? `${endpoint}/${id}` : endpoint;
  return fetchApi<T>(path);
};

export const updateResource = async <T>(endpoint: string, id: string | number, data: any): Promise<ApiResponse<T>> => {
  return fetchApi<T>(`${endpoint}/${id}`, { method: 'PUT', data });
};

export const deleteResource = async (endpoint: string, id: string | number): Promise<ApiResponse<void>> => {
  return fetchApi<void>(`${endpoint}/${id}`, { method: 'DELETE' });
};

export const getResourceWithParams = async <T>(endpoint: string, params: Record<string, any>): Promise<ApiResponse<T>> => {
  return fetchApi<T>(endpoint, { params });
};