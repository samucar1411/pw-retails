import { User, UserCreateInput, UserUpdateInput } from '@/types/user';
import { PaginatedResponse, ListParams } from '@/types/api';
import { api } from './api';

export const userService = {
  getUsers: async (params?: ListParams): Promise<PaginatedResponse<User>> => {
    const { data } = await api.get<PaginatedResponse<User>>('/api/users/', { 
      params: { ...params, format: 'json' } 
    });
    return data;
  },

  /**
   * @deprecated Use getUsers with filters instead
   */
  getAllUsers: async (): Promise<User[]> => {
    const allUsers: User[] = [];
    let page = 1;
    const pageSize = 100;
    
    while (true) {
      const response = await userService.getUsers({ page, pageSize });
      allUsers.push(...response.results);
      
      if (!response.next) {
        break;
      }
      
      page++;
    }
    
    return allUsers;
  },

  getUser: async (id: number): Promise<User | null> => {
    try {
      const { data } = await api.get<User>(`/api/users/${id}/`);
      return data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return null;
    }
  },

  createUser: async (userData: UserCreateInput): Promise<User | null> => {
    try {
      const { data } = await api.post<User>('/api/users/', userData);
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  },

  updateUser: async (id: number, userData: UserUpdateInput): Promise<User | null> => {
    try {
      const { data } = await api.patch<User>(`/api/users/${id}/`, userData);
      return data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      return null;
    }
  },

  deleteUser: async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/api/users/${id}/`);
      return true;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      return false;
    }
  },
}; 