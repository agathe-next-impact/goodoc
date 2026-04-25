import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Addresses } from './collections/Addresses'
import { BlogPosts } from './collections/BlogPosts'
import { ContactMessages } from './collections/ContactMessages'
import { FaqItems } from './collections/FaqItems'
import { Media } from './collections/Media'
import { OpeningHours } from './collections/OpeningHours'
import { Pages } from './collections/Pages'
import { Practitioners } from './collections/Practitioners'
import { Services } from './collections/Services'
import { Testimonials } from './collections/Testimonials'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// NOTE: during `next build` env vars may be absent — fall back to
// clearly-invalid placeholders so the build doesn't crash while collecting
// page data. Runtime will still fail fast on the first real request
// since the connection string won't resolve.
const databaseUrl =
  process.env.DATABASE_URL ?? 'postgresql://build:build@localhost:5432/build'
const payloadSecret =
  process.env.PAYLOAD_SECRET ?? 'build-time-placeholder-secret-change-me-please'
const resendApiKey = process.env.RESEND_API_KEY

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      title: 'MedSite — Gérer mon site',
      description: 'Back-office de gestion de votre site professionnel',
      titleSuffix: ' — MedSite',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Logo: '@/components/brand/logo#Logo',
        Icon: '@/components/brand/icon#Icon',
      },
      Nav: '@/components/nav/medsite-nav#MedSiteNav',
      providers: ['@/components/tenant-palette#TenantPalette'],
      afterDashboard: [
        '@/components/practitioner-dashboard#PractitionerDashboard',
        '@/components/template-gallery#TemplateGallery',
      ],
    },
  },
  collections: [
    Users,
    Practitioners,
    Services,
    Pages,
    BlogPosts,
    FaqItems,
    Testimonials,
    ContactMessages,
    Addresses,
    OpeningHours,
    Media,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    // Dev only: let Payload auto-sync its internal tables (versions,
    // payload-locked-documents, payload-preferences, payload-migrations).
    // Required because our Drizzle schema in @medsite/db doesn't include
    // these — Payload manages them via its own adapter. In production
    // we'll generate proper migrations with `payload migrate:create`.
    // TEMP: disabled — schema diverges and the interactive prompt blocks
    // boot in non-TTY contexts. Re-enable once enums are reconciled.
    push: false,
    idType: 'uuid',
    pool: {
      connectionString: databaseUrl,
    },
  }),
  email: resendApiKey
    ? resendAdapter({
        defaultFromAddress: 'noreply@medsite.fr',
        defaultFromName: 'MedSite',
        apiKey: resendApiKey,
      })
    : undefined,
  sharp,
  plugins: [
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
        },
      },
      bucket: process.env.CLOUDFLARE_R2_BUCKET ?? '',
      config: {
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY ?? '',
          secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY ?? '',
        },
        region: 'auto',
        endpoint: process.env.CLOUDFLARE_R2_ENDPOINT ?? '',
      },
    }),
  ],
})
