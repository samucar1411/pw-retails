import { User, UserCreateInput, UserUpdateInput } from '@/types/user';
import { api } from './api';

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const { data } = await api.get('/api/users/');
    return data;
  },

  getUser: async (id: number): Promise<User> => {
    const { data } = await api.get(`/api/users/${id}`);
    return data;
  },

  createUser: async (userData: UserCreateInput): Promise<User> => {
    const { data } = await api.post('/api/users/', userData);
    return data;
  },

  updateUser: async (id: number, userData: UserUpdateInput): Promise<User> => {
    const { data } = await api.patch(`/api/users/${id}`, userData);
    return data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/api/users/${id}`);
  },
}; 