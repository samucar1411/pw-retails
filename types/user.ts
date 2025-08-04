export interface Group {
  id: number;
  name: string;
}

export interface Permission {
  id: number;
  name: string;
  codename: string;
  content_type: number;
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  role?: string;
  is_superuser: boolean;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
  groups: Group[];
  user_permissions: Permission[];
}

export interface UserCreateInput {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    is_superuser?: boolean;
    is_staff?: boolean;
    is_active?: boolean;
}

export interface UserUpdateInput {
    username?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    is_superuser?: boolean;
    is_staff?: boolean;
    is_active?: boolean;
} 