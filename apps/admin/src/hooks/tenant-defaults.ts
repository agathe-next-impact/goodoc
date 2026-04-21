import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Injects tenantId from the authenticated user on create.
 * Super-admins can set tenantId explicitly; practitioners inherit theirs.
 */
export const injectTenantId: CollectionBeforeChangeHook = ({
  data,
  operation,
  req: { user },
}) => {
  if (!data) return data
  if (operation !== 'create') return data

  // Super-admins can specify tenantId explicitly
  if (data.tenantId) return data

  if (user?.tenantId) {
    data.tenantId = user.tenantId
  }

  return data
}
