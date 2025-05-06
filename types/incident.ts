import { BaseEntity, File } from './common';

export type IncidentType = BaseEntity & {
  name: string;
};

export type Incident = BaseEntity & {
  officeId: number; // FK to Office
  date: string; // ISO string
  time: string; // ISO string
  incidentTypeId: number; // FK to IncidentType
  description?: string;
  cashLoss?: number;
  merchandiseLoss?: number;
  otherLosses?: number;
  totalLoss?: number;
  notes?: string;
  attachments?: File[];
  latitude?: number; // Latitude coordinate
  longitude?: number; // Longitude coordinate
  suspects?: {
    alias?: string;
    status?: string;
    description?: string;
    image?: File;
  }[];
};