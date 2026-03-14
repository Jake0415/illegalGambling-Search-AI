import { z } from 'zod'

// ──────────────────────────────────────
// Server-side environment variables
// ──────────────────────────────────────
const serverEnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),

  // Authentication (NextAuth.js v5)
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  AUTH_TRUST_HOST: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),

  // Storage (MinIO / S3)
  S3_ENDPOINT: z.string().url().optional(),
  S3_ACCESS_KEY: z.string().min(1).optional(),
  S3_SECRET_KEY: z.string().min(1).optional(),
  S3_BUCKET: z.string().min(1).optional(),
  S3_REGION: z.string().min(1).optional(),

  // Claude AI API
  ANTHROPIC_API_KEY: z.string().min(1).optional(),

  // SMS Verification Services
  PVAPINS_API_KEY: z.string().optional(),
  GRIZZLYSMS_API_KEY: z.string().optional(),
  SMS_ACTIVATE_API_KEY: z.string().optional(),

  // CAPTCHA Solver
  CAPSOLVER_API_KEY: z.string().optional(),
  TWOCAPTCHA_API_KEY: z.string().optional(),

  // Proxy
  PROXY_HOST: z.string().optional(),
  PROXY_PORT: z
    .string()
    .transform((v) => (v ? Number(v) : undefined))
    .optional(),
  PROXY_USERNAME: z.string().optional(),
  PROXY_PASSWORD: z.string().optional(),

  // Google Custom Search
  GOOGLE_SEARCH_API_KEY: z.string().optional(),
  GOOGLE_SEARCH_CX: z.string().optional(),

  // Email SMTP
  SMTP_SERVER: z.string().optional(),
  SMTP_PORT: z
    .string()
    .transform((v) => (v ? Number(v) : undefined))
    .optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_TO: z.string().optional(),

  // Slack
  SLACK_BOT_TOKEN: z.string().optional(),
  SLACK_CHANNEL: z.string().optional(),
  SLACK_BOT_USER_ID: z.string().optional(),
  SLACK_TARGET_USER_ID: z.string().optional(),
  SLACK_WEBHOOK_URL: z.string().url().optional(),

  // Application
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  VERCEL_URL: z.string().optional(),
})

// ──────────────────────────────────────
// Client-side environment variables (NEXT_PUBLIC_*)
// ──────────────────────────────────────
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
})

// ──────────────────────────────────────
// Parse & export
// ──────────────────────────────────────

function parseServerEnv() {
  const result = serverEnvSchema.safeParse(process.env)
  if (!result.success) {
    console.error(
      '[env] Server environment validation failed:',
      result.error.format(),
    )
    throw new Error('Invalid server environment variables')
  }
  return result.data
}

function parseClientEnv() {
  const result = clientEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  })
  if (!result.success) {
    console.error(
      '[env] Client environment validation failed:',
      result.error.format(),
    )
    throw new Error('Invalid client environment variables')
  }
  return result.data
}

/**
 * Server-side environment variables.
 * Only import this in server components, API routes, or server actions.
 */
export const serverEnv = parseServerEnv()

/**
 * Client-safe environment variables (NEXT_PUBLIC_* only).
 * Safe to import anywhere.
 */
export const clientEnv = parseClientEnv()

export type ServerEnv = z.infer<typeof serverEnvSchema>
export type ClientEnv = z.infer<typeof clientEnvSchema>
