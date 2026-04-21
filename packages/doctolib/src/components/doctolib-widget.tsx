'use client'

import { useState } from 'react'
import { cn } from '@medsite/ui'

import { buildDoctolibWidgetUrl } from '../utils'

interface DoctolibWidgetProps {
  slug: string
  className?: string
  minHeight?: number
}

export function DoctolibWidget({
  slug,
  className,
  minHeight = 600,
}: DoctolibWidgetProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const iframeUrl = buildDoctolibWidgetUrl(slug)

  if (error) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-muted/50 p-8',
          className,
        )}
        style={{ minHeight }}
      >
        <p className="text-muted-foreground">
          Le module de prise de rendez-vous n&apos;a pas pu être chargé.
        </p>
        <a
          href={`https://www.doctolib.fr`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          aria-label="Prendre rendez-vous sur Doctolib"
        >
          Prendre rendez-vous sur Doctolib
        </a>
      </div>
    )
  }

  return (
    <div className={cn('relative w-full', className)}>
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse rounded-lg bg-muted"
          style={{ minHeight }}
          aria-hidden="true"
        />
      )}
      <iframe
        src={iframeUrl}
        loading="lazy"
        allow="payment"
        // @ts-expect-error -- React doesn't type allowpaymentrequest but Doctolib requires it for teleconsultation payments
        allowpaymentrequest="true"
        referrerPolicy="no-referrer-when-downgrade"
        title="Prendre rendez-vous sur Doctolib"
        style={{
          width: '100%',
          minHeight,
          border: 'none',
          display: loaded ? 'block' : 'block',
          opacity: loaded ? 1 : 0,
        }}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  )
}
