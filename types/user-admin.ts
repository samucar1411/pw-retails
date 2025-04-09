export interface UserAdminUser {
  username: string;
  email: string;
  is_active: boolean;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}

export interface UserAdmin {
  id: number;
  user: UserAdminUser;
  sub: boolean;
  sub_startdate: string;
  sub_enddate: string;
  job_position: string;
  role: string;
  contact: string | null;
  company: number;
  country: number;
}

export interface UserAdminCreateInput extends Omit<UserAdmin, 'id'> {}

export interface UserAdminUpdateInput extends Partial<Omit<UserAdmin, 'id'>> {}

export type CreateUserAdminDTO = Omit<UserAdmin, 'id'>;
export type UpdateUserAdminDTO = Partial<CreateUserAdminDTO>; 