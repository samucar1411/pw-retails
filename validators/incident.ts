import { z } from "zod";
import { baseEntitySchema } from './common';

// Esquema para un solo sospechoso en el formulario de incidentes (incluye estado temporal)
export const selectedSuspectSchema = z.object({
  apiId: z.string().uuid().optional().nullable(), // ID del sospechoso existente en la BD as UUID string
  alias: z.string().min(1, "El alias es requerido"),
  statusId: z.number().int().positive(),
  description: z.string().optional(), // Removed minimum length validation for incident form context
  image: z.any().optional(), // Accept File, string URL, or null/undefined
  isNew: z.boolean(), // Flag para saber si es nuevo o existente
});

export type SelectedSuspectFormValues = z.infer<typeof selectedSuspectSchema>;

// Esquema para sospechoso tal como viene de la API
export const suspectApiSchema = z.object({
  id: z.string().uuid(),
  Alias: z.string(),
  PhysicalDescription: z.string().optional(),
  PhotoUrl: z.string().optional(),
  Status: z.any().nullable(),
});

export type SuspectApiResponse = z.infer<typeof suspectApiSchema>;

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

export const incidentSchema = z.object({
  id: z.number().int().positive().optional(), // Make id optional for new incidents
  officeId: z.number().int().positive("Debe seleccionar una oficina"),
  date: z.string().min(1, "La fecha es requerida"),
  time: z.string().min(1, "La hora es requerida"),
  incidentTypeId: z.number({
    required_error: "Debe seleccionar un tipo de incidente",
    invalid_type_error: "Debe seleccionar un tipo de incidente válido"
  }).int().positive("Debe seleccionar un tipo de incidente"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres").optional(),
  cashLoss: z.number().min(0).optional(),
  merchandiseLoss: z.number().min(0).optional(),
  otherLosses: z.number().min(0).optional(),
  totalLoss: z.number().min(0).optional(),
  notes: z.string().optional(),
  attachments: z.array(attachmentSchema).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  // Array de IDs de sospechosos para enviar al backend
  suspects: z.array(z.string().uuid()).optional(),
  // Renamed suspects to selectedSuspects for form handling only (not sent to API)
  selectedSuspects: z.array(selectedSuspectSchema).optional(), 
});

export type IncidentFormValues = z.infer<typeof incidentSchema>;

// Schema for the payload sent to create incident API (without selectedSuspects, only suspectIds)
export const incidentPayloadSchema = incidentSchema.omit({ selectedSuspects: true });

export type IncidentPayload = z.infer<typeof incidentPayloadSchema>;

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
  suspects?: string[];
  selectedSuspects?: SelectedSuspectFormValues[];
}

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