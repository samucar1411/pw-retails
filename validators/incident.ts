import { z } from "zod";
import { baseEntitySchema } from './common';

// Esquema para un solo sospechoso en el formulario de incidentes (incluye estado temporal)
export const selectedSuspectSchema = z.object({
  apiId: z.number().optional(), // ID del sospechoso existente en la BD
  alias: z.string().min(1, "El alias es requerido"),
  statusId: z.number().int().positive(),
  description: z.string().optional(),
  image: z.any().optional(), // Accept File, string URL, or null/undefined
  isNew: z.boolean(), // Flag para saber si es nuevo o existente
});

export type SelectedSuspectFormValues = z.infer<typeof selectedSuspectSchema>;

export const incidentTypeSchema = baseEntitySchema.extend({
  name: z.string().min(1),
});

// Define a type for attachments
export const attachmentSchema = z.object({
  id: z.number(),
  url: z.string(),
  name: z.string(),
  contentType: z.string(),
});

export const incidentSchema = baseEntitySchema.extend({
  officeId: z.number().int().positive("Debe seleccionar una oficina"),
  date: z.string().min(1, "La fecha es requerida"),
  time: z.string().min(1, "La hora es requerida"),
  incidentTypeId: z.number().int().positive("Debe seleccionar un tipo de incidente"),
  description: z.string().optional(),
  cashLoss: z.number().min(0).optional(),
  merchandiseLoss: z.number().min(0).optional(),
  otherLosses: z.number().min(0).optional(),
  totalLoss: z.number().min(0).optional(),
  notes: z.string().optional(),
  attachments: z.array(attachmentSchema).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  // Renamed suspects to selectedSuspects and use the new schema
  selectedSuspects: z.array(selectedSuspectSchema).optional(), 
});

export type IncidentFormValues = z.infer<typeof incidentSchema>;

// Example type for the incident data returned by API (adjust as necessary)
export interface Incident {
  id: number;
  officeId: number;
  date: string;
  time: string;
  incidentTypeId: number;
  description?: string;
  cashLoss?: number;
  merchandiseLoss?: number;
  otherLosses?: number;
  totalLoss?: number;
  notes?: string;
  attachments?: z.infer<typeof attachmentSchema>[];
  selectedSuspects?: SelectedSuspectFormValues[];
}

// Office options for the form
export const officeOptions = [
  { value: 1, label: 'Sucursal Central' },
  { value: 2, label: 'Sucursal Norte' },
  { value: 3, label: 'Sucursal Sur' },
];

// Tipos de incidentes
export const incidentTypes = [
  { value: 1, label: 'Hurto' },
  { value: 2, label: 'Robo' },
  { value: 3, label: 'Vandalismo' },
  { value: 4, label: 'Otro' },
];

// Estado de sospechosos
export const suspectStatusOptions = [
  { value: 1, label: 'Libre' },
  { value: 2, label: 'Detenido' },
]; 