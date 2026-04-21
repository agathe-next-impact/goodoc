import type { CollectionBeforeChangeHook } from 'payload'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Auto-generates a slug from the title field when creating a new document.
 * Does not override existing slugs on update.
 */
export const autoSlugFromTitle: CollectionBeforeChangeHook = ({
  data,
  operation,
}) => {
  if (!data?.title) return data
  if (operation === 'update' && data.slug) return data

  data.slug = slugify(data.title)

  return data
}
