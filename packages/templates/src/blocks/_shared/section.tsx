import { cn } from '@medsite/ui'
import type { ReactNode } from 'react'

/**
 * Canonical section wrapper — every block above the fold uses it so vertical
 * rhythm and container width stay consistent across templates.
 */
export function Section({
  children,
  className,
  as = 'section',
  muted = false,
}: {
  children: ReactNode
  className?: string
  as?: 'section' | 'div'
  muted?: boolean
}) {
  const Tag = as
  return (
    <Tag
      className={cn(
        'py-16 md:py-24',
        muted && 'bg-muted text-foreground',
        className,
      )}
    >
      <div className="container">{children}</div>
    </Tag>
  )
}

export function SectionHeader({
  title,
  subtitle,
  align = 'left',
  className,
}: {
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  className?: string
}) {
  return (
    <header
      className={cn(
        'mb-10 max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      <h2 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-muted-foreground mt-4 text-base leading-relaxed md:text-lg">
          {subtitle}
        </p>
      ) : null}
    </header>
  )
}
