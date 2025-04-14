import { getResource, getResourceWithParams } from "./api";

interface DashboardStats {
  facturacion: number;
  clientesActivos: number;
  sucursalesActivas: number;
  clientesInactivos: number;
}

interface SalesData {
  name: string;
  clientes: number;
  ventas: number;
}

interface RecentClient {
  id: string;
  name: string;
  date: string;
  sucursales: number;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      // Intentar obtener datos de la API
      const response = await getResource<DashboardStats>(
        "/api/dashboard/stats"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Usar datos simulados cuando la API no está disponible
      const mockData = {
        facturacion: 25000,
        clientesActivos: 42,
        sucursalesActivas: 15,
        clientesInactivos: 8,
      };
      return mockData;
    }
  },

  getSalesData: async (
    period: "7d" | "30d" | "90d" = "30d"
  ): Promise<SalesData[]> => {
    try {
      const response = await getResourceWithParams<SalesData[]>(
        "/api/dashboard/sales",
        { period }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching sales data:", error);
      // Proporcionar datos de prueba cuando la API no está disponible
      const mockData: SalesData[] = [
        { name: "Ene", clientes: 12, ventas: 8500 },
        { name: "Feb", clientes: 15, ventas: 9200 },
        { name: "Mar", clientes: 18, ventas: 10500 },
        { name: "Abr", clientes: 16, ventas: 9800 },
        { name: "May", clientes: 20, ventas: 12000 },
        { name: "Jun", clientes: 22, ventas: 13500 },
      ];
      return mockData;
    }
  },

  getRecentClients: async (): Promise<RecentClient[]> => {
    try {
      const response = await getResource<RecentClient[]>(
        "/api/dashboard/recent-clients"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching recent clients:", error);
      // Proporcionar datos de prueba cuando la API no está disponible
      const mockClients: RecentClient[] = [
        { id: "1", name: "Empresa ABC", date: "2023-05-15", sucursales: 3 },
        { id: "2", name: "Corporación XYZ", date: "2023-05-12", sucursales: 5 },
        { id: "3", name: "Industrias 123", date: "2023-05-10", sucursales: 2 },
        {
          id: "4",
          name: "Servicios Técnicos",
          date: "2023-05-08",
          sucursales: 1,
        },
      ];
      return mockClients;
    }
  },
};
