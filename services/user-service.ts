import { api } from './api';
import { User, UserCreateInput } from '@/types/user';

export interface UpdateProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  profileImage?: string | null;
}

export const userService = {
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await api.patch('/users/profile', data);
    return response.data;
  },

  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },

  createUser: async (data: UserCreateInput): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data;
  },
}; 