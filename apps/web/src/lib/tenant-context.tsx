'use client'

import { createContext, useContext, type ReactNode } from 'react'

import type { Tenant } from './tenant-types'

const TenantContext = createContext<Tenant | null>(null)

export function TenantProvider({
  value,
  children,
}: {
  value: Tenant
  children: ReactNode
}) {
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

/**
 * Client hook — returns the tenant context set by the tenant layout.
 * Throws a clear error if used outside `<TenantProvider>`, which would
 * mean the caller is rendered on a non-tenant route.
 */
export function useTenant(): Tenant {
  const value = useContext(TenantContext)
  if (!value) {
    throw new Error('useTenant() must be used inside a <TenantProvider>')
  }
  return value
}
