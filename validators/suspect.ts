import { z } from 'zod';
import { baseEntitySchema } from './common';

export const suspectStatusSchema = baseEntitySchema.extend({
  name: z.string().min(1),
});

export const suspectSchema = baseEntitySchema.extend({
  alias: z.string().min(1),
  statusId: z.number().int().positive(),
  physicalDescription: z.string().optional(),
  photoUrl: z.string().url().optional(),
}); 