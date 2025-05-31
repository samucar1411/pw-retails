import { File } from './common';
import { Suspect } from './suspect';



export type IncidentType = {
  Name: string;
  id: number;
};

export type Incident = {
  // API field names match the actual response
  id: number;
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
  Attachments: File[]; // Array of attachment objects
  Report: Record<string, unknown> | null; // Report data or null
  Suspects: string[]; // Array of suspect IDs
  Latitude?: number; // Latitude for map location
  Longitude?: number; // Longitude for map location
  Address?: string; // Physical address
  
  // For backward compatibility with existing code
  officeId?: number;
  branchId?: number; // Same as Office
  date?: string;
  time?: string;
  incidentTypeId?: number;
  
  // Type safety for error handling
  [key: string]: unknown;
  type?: string; // Type name (e.g., 'hurto', 'robo')
  description?: string;
  cashLoss?: number | string;
  merchandiseLoss?: number | string;
  otherLosses?: number | string;
  totalLoss?: number | string;
  notes?: string;
  attachments?: File[];
  suspects?: Suspect[];
  latitude?: number; // Lowercase version for consistency
  longitude?: number; // Lowercase version for consistency
  address?: string; // Lowercase version for consistency
};
