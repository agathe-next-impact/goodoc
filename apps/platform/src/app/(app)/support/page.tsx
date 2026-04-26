import { SupportForm } from './support-form'

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Support</h1>
        <p className="text-sm text-muted-foreground">
          Une question, un bug, une demande spécifique ? Notre équipe vous
          répond sous un jour ouvré.
        </p>
      </header>
      <SupportForm />
    </div>
  )
}
