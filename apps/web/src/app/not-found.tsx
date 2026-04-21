import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page introuvable',
  robots: { index: false, follow: false },
}

export default function NotFoundPage() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center gap-4 py-16 text-center px-6">
      <p className="text-sm uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Page introuvable
      </h1>
      <p className="max-w-md text-muted-foreground">
        La page demandée n&apos;existe pas ou a été déplacée.
      </p>
    </main>
  )
}
