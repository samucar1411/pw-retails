import axios, {
  AxiosError,
  AxiosResponse,
  RawAxiosRequestHeaders,
  AxiosRequestHeaders,
  InternalAxiosRequestConfig,
} from "axios";
import qs from "qs";
import https from "https";

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

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetchOptions {
  method?: HttpMethod;
  data?: any;
  params?: Record<string, any>;
  headers?: RawAxiosRequestHeaders;
}

interface DefaultHeaders {
  Accept: string;
  "Content-Type"?: string;
}

// Log SSL verification status
console.log("[API] SSL certificate verification is DISABLED");

export const api = axios.create({
  baseURL: "", // Empty as we're using Next.js proxy
  headers: {
    Accept: "application/json",
  },
  withCredentials: true, // This is important for auth
  paramsSerializer: {
    serialize: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
  },
  // Configure HTTPS agent for all environments
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // Allow self-signed certificates
  }),
  timeout: 10000, // Aumentado para dar más tiempo
});

// Configurar el agente HTTPS para todos los entornos
api.defaults.httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// Configurar proxy para desarrollo local
if (process.env.NODE_ENV === "development") {
  console.log("[API] Running in development mode with SSL verification disabled");
}

api.interceptors.request.use(
  (config) => {
    // Debug log para verificar URLs
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    
    const stack = new Error().stack?.split("\n").slice(2, 5);

    const defaultHeaders: DefaultHeaders = {
      Accept: "application/json",
    };

    if (config.url?.includes("api-token-auth")) {
      defaultHeaders["Content-Type"] = "application/x-www-form-urlencoded";
      if (config.data && typeof config.data === "object") {
        config.data = qs.stringify(config.data);
      }
    } else {
      defaultHeaders["Content-Type"] = "application/json";
      config.params = { ...config.params, format: "json" };
    }

    Object.entries(defaultHeaders).forEach(([key, value]) => {
      if (value) {
        config.headers.set(key, value);
      }
    });

    const token = localStorage.getItem("auth_token");
    if (token) {
      const cleanToken = token.replace(/^(Bearer|Token)\s+/i, "").trim();
      const authHeader = `Token ${cleanToken}`;
      config.headers.set("Authorization", authHeader);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] Success: ${response.status}`);
    return response;
  },
  (error: AxiosError) => {
    const stack = new Error().stack?.split("\n").slice(2, 5);
    
    // Logging detallado para errores 
    console.error(`[API Error] ${error.response?.status || 'Network Error'} - ${error.message}`, error.response?.data);

    if (error.code === "ERR_NETWORK") {
      // Handle network errors
      console.error("Network error:", error);

      // For dashboard and event endpoints, return mock data instead of rejecting
      const url = error.config?.url || "";
      if (url.includes("/api/dashboard") || url.includes("/api/events")) {
        console.warn("Returning mock data for failed request to:", url);
        return Promise.resolve({
          data: {},
          status: 200,
          statusText: "OK (Mock Data)",
          headers: {},
          config: error.config,
        });
      }
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
        params: error.config?.params,
      },
    };

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Only clear auth data if we're not already on an auth page
      const isAuthPage =
        window.location.pathname.includes("/login") ||
        window.location.pathname.includes("/register") ||
        window.location.pathname.includes("/forgot-password");

      if (!isAuthPage) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_info");
        document.cookie =
          "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict";
      }
    }

    return Promise.reject({
      data: error.response?.data || {},
      status: error.response?.status || 500,
      message: error.message || "An unexpected error occurred",
    });
  }
);

// Enhanced fetchApi with better error handling
export const fetchApi = async <ResponseType>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<ResponseType>> => {
  try {
    const response: AxiosResponse<ResponseType> = await api.request({
      url: endpoint,
      method: options.method || "GET",
      data: options.data,
      params: options.params,
      headers: options.headers,
    });

    return {
      data: response.data,
      status: response.status,
      message: "Success",
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      throw {
        data: axiosError.response?.data,
        status: axiosError.response?.status || 500,
        message: axiosError.message || "Request failed",
      };
    }
    throw {
      data: null,
      status: 500,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};

export const createResource = async <T>(
  endpoint: string,
  data: any
): Promise<ApiResponse<T>> => {
  return fetchApi<T>(endpoint, { method: "POST", data });
};

export const getResource = async <T>(
  endpoint: string,
  id?: string | number
): Promise<ApiResponse<T>> => {
  const path = id ? `${endpoint}/${id}` : endpoint;
  return fetchApi<T>(path);
};

export const updateResource = async <T>(
  endpoint: string,
  id: string | number,
  data: any
): Promise<ApiResponse<T>> => {
  return fetchApi<T>(`${endpoint}/${id}`, { method: "PUT", data });
};

export const deleteResource = async (
  endpoint: string,
  id: string | number
): Promise<ApiResponse<void>> => {
  return fetchApi<void>(`${endpoint}/${id}`, { method: "DELETE" });
};

export const getResourceWithParams = async <T>(
  endpoint: string,
  params: Record<string, any>
): Promise<ApiResponse<T>> => {
  return fetchApi<T>(endpoint, { params });
};