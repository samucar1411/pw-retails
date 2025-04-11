import { fetchApi } from '@/lib/fetch-api';

export interface DashboardStats {
  facturacion: number;
  clientesActivos: number;
  sucursalesActivas: number;
  clientesInactivos: number;
}

export interface SalesData {
  name: string;
  clientes: number;
  ventas: number;
}

export interface RecentClient {
  id: string;
  name: string;
  date: string;
  sucursales: number;
  logo?: string;
  image_url?: string;
}

// Datos por defecto para usar cuando la API falla
const defaultStats: DashboardStats = {
  facturacion: 15450,
  clientesActivos: 120,
  sucursalesActivas: 32,
  clientesInactivos: 8
};

const defaultSalesData: SalesData[] = [
  { name: 'Ene', clientes: 10, ventas: 5000 },
  { name: 'Feb', clientes: 15, ventas: 7500 },
  { name: 'Mar', clientes: 25, ventas: 12500 },
  { name: 'Abr', clientes: 45, ventas: 15000 },
  { name: 'May', clientes: 55, ventas: 17500 },
  { name: 'Jun', clientes: 75, ventas: 20000 },
];

const defaultRecentClients: RecentClient[] = [
  {
    id: '1',
    name: 'Supermercados FreshMart',
    date: '2024-01-15',
    sucursales: 5,
    logo: '/images/clients/freshmart.png',
  },
  {
    id: '2',
    name: 'Restaurantes El Gourmet',
    date: '2024-02-12',
    sucursales: 3,
    logo: '/images/clients/gourmet.png',
  },
  {
    id: '3',
    name: 'Hoteles Premium',
    date: '2024-03-05',
    sucursales: 7,
    logo: '/images/clients/premium.png',
  },
  {
    id: '4',
    name: 'Farmacias MediPlus',
    date: '2024-03-20',
    sucursales: 12,
    logo: '/images/clients/mediplus.png',
  },
];

const getStats = async (): Promise<DashboardStats> => {
  try {
    const response = await fetchApi<DashboardStats>('/api/dashboard/stats');
    
    // Verificar si la respuesta contiene los datos esperados
    if (!response || !response.data || !response.data.facturacion) {
      console.warn('API response for stats is missing required data, using default');
      return defaultStats;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Retornar datos por defecto en caso de error
    return defaultStats;
  }
};

const getSalesData = async (period: string = 'month'): Promise<SalesData[]> => {
  try {
    const response = await fetchApi<SalesData[]>('/api/dashboard/sales', {
      method: 'GET',
      params: { period },
    });
    
    // Verificar si la respuesta contiene datos válidos
    if (!response || !response.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.warn('API response for sales data is invalid, using default');
      return defaultSalesData;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching sales data:', error);
    // Retornar datos por defecto en caso de error
    return defaultSalesData;
  }
};

const getRecentClients = async (): Promise<RecentClient[]> => {
  try {
    const response = await fetchApi<RecentClient[]>('/api/dashboard/recent-clients');
    
    // Verificar si la respuesta contiene datos válidos
    if (!response || !response.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.warn('API response for recent clients is invalid, using default');
      return defaultRecentClients;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching recent clients:', error);
    // Retornar datos por defecto en caso de error
    return defaultRecentClients;
  }
};

export const dashboardService = {
  getStats,
  getSalesData,
  getRecentClients,
};