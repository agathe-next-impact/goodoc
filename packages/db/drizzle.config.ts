import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Config } from 'drizzle-kit'

// Load env from the monorepo root (drizzle-kit doesn't do this on its own).
const rootEnv = resolve(__dirname, '../../.env.local')
if (existsSync(rootEnv)) {
  process.loadEnvFile(rootEnv)
}

// Fallback placeholder so `drizzle-kit generate` works without a live DB.
// `migrate` / `push` / `studio` still require a real DATABASE_URL.
const databaseUrl =
  process.env.DATABASE_URL ?? 'postgresql://build:build@localhost:5432/build'

export default {
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
} satisfies Config
