'use client'

import { useAuth, useConfig } from '@payloadcms/ui'
import { usePathname } from 'next/navigation'
import { useMemo, type CSSProperties, type ReactNode } from 'react'

/**
 * Custom sidebar that replaces Payload's default `<DefaultNav>`. Reads the
 * full client config via `useConfig()` so collections/globals stay in sync
 * with `payload.config.ts` automatically — no hardcoded list to maintain.
 *
 * Visual goal: a quiet "rail" panel with eyebrow group labels and tight
 * link rows, matching the Aspect-inspired dashboard primitives.
 */

type NavGroup = {
  label: string
  items: NavItem[]
}

type NavItem = {
  href: string
  label: string
  initial: string
}

// Collections/globals we never want shown in the sidebar (Payload internals,
// or system tables that aren't directly editable by practitioners).
const HIDDEN_SLUGS = new Set([
  'payload-preferences',
  'payload-migrations',
  'payload-locked-documents',
])

function resolveLabel(value: unknown, fallback: string): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const v = value as Record<string, unknown>
    if (typeof v.fr === 'string') return v.fr
    if (typeof v.en === 'string') return v.en
  }
  return fallback
}

export function MedSiteNav() {
  const { config } = useConfig()
  const { user, logOut } = useAuth()
  const pathname = usePathname() ?? ''

  const groups = useMemo<NavGroup[]>(() => {
    const buckets = new Map<string, NavItem[]>()

    for (const c of config.collections ?? []) {
      if (HIDDEN_SLUGS.has(c.slug)) continue
      const adminCfg = (c as { admin?: { group?: unknown } }).admin
      const groupLabel = resolveLabel(adminCfg?.group, 'Autres')
      const label = resolveLabel(c.labels?.plural, c.slug)
      const item: NavItem = {
        href: `/admin/collections/${c.slug}`,
        label,
        initial: label.charAt(0).toUpperCase(),
      }
      if (!buckets.has(groupLabel)) buckets.set(groupLabel, [])
      buckets.get(groupLabel)!.push(item)
    }

    for (const g of config.globals ?? []) {
      const adminCfg = (g as { admin?: { group?: unknown } }).admin
      const groupLabel = resolveLabel(adminCfg?.group, 'Autres')
      const label = resolveLabel(g.label, g.slug)
      const item: NavItem = {
        href: `/admin/globals/${g.slug}`,
        label,
        initial: label.charAt(0).toUpperCase(),
      }
      if (!buckets.has(groupLabel)) buckets.set(groupLabel, [])
      buckets.get(groupLabel)!.push(item)
    }

    // Stable order: keep our preferred groups first, then the rest alphabetically.
    const preferred = ['Mon site', 'Système']
    const ordered: NavGroup[] = []
    for (const name of preferred) {
      if (buckets.has(name)) {
        ordered.push({ label: name, items: buckets.get(name)! })
        buckets.delete(name)
      }
    }
    for (const [label, items] of [...buckets.entries()].sort((a, b) =>
      a[0].localeCompare(b[0]),
    )) {
      ordered.push({ label, items })
    }
    return ordered
  }, [config])

  return (
    <aside style={navStyle}>
      <a href="/admin" style={brandStyle}>
        <span style={brandMarkStyle}>M</span>
        <span style={brandTextStyle}>MedSite</span>
      </a>

      <nav style={scrollStyle} aria-label="Navigation principale">
        {groups.map((group) => (
          <Group key={group.label} label={group.label}>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                label={item.label}
                initial={item.initial}
                active={isActive(pathname, item.href)}
              />
            ))}
          </Group>
        ))}
      </nav>

      <footer style={footerStyle}>
        <a href="/" style={publicLinkStyle}>
          <span aria-hidden>↗</span>
          Voir mon site public
        </a>
        {user ? (
          <div style={userBlockStyle}>
            <div style={avatarStyle}>
              {(user.email ?? 'M').charAt(0).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span style={userNameStyle}>
                {(user as { name?: string }).name ?? user.email ?? 'Utilisateur'}
              </span>
              <button
                type="button"
                onClick={() => void logOut()}
                style={logoutButtonStyle}
              >
                Se déconnecter
              </button>
            </div>
          </div>
        ) : null}
      </footer>
    </aside>
  )
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section style={groupStyle}>
      <h3 style={groupLabelStyle}>{label}</h3>
      <ul style={listStyle}>{children}</ul>
    </section>
  )
}

function Link({
  href,
  label,
  initial,
  active,
}: {
  href: string
  label: string
  initial: string
  active: boolean
}) {
  return (
    <li>
      <a href={href} style={linkStyle(active)} aria-current={active ? 'page' : undefined}>
        <span style={linkInitialStyle(active)}>{initial}</span>
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </span>
        {active ? <span aria-hidden style={activeDotStyle} /> : null}
      </a>
    </li>
  )
}

function isActive(pathname: string, href: string): boolean {
  if (pathname === href) return true
  return pathname.startsWith(`${href}/`)
}

// ── Styles ──────────────────────────────────────────────────────

const navStyle: CSSProperties = {
  // Sized by its grid cell — `alignSelf: 'start'` + `height: 100vh` makes
  // the aside fill exactly one viewport height inside the grid row, while
  // `position: sticky` keeps it pinned during scroll. Crucial: this only
  // works when `.template-default` is `display: grid`. The SCSS forces it
  // unconditionally so we never fall back to block flow.
  position: 'sticky',
  top: 0,
  alignSelf: 'start',
  height: '100vh',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--theme-elevation-50)',
  borderRight: '1px solid var(--theme-elevation-100)',
  overflow: 'hidden',
}

const brandStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.625rem',
  padding: '1.25rem 1.25rem 1rem',
  textDecoration: 'none',
  color: 'inherit',
  borderBottom: '1px solid var(--theme-elevation-100)',
}

const brandMarkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  borderRadius: 6,
  background: 'var(--theme-text)',
  color: 'var(--theme-bg)',
  fontWeight: 700,
  fontSize: '0.875rem',
  letterSpacing: '-0.02em',
}

const brandTextStyle: CSSProperties = {
  fontSize: '0.95rem',
  fontWeight: 600,
  letterSpacing: '-0.01em',
  color: 'var(--theme-text)',
}

const scrollStyle: CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  padding: '1rem 0.75rem 1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
}

const groupStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
}

const groupLabelStyle: CSSProperties = {
  margin: '0 0 0.25rem',
  padding: '0 0.625rem',
  fontSize: '0.6875rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 600,
  color: 'var(--theme-elevation-500)',
}

const listStyle: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
}

function linkStyle(active: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.4375rem 0.625rem',
    borderRadius: 6,
    fontSize: '0.875rem',
    fontWeight: active ? 600 : 500,
    color: active ? 'var(--theme-text)' : 'var(--theme-elevation-700)',
    background: active ? 'var(--theme-elevation-150)' : 'transparent',
    textDecoration: 'none',
    transition: 'background 0.12s, color 0.12s',
  }
}

function linkInitialStyle(active: boolean): CSSProperties {
  return {
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    borderRadius: 4,
    fontSize: '0.6875rem',
    fontWeight: 700,
    background: active ? 'var(--theme-text)' : 'var(--theme-elevation-100)',
    color: active ? 'var(--theme-bg)' : 'var(--theme-elevation-600)',
  }
}

const activeDotStyle: CSSProperties = {
  width: 4,
  height: 4,
  borderRadius: '50%',
  background: 'var(--theme-text)',
  flexShrink: 0,
}

const footerStyle: CSSProperties = {
  borderTop: '1px solid var(--theme-elevation-100)',
  padding: '0.875rem 1.25rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
}

const publicLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.375rem',
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: 'var(--theme-elevation-700)',
  textDecoration: 'none',
}

const userBlockStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.625rem',
  paddingTop: '0.625rem',
  borderTop: '1px solid var(--theme-elevation-100)',
}

const avatarStyle: CSSProperties = {
  flexShrink: 0,
  width: 32,
  height: 32,
  borderRadius: '50%',
  background: 'var(--theme-elevation-150)',
  color: 'var(--theme-text)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
  fontSize: '0.875rem',
}

const userNameStyle: CSSProperties = {
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: 'var(--theme-text)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const logoutButtonStyle: CSSProperties = {
  margin: 0,
  padding: 0,
  border: 0,
  background: 'transparent',
  color: 'var(--theme-elevation-500)',
  fontSize: '0.75rem',
  cursor: 'pointer',
  textAlign: 'left',
  font: 'inherit',
  fontWeight: 500,
}
