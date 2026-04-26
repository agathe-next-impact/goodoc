'use client'

import { useState } from 'react'

export function LogoutButton() {
  const [pending, setPending] = useState(false)
  return (
    <form
      action="/api/auth/logout"
      method="POST"
      onSubmit={() => setPending(true)}
    >
      <button
        type="submit"
        className="rounded-md bg-secondary px-3 py-1.5 text-sm font-medium hover:bg-secondary/80 disabled:opacity-50"
        disabled={pending}
      >
        {pending ? 'Déconnexion…' : 'Se déconnecter'}
      </button>
    </form>
  )
}
