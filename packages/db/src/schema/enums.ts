import { pgEnum } from 'drizzle-orm/pg-core'

export const tenantStatusEnum = pgEnum('tenant_status', [
  'trial',
  'active',
  'suspended',
  'cancelled',
])

export const bookingModeEnum = pgEnum('booking_mode', [
  'doctolib',
  'alternative',
  'contact',
])

export const pageTypeEnum = pgEnum('page_type', [
  'home',
  'about',
  'contact',
  'services',
  'blog_index',
  'legal',
  'custom',
])

export const messageStatusEnum = pgEnum('message_status', [
  'new',
  'read',
  'replied',
  'archived',
])
