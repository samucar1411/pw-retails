import { AdminUser } from '../types/admin-user';

const API_URL = '/api/admins/';

export async function getAdminUsers(): Promise<AdminUser[]> {
  const res = await fetch(API_URL);
  const data = await res.json();
  return data.results;
}

export async function createAdminUser(user: AdminUser): Promise<AdminUser> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  return res.json();
}

// Add update/delete as needed using PascalCase fields
