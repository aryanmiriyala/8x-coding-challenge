import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_URL_UNPOOLED: z.string().min(1, 'DATABASE_URL_UNPOOLED is required'),
  NEON_AUTH_BASE_URL: z.string().url('NEON_AUTH_BASE_URL must be a valid URL'),
  NEON_AUTH_COOKIE_SECRET: z.string().min(32, 'NEON_AUTH_COOKIE_SECRET must be at least 32 characters'),
});

const isTest = process.env.NODE_ENV === 'test';

// In test environments, supply mock values if real ones are missing so typings stay strong.
const mockEnv = {
  DATABASE_URL: 'postgresql://mock:mock@localhost/mock',
  DATABASE_URL_UNPOOLED: 'postgresql://mock:mock@localhost/mock',
  NEON_AUTH_BASE_URL: 'https://mock.neonauth.com',
  NEON_AUTH_COOKIE_SECRET: '12345678901234567890123456789012',
};

const parseResult = envSchema.safeParse(
  isTest ? { ...mockEnv, ...process.env } : process.env
);

if (!parseResult.success) {
  if (!isTest) {
    console.error('❌ Invalid environment variables:', parseResult.error.format());
    process.exit(1);
  } else {
    throw new Error('Invalid environment variables in test: ' + parseResult.error.message);
  }
}

export const env = parseResult.data;
