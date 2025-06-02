import axios, { AxiosError, AxiosResponse, RawAxiosRequestHeaders } from 'axios';
import qs from 'qs';

/* Instancia global ------------------------------------------------ */
export const api = axios.create({
  baseURL: 'https://pw-retails.vercel.app',  // Usar rutas locales que serán redirigidas por rewrites
  timeout: 15000,
  paramsSerializer: { serialize: (p) => qs.stringify(p, { arrayFormat: 'repeat' }) },
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

/* Request interceptor -------------------------------------------- */
api.interceptors.request.use((cfg) => {
  const url = cfg.url ?? '';

  // Añade format=json sólo para endpoints REST (evita /auth/)
  if (url.startsWith('/?') || url.startsWith('auth/')) {
    // no tocamos nada
  } else {
    cfg.params = { ...cfg.params, format: 'json' };
  }

  // Token salvo en login /auth/
  if (!url.startsWith('auth/')) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) cfg.headers!.Authorization = `Token ${token.replace(/^Token\s+/i, '').trim()}`;
  }

  // Fuerza barra final si falta
  const [path, query] = url.split('?');
  if (path && !path.endsWith('/')) cfg.url = `${path}/${query ? '?' + query : ''}`;

  return cfg;
});

/* Response interceptor simplificado ------------------------------ */
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => Promise.reject({
    data:    err.response?.data ?? {},
    status:  err.response?.status ?? 500,
    message: err.message,
  })
);

/* Helper opcional ------------------------------------------------- */
export interface ApiResponse<T> { data: T; status: number; }

export const fetchApi = async <T>(
  url: string,
  opts?: { method?: 'GET'|'POST'|'PUT'|'PATCH'|'DELETE'; data?: unknown; params?: Record<string, unknown>; headers?: RawAxiosRequestHeaders }
): Promise<ApiResponse<T>> => {
  const r: AxiosResponse<T> = await api.request({ url, method: opts?.method ?? 'GET', ...opts });
  return { data: r.data, status: r.status };
};