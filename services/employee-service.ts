import { PaginatedResponse, ListParams } from '../types/api';
import { api } from './api';

const ENDPOINT = '/api/employees';

export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  department: string;
  hire_date: string;
  status: 'active' | 'inactive';
}

export type EmployeeCreateInput = Omit<Employee, 'id'>;

export const getEmployees = async (params?: ListParams): Promise<PaginatedResponse<Employee>> => {
  try {
    const response = await api.get<PaginatedResponse<Employee>>(ENDPOINT, { 
      params: { ...params, format: 'json' } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    return { count: 0, next: null, previous: null, results: [] };
  }
};

/**
 * @deprecated Use getEmployees with filters instead
 */
export const getEmployeeById = async (id: string | number): Promise<Employee | null> => {
  try {
    const response = await api.get<Employee>(`${ENDPOINT}${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching employee:', error);
    return null;
  }
};

export const createEmployee = async (data: EmployeeCreateInput): Promise<Employee | null> => {
  try {
    const response = await api.post<Employee>(ENDPOINT, data);
    return response.data;
  } catch (error) {
    console.error('Error creating employee:', error);
    return null;
  }
};

export const updateEmployee = async (id: string | number, data: Partial<Employee>): Promise<Employee | null> => {
  try {
    const response = await api.put<Employee>(`${ENDPOINT}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating employee:', error);
    return null;
  }
};

export const deleteEmployee = async (id: string | number): Promise<boolean> => {
  try {
    await api.delete(`${ENDPOINT}${id}/`);
    return true;
  } catch (error) {
    console.error('Error deleting employee:', error);
    return false;
  }
};

// Funciones específicas del servicio de empleados
/**
 * Get active employees with pagination
 */
export const getActiveEmployees = async (params?: ListParams): Promise<PaginatedResponse<Employee>> => {
  try {
    const response = await api.get<PaginatedResponse<Employee>>(`${ENDPOINT}active/`, { 
      params: { ...params, format: 'json' } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching active employees:', error);
    return { count: 0, next: null, previous: null, results: [] };
  }
};

/**
 * Get employees by department with pagination
 */
export const getEmployeesByDepartment = async (
  department: string, 
  params?: ListParams
): Promise<PaginatedResponse<Employee>> => {
  try {
    const response = await api.get<PaginatedResponse<Employee>>(ENDPOINT, { 
      params: { department, ...params, format: 'json' } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching employees by department:', error);
    return { count: 0, next: null, previous: null, results: [] };
  }
}; 