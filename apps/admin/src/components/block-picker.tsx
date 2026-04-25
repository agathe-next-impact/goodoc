'use client'

import {
  BLOCK_CATEGORY_LABELS,
  BLOCK_PICKER_ENTRIES,
  type BlockCategory,
  type BlockPickerEntry,
} from '@medsite/templates/picker'
import {
  Modal,
  useField,
  useForm,
  useModal,
} from '@payloadcms/ui'
import { useMemo, type CSSProperties } from 'react'

/**
 * Custom UI field rendered above the `content` blocks field on the Pages
 * collection. Opens a modal gallery of every registered block, each preview
 * tinted to the tenant palette via CSS custom properties injected at the
 * admin shell level. Selecting a card calls Payload's `addFieldRow` to
 * append the chosen block (with sensible default values) to `content`.
 *
 * The picker is path-relative: it derives the target `content` field path
 * by swapping the UI field's last path segment, so it survives being
 * re-grouped under tabs/rows without changes here.
 */

const MODAL_SLUG = 'medsite-block-picker'

type Props = {
  path?: string
  schemaPath?: string
}

export function BlockPicker(props: Props) {
  const path = props.path ?? 'blockPicker'
  const schemaPath = props.schemaPath ?? path
  const contentPath = useMemo(() => swapLastSegment(path, 'content'), [path])
  const contentSchemaPath = useMemo(
    () => swapLastSegment(schemaPath, 'content'),
    [schemaPath],
  )

  const { rows } = useField<unknown>({ path: contentPath })
  const { addFieldRow } = useForm()
  const { openModal, closeModal } = useModal()

  const grouped = useMemo(() => groupByCategory(BLOCK_PICKER_ENTRIES), [])

  function insert(blockType: string) {
    const rowIndex = rows?.length ?? 0
    addFieldRow({
      blockType,
      path: contentPath,
      rowIndex,
      schemaPath: contentSchemaPath,
    })
    closeModal(MODAL_SLUG)
  }

  return (
    <>
      <div style={triggerWrapStyle}>
        <button
          type="button"
          onClick={() => openModal(MODAL_SLUG)}
          style={triggerButtonStyle}
        >
          <span aria-hidden style={{ fontSize: 16, lineHeight: 1 }}>
            +
          </span>
          Insérer un bloc
        </button>
        <p style={triggerHintStyle}>
          Choisissez un bloc dans la galerie. L’aperçu utilise vos couleurs.
        </p>
      </div>

      <Modal slug={MODAL_SLUG} className="medsite-block-picker-modal">
        <div style={modalShellStyle}>
          <header style={modalHeaderStyle}>
            <div>
              <h2 style={modalTitleStyle}>Galerie de blocs</h2>
              <p style={modalSubtitleStyle}>
                Cliquez sur un bloc pour l’ajouter à la fin de la page. Vous
                pourrez ensuite modifier son contenu.
              </p>
            </div>
            <button
              type="button"
              onClick={() => closeModal(MODAL_SLUG)}
              style={closeButtonStyle}
              aria-label="Fermer la galerie"
            >
              ×
            </button>
          </header>

          <div style={modalBodyStyle}>
            {grouped.map(({ category, entries }) => (
              <section key={category} style={categorySectionStyle}>
                <h3 style={categoryTitleStyle}>
                  {BLOCK_CATEGORY_LABELS[category]}
                </h3>
                <div style={cardGridStyle}>
                  {entries.map((entry) => (
                    <BlockCard
                      key={entry.blockType}
                      entry={entry}
                      onInsert={() => insert(entry.blockType)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </Modal>
    </>
  )
}

function BlockCard({
  entry,
  onInsert,
}: {
  entry: BlockPickerEntry
  onInsert: () => void
}) {
  const { Preview } = entry
  return (
    <button type="button" onClick={onInsert} style={cardButtonStyle}>
      <div className="medsite-palette-scope" style={previewSurfaceStyle}>
        <Preview />
      </div>
      <div style={cardBodyStyle}>
        <span style={cardLabelStyle}>{entry.label}</span>
        <span style={cardDescStyle}>{entry.description}</span>
      </div>
    </button>
  )
}

// ─── helpers ────────────────────────────────────────────────────────────────

function swapLastSegment(path: string, replacement: string): string {
  const idx = path.lastIndexOf('.')
  return idx === -1 ? replacement : `${path.slice(0, idx)}.${replacement}`
}

function groupByCategory(
  entries: readonly BlockPickerEntry[],
): Array<{ category: BlockCategory; entries: BlockPickerEntry[] }> {
  const order: BlockCategory[] = [
    'hero',
    'content',
    'social-proof',
    'conversion',
    'utility',
  ]
  const map = new Map<BlockCategory, BlockPickerEntry[]>()
  for (const entry of entries) {
    const list = map.get(entry.category) ?? []
    list.push(entry)
    map.set(entry.category, list)
  }
  return order
    .filter((c) => map.has(c))
    .map((c) => ({ category: c, entries: map.get(c)! }))
}

// ─── styles ─────────────────────────────────────────────────────────────────

const triggerWrapStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '1rem 1.25rem',
  background: 'var(--theme-elevation-50)',
  border: '1px dashed var(--theme-elevation-200)',
  borderRadius: '8px',
  marginBottom: '1.5rem',
  flexWrap: 'wrap',
}

const triggerButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 1.125rem',
  background: 'var(--theme-text)',
  color: 'var(--theme-bg)',
  border: '1px solid var(--theme-text)',
  borderRadius: '6px',
  fontWeight: 600,
  fontSize: '0.875rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

const triggerHintStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.8125rem',
  opacity: 0.65,
}

const modalShellStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--theme-bg)',
  color: 'var(--theme-text)',
  width: 'min(1080px, 92vw)',
  maxHeight: '85vh',
  borderRadius: '10px',
  overflow: 'hidden',
  boxShadow: '0 24px 60px -20px rgba(0,0,0,0.35)',
}

const modalHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '1.5rem',
  padding: '1.5rem 1.75rem 1.25rem',
  borderBottom: '1px solid var(--theme-elevation-100)',
}

const modalTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1.25rem',
  fontWeight: 600,
  letterSpacing: '-0.01em',
}

const modalSubtitleStyle: CSSProperties = {
  margin: '0.375rem 0 0',
  fontSize: '0.875rem',
  opacity: 0.65,
  maxWidth: 560,
  lineHeight: 1.5,
}

const closeButtonStyle: CSSProperties = {
  appearance: 'none',
  background: 'transparent',
  border: '1px solid var(--theme-elevation-200)',
  color: 'var(--theme-text)',
  width: 32,
  height: 32,
  borderRadius: '6px',
  fontSize: 20,
  lineHeight: 1,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}

const modalBodyStyle: CSSProperties = {
  overflowY: 'auto',
  padding: '1.5rem 1.75rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
}

const categorySectionStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.875rem',
}

const categoryTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.6875rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 600,
  opacity: 0.55,
}

const cardGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
  gap: '1rem',
}

const cardButtonStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left',
  background: 'var(--theme-elevation-50)',
  border: '1px solid var(--theme-elevation-100)',
  borderRadius: '8px',
  padding: 0,
  overflow: 'hidden',
  cursor: 'pointer',
  fontFamily: 'inherit',
  color: 'inherit',
  transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
}

const previewSurfaceStyle: CSSProperties = {
  background: 'hsl(var(--background))',
  borderBottom: '1px solid var(--theme-elevation-100)',
  aspectRatio: '320 / 200',
  width: '100%',
}

const cardBodyStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem',
  padding: '0.875rem 1rem 1rem',
}

const cardLabelStyle: CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 600,
  letterSpacing: '-0.005em',
}

const cardDescStyle: CSSProperties = {
  fontSize: '0.75rem',
  opacity: 0.65,
  lineHeight: 1.45,
}
