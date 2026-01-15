import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().min(1),

  JWT_SECRET: z.string().min(20),
  JWT_EXPIRES_IN: z.string().default('24h'),

  JWT_REFRESH_SECRET: z.string().min(20),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

export type Env = z.infer<typeof envSchema>;
