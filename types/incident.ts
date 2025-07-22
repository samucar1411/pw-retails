import { File } from './common';
import { Office } from './office';


export type IncidentType = {
  Name: string;
  id: number;
};

export type IncidentItemLosses = {
  ItemType: string;
  Description: string;
  Quantity: number | null;
  UnitPrice: number | null;
  TotalValue: number | null;
  Incident: number | null;
};

export interface IncidentLossItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  type: 'mercaderia' | 'material';
  total: number;
}

export interface Incident {
  id: string; // UUID format
  TransDate: string; // ISO date string with timezone
  Date: string; // Date in YYYY-MM-DD format
  Time: string; // Time in HH:MM:SS format
  Description: string;
  CashLoss: string; // Monetary values come as strings
  MerchandiseLoss: string;
  OtherLosses: string;
  TotalLoss: string;
  Notes: string;
  Attachments: File[]; // Array of attachment objects
  Report: Record<string, unknown> | null; // Report data or null
  Office: number | Office; // Can be either an ID or a full Office object when expanded
  IncidentType: number; // FK to IncidentType
  Suspects: string[]; // Array of suspect IDs
  incidentLossItem: IncidentLossItem[];
}
