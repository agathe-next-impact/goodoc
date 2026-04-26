import type { ReactNode } from 'react'

import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { getPractitionerSession } from '@/lib/get-tenant'

export default async function AppLayout({
  children,
}: {
  children: ReactNode
}) {
  const { user } = await getPractitionerSession()
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar
          practitionerName={user.name ?? user.email}
          practitionerEmail={user.email}
        />
        <main className="flex-1 p-6">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
