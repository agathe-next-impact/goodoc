import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

import { practitioners } from './practitioners'
import { tenants } from './tenants'

export const blogPosts = pgTable(
  'blog_posts',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 300 }).notNull(),
    slug: varchar('slug', { length: 300 }).notNull(),
    excerpt: varchar('excerpt', { length: 500 }),
    content: jsonb('content').$type<unknown[]>(),
    coverImageUrl: varchar('cover_image_url', { length: 500 }),
    category: varchar('category', { length: 100 }),
    tags: text('tags').array(),
    authorId: uuid('author_id').references(() => practitioners.id, {
      onDelete: 'set null',
    }),
    isPublished: boolean('is_published').notNull().default(false),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    metaTitle: varchar('meta_title', { length: 200 }),
    metaDescription: varchar('meta_description', { length: 300 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('blog_posts_tenant_idx').on(t.tenantId),
    index('blog_posts_slug_idx').on(t.slug),
    index('blog_posts_published_idx').on(t.isPublished),
  ],
)

export type BlogPost = typeof blogPosts.$inferSelect
export type NewBlogPost = typeof blogPosts.$inferInsert
