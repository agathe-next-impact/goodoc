import { z } from 'zod'

/**
 * Environment variables schema.
 * Validated at app startup — if any value is missing or invalid,
 * the process will exit with a clear error message listing every issue.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Public URL
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().url(),

  // Payload CMS
  PAYLOAD_SECRET: z.string().min(32, 'PAYLOAD_SECRET must be at least 32 characters long'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),

  // Resend
  RESEND_API_KEY: z.string().startsWith('re_'),

  // Plausible (optional — present only in production)
  PLAUSIBLE_API_KEY: z.string().optional(),

  // Cloudflare R2
  CLOUDFLARE_R2_ACCESS_KEY: z.string().min(1),
  CLOUDFLARE_R2_SECRET_KEY: z.string().min(1),
  CLOUDFLARE_R2_BUCKET: z.string().min(1),
  CLOUDFLARE_R2_ENDPOINT: z.string().url(),
  CLOUDFLARE_R2_PUBLIC_URL: z.string().url(),

  // CRON
  CRON_SECRET: z.string().min(1).optional(),
})

export type Env = z.infer<typeof envSchema>

/**
 * Parses and validates `process.env`. Throws a formatted error listing
 * every missing / invalid variable.
 *
 * Call this explicitly at app startup — do NOT auto-run at module load
 * time, or tools like `next build` / `tsc` will fail when env vars are
 * absent from the build environment.
 */
export function parseEnv(source: typeof process.env = process.env): Env {
  const result = envSchema.safeParse(source)
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')
    throw new Error(`Invalid environment variables:\n${issues}`)
  }
  return result.data
}

/**
 * Lazily-validated environment — validated on first property access so
 * that build tools that don't actually read env vars don't blow up.
 */
let cachedEnv: Env | undefined
export const env: Env = new Proxy({} as Env, {
  get(_target, key) {
    if (!cachedEnv) cachedEnv = parseEnv()
    return cachedEnv[key as keyof Env]
  },
})
