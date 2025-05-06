export interface AdminUser {
  Id?: number;
  OfficeId: number;
  Username: string;
  PasswordHash: string;
  RoleId: number;
}
