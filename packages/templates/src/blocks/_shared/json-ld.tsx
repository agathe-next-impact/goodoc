/**
 * Minimal JSON-LD emitter — intentionally duplicated from `@medsite/seo` so
 * the templates package stays self-contained. Blocks use this to publish
 * their own schema.org node; the tenant layout can still merge these into
 * a global `@graph` for richer cross-references.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
