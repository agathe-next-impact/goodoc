import Link from 'next/link'

const NAV = [
  { href: '/', label: 'Tableau de bord' },
  { href: '/messages', label: 'Messages' },
  { href: '/abonnement', label: 'Abonnement' },
  { href: '/parametres', label: 'Paramètres' },
  { href: '/support', label: 'Support' },
] as const

export function Sidebar() {
  return (
    <nav
      aria-label="Navigation principale"
      className="flex w-64 shrink-0 flex-col gap-1 border-r border-border bg-card p-4"
    >
      <div className="px-3 pb-4">
        <span className="text-lg font-semibold tracking-tight">MedSite</span>
      </div>
      <ul className="flex flex-col gap-1">
        {NAV.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
