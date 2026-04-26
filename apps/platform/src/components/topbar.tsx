import { LogoutButton } from './logout-button'

interface TopbarProps {
  practitionerName: string
  practitionerEmail: string
}

export function Topbar({ practitionerName, practitionerEmail }: TopbarProps) {
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001'
  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-border bg-card px-6">
      <div className="text-sm text-muted-foreground">
        Connecté en tant que{' '}
        <strong className="text-foreground">{practitionerName}</strong>{' '}
        ({practitionerEmail})
      </div>
      <div className="flex items-center gap-3">
        <a
          href={`${adminUrl}/admin`}
          className="rounded-md border border-input bg-card px-3 py-1.5 text-sm font-medium hover:bg-accent"
          target="_blank"
          rel="noopener noreferrer"
        >
          Éditer mon contenu
        </a>
        <LogoutButton />
      </div>
    </header>
  )
}
