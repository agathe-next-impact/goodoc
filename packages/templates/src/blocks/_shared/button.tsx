import { cn } from '@medsite/ui'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-ring',
  outline:
    'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring',
  ghost:
    'text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50'

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  external = false,
  className,
  'aria-label': ariaLabel,
}: {
  href: string
  children: ReactNode
  variant?: Variant
  size?: Size
  external?: boolean
  className?: string
  'aria-label'?: string
}) {
  const rel = external ? 'noopener noreferrer' : undefined
  const target = external ? '_blank' : undefined
  return (
    <a
      href={href}
      rel={rel}
      target={target}
      aria-label={ariaLabel}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
    >
      {children}
    </a>
  )
}
