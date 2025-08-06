// services/incident-item-losses-service.ts
import { api } from './api';

export interface IncidentItemLoss {
  id?: number;
  ItemType: string;
  Description?: string;
  Quantity: number | null;
  UnitPrice: number | null;
  TotalValue: number | null;
  Incident: number | null;
}

export async function getIncidentItemLosses(): Promise<IncidentItemLoss[]> {
  const { data } = await api.get<{ results: IncidentItemLoss[] }>(
    '/api/incidentItemLosses/'
  );
  return data.results;
}

export async function getIncidentItemLoss(id: number): Promise<IncidentItemLoss> {
  const { data } = await api.get<IncidentItemLoss>(`/api/incidentItemLosses/${id}/`);
  return data;
}

export async function createIncidentItemLoss(payload: Omit<IncidentItemLoss, 'id'>): Promise<IncidentItemLoss> {
  const { data } = await api.post<IncidentItemLoss>(
    '/api/incidentItemLosses/',
    payload
  );
  return data;
}

export async function updateIncidentItemLoss(id: number, payload: Partial<IncidentItemLoss>): Promise<IncidentItemLoss> {
  const { data } = await api.patch<IncidentItemLoss>(
    `/api/incidentItemLosses/${id}/`,
    payload
  );
  return data;
}

export async function deleteIncidentItemLoss(id: number): Promise<void> {
  await api.delete(`/api/incidentItemLosses/${id}/`);
} 