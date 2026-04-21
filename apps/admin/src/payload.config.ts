import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { postgresAdapter } from '@payloadcms/db-postgres'
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
      afterDashboard: ['@/components/practitioner-dashboard#PractitionerDashboard'],
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
    push: false,
    idType: 'uuid',
    pool: {
      connectionString: databaseUrl,
    },
  }),
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
