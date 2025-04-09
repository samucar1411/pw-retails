export interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    password?: string;
    is_superuser: boolean;
    is_staff: boolean;
    is_active: boolean;
    date_joined: string;
    last_login: string | null;
    days_since_joined: number;
    groups: number[];
    user_permissions: number[];
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