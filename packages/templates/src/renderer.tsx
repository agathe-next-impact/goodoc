import { getBlock } from './registry'
import type { SectionNode } from './types'

/**
 * Server Component that walks a `pages.content` array and renders each
 * section via its registered block. Unknown or invalid blocks are silently
 * skipped in production; in development they render a visible debug panel
 * so authoring mistakes don't go unnoticed.
 */
export function SectionRenderer({ sections }: { sections: SectionNode[] }) {
  return (
    <>
      {sections.map((section, index) => {
        const key = section.id ?? `${section.blockType}-${index}`
        const def = getBlock(section.blockType)

        if (!def) {
          return process.env.NODE_ENV === 'development' ? (
            <DebugPanel
              key={key}
              tone="warning"
              title={`Unknown block "${section.blockType}"`}
              detail="No block is registered under this type. Did you import the block barrel?"
            />
          ) : null
        }

        const parsed = def.schema.safeParse(section)
        if (!parsed.success) {
          return process.env.NODE_ENV === 'development' ? (
            <DebugPanel
              key={key}
              tone="error"
              title={`Invalid data for block "${section.blockType}"`}
              detail={parsed.error.issues
                .map((i) => `${i.path.join('.')}: ${i.message}`)
                .join(' · ')}
            />
          ) : null
        }

        const Component = def.Component
        return <Component key={key} {...parsed.data} />
      })}
    </>
  )
}

function DebugPanel({
  tone,
  title,
  detail,
}: {
  tone: 'warning' | 'error'
  title: string
  detail: string
}) {
  const color =
    tone === 'error'
      ? 'border-destructive bg-destructive/10 text-destructive'
      : 'border-amber-500 bg-amber-50 text-amber-900'
  return (
    <div className={`${color} my-4 border-l-4 p-4 font-mono text-sm`}>
      <div className="font-semibold">{title}</div>
      <div className="mt-1 opacity-80">{detail}</div>
    </div>
  )
}
