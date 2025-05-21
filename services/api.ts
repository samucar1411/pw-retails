import axios, {
  AxiosError,
  AxiosResponse,
  RawAxiosRequestHeaders,
} from "axios";
import qs from "qs";
import https from "https";

// Remove BASE_URL as we're using proxy
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetchOptions {
  method?: HttpMethod;
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: RawAxiosRequestHeaders;
}

interface DefaultHeaders {
  Accept: string;
  "Content-Type"?: string;
}

// Utilizar el proxy configurado en Next.js
export const api = axios.create({
  baseURL: "", // Usar ruta relativa para aprovechar el proxy de Next.js
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
  paramsSerializer: {
    serialize: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
  },
  // Configure HTTPS agent for all environments
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // Allow self-signed certificates
  }),
  timeout: 15000, // Increased timeout to 15 seconds
});

// Configure HTTPS agent for all environments
api.defaults.httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// Configurar proxy para desarrollo local
if (process.env.NODE_ENV === "development") {
  console.log("Running in development mode with SSL verification disabled");
}

api.interceptors.request.use(
  (config) => {
    const defaultHeaders: DefaultHeaders = {
      Accept: "application/json",
    };

    if (config.url?.includes("api-token-auth2")) {
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

    let fullUrl = config.url || '';
    if (config.params) {
      const serializedParams = qs.stringify(config.params, { arrayFormat: "repeat" });
      if (serializedParams) {
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + serializedParams;
      }
    }
    console.log(`[Axios Request Interceptor] Attempting to hit URL: ${config.baseURL || ''}${fullUrl}`);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const stack = new Error().stack?.split("\n").slice(2, 5);

    if (error.code === "ERR_NETWORK") {
      // Handle network errors
      console.error("Network error:", error);

      // For dashboard endpoints, return mock data instead of rejecting
      const url = error.config?.url || "";
      if (url.includes("/api/dashboard")) {
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