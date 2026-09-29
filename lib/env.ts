import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_URL_UNPOOLED: z.string().min(1, 'DATABASE_URL_UNPOOLED is required'),
  NEON_AUTH_BASE_URL: z.string().url('NEON_AUTH_BASE_URL must be a valid URL'),
  NEON_AUTH_COOKIE_SECRET: z.string().min(32, 'NEON_AUTH_COOKIE_SECRET must be at least 32 characters'),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:', parseResult.error.format());
  // Do not crash in test environment to allow isolated tests
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
}

export const env = parseResult.success ? parseResult.data : ({} as any);
