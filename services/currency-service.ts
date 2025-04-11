import { Currency, CurrencyCreateInput, CurrencyUpdateInput } from '@/types/currency';
import { api } from './api';

export const currencyService = {
  getCurrencies: async (): Promise<Currency[]> => {
    const response = await api.get('/api/currencys/');
    return response.data;
  },

  getCurrency: async (id: number): Promise<Currency> => {
    const response = await api.get(`/api/currencys/${id}`);
    return response.data;
  },

  createCurrency: async (currencyData: CurrencyCreateInput): Promise<Currency> => {
    const response = await api.post('/api/currencys/', currencyData);
    return response.data;
  },

  updateCurrency: async (id: number, currencyData: CurrencyUpdateInput): Promise<Currency> => {
    const response = await api.patch(`/api/currencys/${id}`, currencyData);
    return response.data;
  },

  deleteCurrency: async (id: number): Promise<void> => {
    await api.delete(`/api/currencys/${id}`);
  },
}; 