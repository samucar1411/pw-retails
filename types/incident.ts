import { BaseEntity, File } from './common';

export type IncidentType = BaseEntity & {
  name: string;
};

export type Incident = BaseEntity & {
  // API field names match the actual response
  Office: number; // Office ID
  Date: string; // Date in YYYY-MM-DD format
  Time: string; // Time in HH:MM:SS format
  IncidentType: number; // FK to IncidentType
  Description: string;
  CashLoss: string; // Monetary values come as strings
  MerchandiseLoss: string;
  OtherLosses: string;
  TotalLoss: string;
  Notes: string;
  Attachments: any[]; // Array of attachment IDs or objects
  Report: any | null; // Report data or null
  Suspects: string[]; // Array of suspect IDs
  
  // For backward compatibility with existing code
  officeId?: number;
  date?: string;
  time?: string;
  incidentTypeId?: number;
  description?: string;
  cashLoss?: number | string;
  merchandiseLoss?: number | string;
  otherLosses?: number | string;
  totalLoss?: number | string;
  notes?: string;
  attachments?: File[];
  suspects?: any[];
};
