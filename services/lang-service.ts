import { Lang, LangCreateInput, LangUpdateInput } from '@/types/lang';
import { api } from './api';

export const langService = {
  getLangs: async (): Promise<Lang[]> => {
    const response = await api.get('/langs/');
    return response.data;
  },

  getLang: async (id: number): Promise<Lang> => {
    const response = await api.get(`/langs/${id}`);
    return response.data;
  },

  createLang: async (langData: LangCreateInput): Promise<Lang> => {
    const response = await api.post('/langs/', langData);
    return response.data;
  },

  updateLang: async (id: number, langData: LangUpdateInput): Promise<Lang> => {
    const response = await api.patch(`/langs/${id}`, langData);
    return response.data;
  },

  deleteLang: async (id: number): Promise<void> => {
    await api.delete(`/langs/${id}`);
  },
}; 