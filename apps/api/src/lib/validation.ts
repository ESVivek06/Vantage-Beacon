import { z } from 'zod';
import { badInput } from './errors';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1, 'Display name is required').max(100),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(2000).optional(),
  skills: z.array(z.string().max(50)).max(30).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional(),
  requiredSkills: z.array(z.string().max(50)).max(20),
});

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const messages = result.error.errors.map((e) => e.message).join('; ');
    throw badInput(messages);
  }
  return result.data;
}
