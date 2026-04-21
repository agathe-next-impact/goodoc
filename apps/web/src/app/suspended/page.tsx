import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Site temporairement indisponible',
  robots: { index: false, follow: false },
}

export default function SuspendedPage() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center gap-4 py-16 text-center px-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Site temporairement indisponible
      </h1>
      <p className="max-w-md text-muted-foreground">
        Ce site est actuellement suspendu. Si vous êtes le praticien, veuillez
        contacter le support MedSite pour rétablir votre service.
      </p>
    </main>
  )
}
