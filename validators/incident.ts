import { z } from "zod";
import { baseEntitySchema } from './common';

// Custom validation function for monetary fields
const monetaryFieldSchema = () => z.union([z.string(), z.number()])
  .optional()
  .transform((val) => {
    if (typeof val === 'string') return Number(val) || 0;
    if (typeof val === 'number') return val;
    return 0;
  })
  .refine((val) => {
    // Check that there are no more than 10 digits before the decimal point
    const numStr = val.toString();
    const [integerPart] = numStr.split('.');
    return integerPart.length <= 10;
  }, {
    message: "Ensure that there are no more than 10 digits before the decimal point."
  });

// Esquema para un solo sospechoso en el formulario de incidentes (incluye estado temporal)
export const selectedSuspectSchema = z.object({
  apiId: z.string().uuid().optional().nullable(), // ID del sospechoso existente en la BD as UUID string
  alias: z.string().min(1, "El alias es requerido"),
  statusId: z.number().int().positive(),
  notes: z.string().optional(), // Observaciones adicionales = Descripción física
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

export const incidentLossItemSchema = z.object({
  id: z.number().optional(),
  description: z.string().optional(),
  quantity: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (!val) return 0;
    const num = typeof val === 'string' ? Number(val) : val;
    return num;
  }),
  unitPrice: monetaryFieldSchema(),
  type: z.enum(['mercaderia', 'material']),
  total: monetaryFieldSchema(),
});

export type IncidentLossItem = z.infer<typeof incidentLossItemSchema>;

// Schema for form validation (accepts strings for number fields)
export const incidentFormSchema = z.object({
  id: z.number().int().positive().optional(),
  officeId: z.number().int().positive("Debe seleccionar una oficina"),
  date: z.string().min(1, "La fecha es requerida"),
  time: z.string().min(1, "La hora es requerida"),
  incidentTypeId: z.number({
    required_error: "Debe seleccionar un tipo de incidente",
    invalid_type_error: "Debe seleccionar un tipo de incidente válido"
  }).int().positive("Debe seleccionar un tipo de incidente"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  cashLoss: monetaryFieldSchema(),
  cashFondo: monetaryFieldSchema(),
  cashRecaudacion: monetaryFieldSchema(),
  merchandiseLoss: monetaryFieldSchema(),
  otherLosses: monetaryFieldSchema(),
  totalLoss: monetaryFieldSchema(),
  notes: z.string().optional(),
  attachments: z.array(attachmentSchema).optional(),
  incidentImages: z.array(attachmentSchema).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  suspects: z.array(z.string().uuid()).optional(),
  selectedSuspects: z.array(selectedSuspectSchema).optional(),
  incidentLossItem: z.array(incidentLossItemSchema).default([]),
});

// Schema for API payload (transforms strings to numbers)
export const incidentSchema = incidentFormSchema.transform((data) => ({
  ...data,
  cashLoss: data.cashLoss ? Number(data.cashLoss) : 0,
  cashFondo: data.cashFondo ? Number(data.cashFondo) : 0,
  cashRecaudacion: data.cashRecaudacion ? Number(data.cashRecaudacion) : 0,
  merchandiseLoss: data.merchandiseLoss ? Number(data.merchandiseLoss) : 0,
  otherLosses: data.otherLosses ? Number(data.otherLosses) : 0,
  totalLoss: data.totalLoss ? Number(data.totalLoss) : 0,
}));

export type IncidentFormValues = z.infer<typeof incidentFormSchema>;

// Schema for the payload sent to create incident API (without selectedSuspects, only suspectIds)
export const incidentPayloadSchema = incidentFormSchema.omit({ selectedSuspects: true }).transform((data) => ({
  ...data,
  cashLoss: data.cashLoss ? Number(data.cashLoss) : 0,
  cashFondo: data.cashFondo ? Number(data.cashFondo) : 0,
  cashRecaudacion: data.cashRecaudacion ? Number(data.cashRecaudacion) : 0,
  merchandiseLoss: data.merchandiseLoss ? Number(data.merchandiseLoss) : 0,
  otherLosses: data.otherLosses ? Number(data.otherLosses) : 0,
  totalLoss: data.totalLoss ? Number(data.totalLoss) : 0,
}));

export type IncidentPayload = z.infer<typeof incidentPayloadSchema>;

// Example type for the incident data returned by API (adjust as necessary)
export interface Incident {
  id: number;
  officeId: number;
  date: string;
  time: string;
  incidentTypeId: number;
  description?: string;
  cashLoss?: string;
  cashFondo?: string;
  cashRecaudacion?: string;
  merchandiseLoss?: string;
  otherLosses?: string;
  totalLoss?: string;
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