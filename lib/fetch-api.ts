/**
 * Utilidad para realizar peticiones a la API con manejo de errores mejorado
 */

// Definir el formato de respuesta de la API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  status: number;
}

// Opciones para la petición fetch
interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
}

/**
 * Función para realizar peticiones a la API con manejo de errores
 * @param endpoint Ruta del endpoint
 * @param options Opciones de la petición
 * @returns Una respuesta estructurada, incluso en caso de error
 */
export async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', headers = {}, body, params } = options;
  
  // Construir la URL con parámetros si existen
  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url = `${url}?${searchParams.toString()}`;
  }
  
  try {
    // Configurar las opciones de fetch
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
    
    // Añadir el cuerpo si existe
    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    // Realizar la petición
    const response = await fetch(url, fetchOptions);
    
    // Intentar parsear la respuesta como JSON
    let data: any;
    try {
      data = await response.json();
    } catch (e) {
      // Si no es JSON, usar un objeto vacío
      data = {};
    }
    
    // Si la respuesta no es exitosa, construir un objeto de respuesta de error
    if (!response.ok) {
      console.error(`❌ API Error: ${url} ${JSON.stringify(data)}`);
      
      return {
        success: false,
        data: {} as T,
        message: data.message || `Error ${response.status}: ${response.statusText}`,
        status: response.status,
      };
    }
    
    // Devolver una respuesta exitosa
    return {
      success: true,
      data: data as T,
      status: response.status,
    };
  } catch (error) {
    // Manejar errores de red o de JavaScript
    console.error(`❌ API Error: ${url} ${error}`);
    
    return {
      success: false,
      data: {} as T,
      message: error instanceof Error ? error.message : 'Error desconocido',
      status: 0, // 0 indica error de red
    };
  }
}
