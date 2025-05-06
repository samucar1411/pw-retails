import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types/admin-user';
import { getAdminUsers, createAdminUser } from '../services/admin-user-service';

interface AdminUserContextType {
  adminUsers: AdminUser[];
  fetchAdminUsers: () => Promise<void>;
  addAdminUser: (user: AdminUser) => Promise<void>;
}

const AdminUserContext = createContext<AdminUserContextType | undefined>(undefined);

export const useAdminUserContext = () => {
  const ctx = useContext(AdminUserContext);
  if (!ctx) throw new Error('useAdminUserContext must be used within AdminUserProvider');
  return ctx;
};

export const AdminUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  const fetchAdminUsers = async () => {
    setAdminUsers(await getAdminUsers());
  };

  const addAdminUser = async (user: AdminUser) => {
    await createAdminUser(user);
    await fetchAdminUsers();
  };

  useEffect(() => { fetchAdminUsers(); }, []);

  return (
    <AdminUserContext.Provider value={{ adminUsers, fetchAdminUsers, addAdminUser }}>
      {children}
    </AdminUserContext.Provider>
  );
};
