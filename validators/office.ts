import { z } from 'zod';
import { baseEntitySchema } from './common';

export const countrySchema = baseEntitySchema.extend({
  name: z.string().min(1),
});

export const citySchema = baseEntitySchema.extend({
  name: z.string().min(1),
  countryId: z.number().int().positive(),
});

export const areaSchema = baseEntitySchema.extend({
  name: z.string().min(1),
});

export const officeSchema = baseEntitySchema.extend({
  name: z.string().min(1),
  cityId: z.number().int().positive(),
  areaId: z.number().int().positive(),
}); 