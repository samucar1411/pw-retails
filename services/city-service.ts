import { City, CityCreateInput, CityUpdateInput } from '@/types/city';
import { api } from './api';

export const cityService = {
  getCities: async (): Promise<City[]> => {
    const response = await api.get('/api/citys/');
    // Handle both paginated and direct array responses
    return response.data.results || response.data;
  },

  getCity: async (id: number): Promise<City> => {
    const response = await api.get(`/api/citys/${id}/`);
    return response.data;
  },

  createCity: async (cityData: CityCreateInput): Promise<City> => {
    const response = await api.post('/api/citys/', cityData);
    return response.data;
  },

  updateCity: async (id: number, cityData: CityUpdateInput): Promise<City> => {
    const response = await api.patch(`/api/citys/${id}`, cityData);
    return response.data;
  },

  deleteCity: async (id: number): Promise<void> => {
    await api.delete(`/api/citys/${id}`);
  },
}; 