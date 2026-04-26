import type { Metadata } from 'next'

import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Connexion — MedSite',
}

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, error } = await searchParams
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight">Connexion</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accédez à votre espace praticien.
        </p>
        <LoginForm next={next} initialError={error} />
      </div>
    </main>
  )
}
