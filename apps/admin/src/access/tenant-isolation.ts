import type { Access, FieldAccess } from 'payload'

/**
 * Collection-level access: practitioner sees only their tenant's data.
 * Super-admins bypass all restrictions.
 */
export const tenantIsolation: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'super-admin') return true
  if (!user.tenantId) return false
  return { tenantId: { equals: user.tenantId } }
}

/**
 * Read-only access for practitioner fields that are auto-computed.
 */
export const readOnlyForPractitioners: FieldAccess = ({ req: { user } }) => {
  if (!user) return false
  return user.role === 'super-admin'
}

/**
 * Only super-admins can create or delete tenant-scoped records
 * that are managed by onboarding (e.g., practitioners, tenants).
 */
export const superAdminOnly: Access = ({ req: { user } }) => {
  if (!user) return false
  return user.role === 'super-admin'
}

/**
 * Public read access (e.g., media files served to the frontend).
 */
export const publicRead: Access = () => true
