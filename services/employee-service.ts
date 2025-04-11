import { getResource, createResource, updateResource, deleteResource, getResourceWithParams } from './api';

const ENDPOINT = '/api/employees';

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  department: string;
  hire_date: string;
  status: 'active' | 'inactive';
}

type EmployeeCreateInput = Omit<Employee, 'id'>;

export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await getResource<Employee[]>(ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
};

export const getEmployeeById = async (id: string): Promise<Employee | null> => {
  try {
    const response = await getResource<Employee>(ENDPOINT, id);
    return response.data;
  } catch (error) {
    console.error('Error fetching employee:', error);
    return null;
  }
};

export const createEmployee = async (data: EmployeeCreateInput): Promise<Employee | null> => {
  try {
    const response = await createResource<Employee>(ENDPOINT, data);
    return response.data;
  } catch (error) {
    console.error('Error creating employee:', error);
    return null;
  }
};

export const updateEmployee = async (id: string, data: Partial<Employee>): Promise<Employee | null> => {
  try {
    const response = await updateResource<Employee>(ENDPOINT, id, data);
    return response.data;
  } catch (error) {
    console.error('Error updating employee:', error);
    return null;
  }
};

export const deleteEmployee = async (id: string): Promise<boolean> => {
  try {
    await deleteResource(ENDPOINT, id);
    return true;
  } catch (error) {
    console.error('Error deleting employee:', error);
    return false;
  }
};

// Funciones específicas del servicio de empleados
export const getActiveEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await getResourceWithParams<Employee[]>(ENDPOINT, { status: 'active' });
    return response.data;
  } catch (error) {
    console.error('Error fetching active employees:', error);
    return [];
  }
};

export const getEmployeesByDepartment = async (department: string): Promise<Employee[]> => {
  try {
    const response = await getResourceWithParams<Employee[]>(ENDPOINT, { department });
    return response.data;
  } catch (error) {
    console.error('Error fetching employees by department:', error);
    return [];
  }
}; 