import { z } from 'zod';

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_]).+$/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .trim()
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .regex(
      passwordRegex,
      'Password must contain at least one letter, one number, and one symbol'
    ),
});

export type LoginInput = z.infer<typeof loginSchema>;
