import * as z from 'zod';

export const departmentSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50),
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  description: z.string().max(255).optional().nullable(),
});
