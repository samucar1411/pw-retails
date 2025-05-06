import { z } from 'zod';

export const baseEntitySchema = z.object({
  id: z.number().int().positive(),
});

export const fileSchema = z.object({
  id: z.number().int().positive(),
  url: z.string().url(),
  name: z.string(),
  contentType: z.string(),
});

export const statusSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
}); 