import type { ComponentType, ReactNode } from 'react'

/**
 * Block picker entries — the source of truth for the in-admin block gallery.
 *
 * Kept in its own client-safe module (no server-only deps, no `JsonLd`, no
 * heavy imports) so the admin bundle can list every available block + its
 * SVG preview without dragging the actual block components in.
 *
 * Every preview SVG paints with `hsl(var(--primary))`, `hsl(var(--secondary))`,
 * `hsl(var(--background))`, `hsl(var(--foreground))`, `hsl(var(--muted))`,
 * `hsl(var(--muted-foreground))`, `hsl(var(--border))` — the same custom
 * properties `buildThemeCss` injects on the public site. Inject them in the
 * admin shell and previews tint to the practitioner's palette in real time.
 */

export type BlockCategory =
  | 'hero'
  | 'content'
  | 'social-proof'
  | 'conversion'
  | 'utility'

export type BlockPickerEntry = {
  blockType: string
  label: string
  description: string
  category: BlockCategory
  Preview: ComponentType
  /**
   * Default field values seeded when the practitioner inserts the block.
   * Must satisfy the corresponding Zod schema in `blocks/<slug>.tsx`.
   * The `blockType` discriminator is added at insertion time.
   */
  defaultData: Record<string, unknown>
}

const VB = '0 0 320 200' as const

function Preview({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox={VB}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <rect
        x={0}
        y={0}
        width={320}
        height={200}
        fill="hsl(var(--background))"
      />
      {children}
    </svg>
  )
}

const FG = 'hsl(var(--foreground))'
const MUTED_FG = 'hsl(var(--muted-foreground))'
const PRIMARY = 'hsl(var(--primary))'
const PRIMARY_FG = 'hsl(var(--primary-foreground))'
const ACCENT = 'hsl(var(--accent))'
const ACCENT_FG = 'hsl(var(--accent-foreground))'
const MUTED = 'hsl(var(--muted))'
const BORDER = 'hsl(var(--border))'
const CARD = 'hsl(var(--card))'

// ─────────────────────────────────────────────────────────────────────────────
// Previews
// ─────────────────────────────────────────────────────────────────────────────

function HeroSplitPreview() {
  return (
    <Preview>
      <rect x={20} y={28} width={48} height={8} rx={4} fill={ACCENT} />
      <rect x={20} y={48} width={130} height={12} rx={2} fill={FG} />
      <rect x={20} y={66} width={110} height={12} rx={2} fill={FG} />
      <rect x={20} y={94} width={140} height={5} rx={2} fill={MUTED_FG} opacity={0.5} />
      <rect x={20} y={104} width={120} height={5} rx={2} fill={MUTED_FG} opacity={0.5} />
      <rect x={20} y={114} width={100} height={5} rx={2} fill={MUTED_FG} opacity={0.5} />
      <rect x={20} y={138} width={64} height={20} rx={4} fill={PRIMARY} />
      <rect x={92} y={138} width={64} height={20} rx={4} fill="none" stroke={BORDER} strokeWidth={1} />
      <rect x={186} y={28} width={114} height={144} rx={6} fill={MUTED} />
      <circle cx={243} cy={86} r={20} fill={PRIMARY} opacity={0.25} />
      <path
        d="M186 130 Q220 110 250 130 T300 130 L300 172 L186 172 Z"
        fill={PRIMARY}
        opacity={0.4}
      />
    </Preview>
  )
}

function ServicesGridPreview() {
  return (
    <Preview>
      <rect x={108} y={20} width={104} height={9} rx={2} fill={FG} />
      <rect x={130} y={36} width={60} height={5} rx={2} fill={MUTED_FG} opacity={0.5} />
      {[0, 1, 2].map((col) =>
        [0, 1].map((row) => {
          const x = 22 + col * 96
          const y = 60 + row * 64
          return (
            <g key={`${col}-${row}`}>
              <rect x={x} y={y} width={84} height={56} rx={4} fill={CARD} stroke={BORDER} />
              <rect x={x + 8} y={y + 8} width={14} height={14} rx={3} fill={PRIMARY} opacity={0.18} />
              <rect x={x + 8} y={y + 28} width={50} height={5} rx={1.5} fill={FG} />
              <rect x={x + 8} y={y + 38} width={62} height={4} rx={1.5} fill={MUTED_FG} opacity={0.5} />
              <rect x={x + 8} y={y + 46} width={42} height={4} rx={1.5} fill={MUTED_FG} opacity={0.5} />
            </g>
          )
        }),
      )}
    </Preview>
  )
}

function AboutHeroPreview() {
  return (
    <Preview>
      <rect x={20} y={36} width={40} height={6} rx={2} fill={PRIMARY} />
      <rect x={20} y={54} width={130} height={11} rx={2} fill={FG} />
      <rect x={20} y={70} width={100} height={11} rx={2} fill={FG} />
      <rect x={20} y={94} width={150} height={4} rx={1.5} fill={MUTED_FG} opacity={0.5} />
      <rect x={20} y={104} width={140} height={4} rx={1.5} fill={MUTED_FG} opacity={0.5} />
      <rect x={20} y={114} width={130} height={4} rx={1.5} fill={MUTED_FG} opacity={0.5} />
      <rect x={20} y={124} width={120} height={4} rx={1.5} fill={MUTED_FG} opacity={0.5} />
      <rect x={20} y={146} width={70} height={18} rx={3} fill="none" stroke={PRIMARY} strokeWidth={1.5} />
      <rect x={196} y={26} width={104} height={148} rx={6} fill={MUTED} />
      <circle cx={248} cy={84} r={26} fill={ACCENT} opacity={0.6} />
    </Preview>
  )
}

function PractitionerCardPreview() {
  return (
    <Preview>
      <rect x={26} y={28} width={268} height={144} rx={8} fill={CARD} stroke={BORDER} />
      <rect x={42} y={46} width={68} height={68} rx={6} fill={MUTED} />
      <circle cx={76} cy={74} r={14} fill={PRIMARY} opacity={0.35} />
      <path d="M48 110 Q76 92 104 110 L104 114 L48 114 Z" fill={PRIMARY} opacity={0.35} />
      <rect x={126} y={50} width={130} height={10} rx={2} fill={FG} />
      <rect x={126} y={66} width={80} height={6} rx={2} fill={PRIMARY} />
      <rect x={126} y={86} width={150} height={4} rx={1.5} fill={MUTED_FG} opacity={0.5} />
      <rect x={126} y={96} width={140} height={4} rx={1.5} fill={MUTED_FG} opacity={0.5} />
      <rect x={126} y={106} width={120} height={4} rx={1.5} fill={MUTED_FG} opacity={0.5} />
      <rect x={42} y={130} width={120} height={4} rx={1.5} fill={MUTED_FG} opacity={0.4} />
      <rect x={42} y={140} width={100} height={4} rx={1.5} fill={MUTED_FG} opacity={0.4} />
    </Preview>
  )
}

function OpeningHoursPreview() {
  return (
    <Preview>
      <rect x={20} y={22} width={100} height={9} rx={2} fill={FG} />
      <rect x={20} y={44} width={188} height={130} rx={6} fill={CARD} stroke={BORDER} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x={32} y={56 + i * 19} width={50} height={5} rx={1.5} fill={FG} />
          <rect x={140} y={56 + i * 19} width={56} height={5} rx={1.5} fill={MUTED_FG} opacity={0.6} />
          {i < 5 ? (
            <line
              x1={32}
              y1={66 + i * 19}
              x2={196}
              y2={66 + i * 19}
              stroke={BORDER}
              strokeWidth={0.5}
            />
          ) : null}
        </g>
      ))}
      <rect x={222} y={44} width={78} height={130} rx={6} fill={ACCENT} />
      <rect x={234} y={64} width={48} height={5} rx={1.5} fill={ACCENT_FG} opacity={0.7} />
      <rect x={234} y={82} width={56} height={9} rx={2} fill={ACCENT_FG} />
      <rect x={234} y={120} width={54} height={4} rx={1.5} fill={ACCENT_FG} opacity={0.7} />
      <rect x={234} y={130} width={48} height={4} rx={1.5} fill={ACCENT_FG} opacity={0.7} />
    </Preview>
  )
}

function LocationMapPreview() {
  return (
    <Preview>
      <rect x={20} y={22} width={120} height={9} rx={2} fill={FG} />
      <rect x={20} y={44} width={140} height={130} rx={6} fill={CARD} stroke={BORDER} />
      <rect x={32} y={58} width={90} height={8} rx={2} fill={FG} />
      <rect x={32} y={72} width={70} height={5} rx={1.5} fill={MUTED_FG} opacity={0.6} />
      <rect x={32} y={92} width={50} height={4} rx={1.5} fill={FG} opacity={0.7} />
      <rect x={32} y={102} width={100} height={4} rx={1.5} fill={MUTED_FG} opacity={0.5} />
      <rect x={32} y={110} width={86} height={4} rx={1.5} fill={MUTED_FG} opacity={0.5} />
      <rect x={32} y={130} width={50} height={4} rx={1.5} fill={FG} opacity={0.7} />
      <rect x={32} y={140} width={92} height={4} rx={1.5} fill={MUTED_FG} opacity={0.5} />
      <rect x={172} y={44} width={128} height={130} rx={6} fill={MUTED} />
      <line x1={172} y1={88} x2={300} y2={88} stroke={BORDER} strokeWidth={0.5} />
      <line x1={172} y1={130} x2={300} y2={130} stroke={BORDER} strokeWidth={0.5} />
      <line x1={216} y1={44} x2={216} y2={174} stroke={BORDER} strokeWidth={0.5} />
      <line x1={258} y1={44} x2={258} y2={174} stroke={BORDER} strokeWidth={0.5} />
      <circle cx={236} cy={108} r={6} fill={PRIMARY} />
      <circle cx={236} cy={108} r={12} fill={PRIMARY} opacity={0.25} />
    </Preview>
  )
}

function TestimonialsGridPreview() {
  return (
    <Preview>
      <rect x={120} y={22} width={80} height={9} rx={2} fill={FG} />
      {[0, 1, 2].map((i) => {
        const x = 22 + i * 96
        return (
          <g key={i}>
            <rect x={x} y={48} width={84} height={120} rx={4} fill={CARD} stroke={BORDER} />
            <g transform={`translate(${x + 10}, ${60})`}>
              {[0, 1, 2, 3, 4].map((s) => (
                <text
                  key={s}
                  x={s * 8}
                  y={6}
                  fontFamily="Arial"
                  fontSize={10}
                  fill={PRIMARY}
                >
                  ★
                </text>
              ))}
            </g>
            <rect x={x + 10} y={80} width={64} height={4} rx={1.5} fill={MUTED_FG} opacity={0.7} />
            <rect x={x + 10} y={90} width={60} height={4} rx={1.5} fill={MUTED_FG} opacity={0.7} />
            <rect x={x + 10} y={100} width={56} height={4} rx={1.5} fill={MUTED_FG} opacity={0.7} />
            <rect x={x + 10} y={110} width={48} height={4} rx={1.5} fill={MUTED_FG} opacity={0.7} />
            <rect x={x + 10} y={146} width={32} height={4} rx={1.5} fill={FG} />
            <rect x={x + 50} y={146} width={24} height={4} rx={1.5} fill={MUTED_FG} opacity={0.5} />
          </g>
        )
      })}
    </Preview>
  )
}

function FaqAccordionPreview() {
  return (
    <Preview>
      <rect x={108} y={22} width={104} height={9} rx={2} fill={FG} />
      <rect x={50} y={48} width={220} height={128} rx={6} fill={CARD} stroke={BORDER} />
      <rect x={64} y={62} width={120} height={6} rx={2} fill={FG} />
      <text x={246} y={68} fontFamily="Arial" fontSize={12} fill={MUTED_FG}>
        −
      </text>
      <rect x={64} y={82} width={184} height={4} rx={1.5} fill={MUTED_FG} opacity={0.5} />
      <rect x={64} y={92} width={172} height={4} rx={1.5} fill={MUTED_FG} opacity={0.5} />
      <rect x={64} y={102} width={140} height={4} rx={1.5} fill={MUTED_FG} opacity={0.5} />
      <line x1={64} y1={120} x2={256} y2={120} stroke={BORDER} strokeWidth={0.5} />
      <rect x={64} y={132} width={140} height={6} rx={2} fill={FG} />
      <text x={246} y={138} fontFamily="Arial" fontSize={12} fill={MUTED_FG}>
        +
      </text>
      <line x1={64} y1={154} x2={256} y2={154} stroke={BORDER} strokeWidth={0.5} />
      <rect x={64} y={164} width={130} height={6} rx={2} fill={FG} />
      <text x={246} y={170} fontFamily="Arial" fontSize={12} fill={MUTED_FG}>
        +
      </text>
    </Preview>
  )
}

function ContactFormPreview() {
  return (
    <Preview>
      <rect x={108} y={22} width={104} height={9} rx={2} fill={FG} />
      <rect x={68} y={46} width={184} height={134} rx={6} fill={CARD} stroke={BORDER} />
      <rect x={82} y={60} width={40} height={4} rx={1.5} fill={MUTED_FG} opacity={0.7} />
      <rect x={82} y={70} width={156} height={14} rx={3} fill={MUTED} />
      <rect x={82} y={92} width={50} height={4} rx={1.5} fill={MUTED_FG} opacity={0.7} />
      <rect x={82} y={102} width={156} height={14} rx={3} fill={MUTED} />
      <rect x={82} y={124} width={36} height={4} rx={1.5} fill={MUTED_FG} opacity={0.7} />
      <rect x={82} y={134} width={156} height={28} rx={3} fill={MUTED} />
      <rect x={156} y={170} width={82} height={20} rx={4} fill={PRIMARY} />
    </Preview>
  )
}

function CtaBannerPreview() {
  return (
    <Preview>
      <rect x={20} y={50} width={280} height={100} rx={6} fill={PRIMARY} />
      <rect x={40} y={74} width={160} height={11} rx={2} fill={PRIMARY_FG} />
      <rect x={40} y={94} width={130} height={11} rx={2} fill={PRIMARY_FG} />
      <rect x={40} y={120} width={150} height={4} rx={1.5} fill={PRIMARY_FG} opacity={0.7} />
      <rect x={216} y={92} width={68} height={20} rx={4} fill={PRIMARY_FG} />
      <rect x={216} y={118} width={68} height={20} rx={4} fill="none" stroke={PRIMARY_FG} strokeWidth={1} opacity={0.7} />
    </Preview>
  )
}

function FeePricingPreview() {
  return (
    <Preview>
      <rect x={120} y={22} width={80} height={9} rx={2} fill={FG} />
      <rect x={26} y={46} width={268} height={140} rx={6} fill={CARD} stroke={BORDER} />
      <rect x={26} y={46} width={268} height={22} rx={6} fill={MUTED} />
      <rect x={40} y={56} width={50} height={4} rx={1.5} fill={MUTED_FG} />
      <rect x={120} y={56} width={36} height={4} rx={1.5} fill={MUTED_FG} />
      <rect x={186} y={56} width={56} height={4} rx={1.5} fill={MUTED_FG} />
      <rect x={252} y={56} width={32} height={4} rx={1.5} fill={MUTED_FG} />
      {[0, 1, 2, 3].map((i) => {
        const y = 80 + i * 26
        return (
          <g key={i}>
            <rect x={40} y={y} width={66} height={5} rx={1.5} fill={FG} />
            <rect x={120} y={y} width={36} height={5} rx={1.5} fill={MUTED_FG} opacity={0.6} />
            <rect x={186} y={y} width={42} height={5} rx={1.5} fill={MUTED_FG} opacity={0.6} />
            <rect x={252} y={y} width={32} height={5} rx={1.5} fill={FG} opacity={0.8} />
            {i < 3 ? (
              <line x1={26} y1={y + 14} x2={294} y2={y + 14} stroke={BORDER} strokeWidth={0.5} />
            ) : null}
          </g>
        )
      })}
    </Preview>
  )
}

function PartnerLogosPreview() {
  return (
    <Preview>
      <rect x={120} y={42} width={80} height={8} rx={2} fill={FG} />
      {[0, 1, 2, 3, 4].map((i) => {
        const x = 32 + i * 56
        return (
          <g key={i}>
            <rect x={x} y={92} width={48} height={26} rx={3} fill={MUTED} />
            <rect x={x + 8} y={102} width={32} height={6} rx={1.5} fill={MUTED_FG} opacity={0.6} />
          </g>
        )
      })}
      <rect x={32} y={138} width={48} height={26} rx={3} fill={MUTED} />
      <rect x={88} y={138} width={48} height={26} rx={3} fill={MUTED} />
      <rect x={144} y={138} width={48} height={26} rx={3} fill={MUTED} />
    </Preview>
  )
}

function PlaceholderPreview() {
  return (
    <Preview>
      <rect x={20} y={70} width={280} height={60} rx={6} fill={MUTED} />
      <rect x={36} y={84} width={120} height={8} rx={2} fill={FG} />
      <rect x={36} y={102} width={200} height={4} rx={1.5} fill={MUTED_FG} opacity={0.5} />
      <rect x={36} y={112} width={170} height={4} rx={1.5} fill={MUTED_FG} opacity={0.5} />
    </Preview>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Defaults — minimal valid data per schema, intended to be filled in by the
// practitioner immediately after insertion. Mirrors the lightest preset path.
// ─────────────────────────────────────────────────────────────────────────────

const PLACEHOLDER_PHOTO =
  'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1200&auto=format&fit=crop'

const heroSplitDefaults = {
  badge: 'Cabinet médical',
  title: 'Une approche humaine, des soins de qualité',
  subtitle:
    'Médecine de proximité au cœur de votre quartier. Prise en charge sur rendez-vous.',
  primaryCta: { label: 'Prendre rendez-vous', href: '/rendez-vous' },
  secondaryCta: { label: 'En savoir plus', href: '/a-propos' },
  image: {
    url: PLACEHOLDER_PHOTO,
    alt: 'Portrait du praticien',
    width: 960,
    height: 1200,
  },
  imagePosition: 'right',
}

const servicesGridDefaults = {
  title: 'Nos consultations',
  subtitle: 'Des consultations adaptées à chaque situation.',
  services: [
    {
      title: 'Consultation de médecine générale',
      description:
        'Motif du jour, suivi, renouvellement d’ordonnance, prévention.',
      durationLabel: '20 min',
      priceLabel: '25 €',
      iconInitial: 'C',
    },
    {
      title: 'Bilan de santé annuel',
      description: 'Examen complet recommandé une fois par an.',
      durationLabel: '45 min',
      priceLabel: '60 €',
      iconInitial: 'B',
    },
    {
      title: 'Téléconsultation',
      description:
        'Consultation à distance pour les motifs ne nécessitant pas d’examen physique.',
      durationLabel: '15 min',
      priceLabel: '25 €',
      iconInitial: 'T',
    },
  ],
  columns: 3,
}

const aboutHeroDefaults = {
  eyebrow: 'À propos',
  title: 'Présentation du cabinet',
  body:
    'Le cabinet vous accueille dans un cadre apaisant, pensé pour mettre les patients à l’aise. Notre approche : vous écouter, vous expliquer, vous accompagner.',
}

const practitionerCardDefaults = {
  civility: 'Dr.',
  firstName: 'Prénom',
  lastName: 'Nom',
  specialty: 'Médecine générale',
  bio: 'Diplômé·e en médecine générale, j’exerce depuis plus de dix ans. Je porte une attention particulière à la relation médecin-patient.',
  rppsLabel: 'RPPS 10000000000',
  credentials: [
    { value: 'Doctorat en médecine — Université Paris Cité, 2012' },
    { value: 'DES de médecine générale — 2015' },
  ],
  languages: [{ value: 'Français' }, { value: 'Anglais' }],
  consultationFormats: [{ value: 'Présentiel' }, { value: 'Téléconsultation' }],
}

const openingHoursDefaults = {
  title: 'Horaires du cabinet',
  days: [
    { dayLabel: 'Lundi', ranges: [{ open: '09:00', close: '12:30' }, { open: '14:00', close: '19:00' }] },
    { dayLabel: 'Mardi', ranges: [{ open: '09:00', close: '12:30' }, { open: '14:00', close: '19:00' }] },
    { dayLabel: 'Mercredi', ranges: [{ open: '09:00', close: '13:00' }] },
    { dayLabel: 'Jeudi', ranges: [{ open: '09:00', close: '12:30' }, { open: '14:00', close: '19:00' }] },
    { dayLabel: 'Vendredi', ranges: [{ open: '09:00', close: '12:30' }, { open: '14:00', close: '18:00' }] },
    { dayLabel: 'Samedi', ranges: [{ open: '09:00', close: '12:00' }] },
    { dayLabel: 'Dimanche', isClosed: true },
  ],
  phoneNumber: '01 23 45 67 89',
  phoneLabel: 'Secrétariat',
  emergencyNote:
    'En cas d’urgence vitale en dehors des horaires d’ouverture, composez le 15 (SAMU).',
}

const locationMapDefaults = {
  title: 'Adresse du cabinet',
  streetAddress: '12 rue de la République',
  postalCode: '75001',
  city: 'Paris',
  country: 'France',
  latitude: 48.8566,
  longitude: 2.3522,
  transports: [
    { value: 'Métro ligne 1 — station Châtelet (3 min à pied)' },
    { value: 'Bus 21, 27, 81 — arrêt Pont Neuf' },
  ],
  parking: 'Parking public Saint-Eustache à 200 m.',
  accessibilityNote:
    'Cabinet accessible aux personnes à mobilité réduite — ascenseur et porte d’entrée large.',
}

const testimonialsGridDefaults = {
  title: 'Avis de nos patients',
  testimonials: [
    {
      authorName: 'Marie D.',
      content:
        'À l’écoute, précis·e et rassurant·e. J’apprécie particulièrement la disponibilité et la ponctualité.',
      rating: 5,
      dateLabel: 'Janvier 2026',
      source: 'Google',
    },
    {
      authorName: 'Jean-Paul L.',
      content:
        'Un suivi de qualité, des explications claires et une prise en charge rapide.',
      rating: 5,
      dateLabel: 'Décembre 2025',
      source: 'Doctolib',
    },
  ],
}

const faqAccordionDefaults = {
  title: 'Questions fréquentes',
  items: [
    {
      question: 'Comment prendre rendez-vous ?',
      answer:
        'Le plus rapide est de passer par la plateforme de réservation en ligne via le bouton "Prendre rendez-vous".',
    },
    {
      question: 'Êtes-vous conventionné·e ?',
      answer:
        'Oui, le cabinet est conventionné secteur 1 — sans dépassement d’honoraires.',
    },
    {
      question: 'Acceptez-vous les nouveaux patients ?',
      answer:
        'Oui, dans la limite des créneaux disponibles. Merci de privilégier la prise de rendez-vous en ligne.',
    },
  ],
}

const contactFormDefaults = {
  title: 'Nous écrire',
  subtitle:
    'Pour toute demande non urgente — prise de rendez-vous, informations pratiques.',
  actionUrl: '/contact',
  motifs: [
    { value: 'Prise de rendez-vous' },
    { value: 'Renseignement administratif' },
    { value: 'Question médicale non urgente' },
    { value: 'Autre' },
  ],
  showPhone: true,
  legalNotice:
    'Les données transmises via ce formulaire sont utilisées uniquement pour répondre à votre demande. Conformément au RGPD, vous disposez d’un droit d’accès, de rectification et d’effacement.',
}

const ctaBannerDefaults = {
  title: 'Prêt·e à prendre rendez-vous ?',
  subtitle: 'Réservez en ligne en quelques clics.',
  primaryCta: { label: 'Prendre rendez-vous', href: '/rendez-vous' },
  secondaryCta: { label: 'Nous contacter', href: '/contact' },
  tone: 'primary',
}

const feePricingDefaults = {
  title: 'Tarifs des actes',
  fees: [
    {
      actLabel: 'Consultation standard',
      durationLabel: '20 min',
      tarifSecu: '25 €',
      tarifCabinet: '25 €',
      conventionLabel: 'Secteur 1',
    },
    {
      actLabel: 'Bilan de santé annuel',
      durationLabel: '45 min',
      tarifSecu: '25 €',
      tarifCabinet: '60 €',
      conventionLabel: 'Secteur 1 — dépassement autorisé',
    },
    {
      actLabel: 'Téléconsultation',
      durationLabel: '15 min',
      tarifSecu: '25 €',
      tarifCabinet: '25 €',
      conventionLabel: 'Secteur 1',
    },
  ],
  disclaimer:
    'Tarifs donnés à titre indicatif, susceptibles d’évoluer. Vérifiez votre couverture complémentaire auprès de votre mutuelle.',
}

const partnerLogosDefaults = {
  title: 'Partenaires',
  logos: [
    { name: 'Ordre des médecins' },
    { name: 'ARS Île-de-France' },
    { name: 'MGEN' },
    { name: 'Harmonie Mutuelle' },
  ],
}

const placeholderDefaults = {
  title: 'Section libre',
  body: 'Ce bloc générique vous permet d’ajouter un titre et un texte libre.',
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry list
// ─────────────────────────────────────────────────────────────────────────────

export const BLOCK_PICKER_ENTRIES: readonly BlockPickerEntry[] = [
  {
    blockType: 'hero-split',
    label: 'Hero — bandeau d’accueil',
    description:
      'Grand titre, sous-titre, deux boutons d’action et photo du praticien. Idéal en haut de la page d’accueil.',
    category: 'hero',
    Preview: HeroSplitPreview,
    defaultData: heroSplitDefaults,
  },
  {
    blockType: 'about-hero',
    label: 'Présentation — texte long',
    description:
      'Bandeau plus sobre pour la page “À propos” : titre, paragraphe et photo facultative.',
    category: 'hero',
    Preview: AboutHeroPreview,
    defaultData: aboutHeroDefaults,
  },
  {
    blockType: 'services-grid',
    label: 'Grille de consultations',
    description:
      'Présente vos actes médicaux en grille (titre, description, durée, tarif).',
    category: 'content',
    Preview: ServicesGridPreview,
    defaultData: servicesGridDefaults,
  },
  {
    blockType: 'practitioner-card',
    label: 'Fiche praticien',
    description:
      'Carte détaillée : portrait, spécialité, biographie, diplômes, langues parlées.',
    category: 'content',
    Preview: PractitionerCardPreview,
    defaultData: practitionerCardDefaults,
  },
  {
    blockType: 'opening-hours',
    label: 'Horaires d’ouverture',
    description:
      'Tableau jour par jour avec créneaux et numéro de secrétariat.',
    category: 'content',
    Preview: OpeningHoursPreview,
    defaultData: openingHoursDefaults,
  },
  {
    blockType: 'location-map',
    label: 'Adresse et carte',
    description:
      'Adresse complète, accès en transports en commun, stationnement, accessibilité, et carte OpenStreetMap.',
    category: 'content',
    Preview: LocationMapPreview,
    defaultData: locationMapDefaults,
  },
  {
    blockType: 'fee-pricing',
    label: 'Tarifs des actes',
    description:
      'Tableau des tarifs : acte, durée, base Sécurité sociale, tarif cabinet, secteur de conventionnement.',
    category: 'content',
    Preview: FeePricingPreview,
    defaultData: feePricingDefaults,
  },
  {
    blockType: 'testimonials-grid',
    label: 'Avis de patients',
    description:
      'Grille d’avis anonymisés (CNIL) avec note, date et source (Google, Doctolib).',
    category: 'social-proof',
    Preview: TestimonialsGridPreview,
    defaultData: testimonialsGridDefaults,
  },
  {
    blockType: 'partner-logos',
    label: 'Logos partenaires',
    description:
      'Bandeau de logos (ordres, mutuelles, hôpitaux, formations).',
    category: 'social-proof',
    Preview: PartnerLogosPreview,
    defaultData: partnerLogosDefaults,
  },
  {
    blockType: 'faq-accordion',
    label: 'FAQ accordéon',
    description:
      'Liste de questions/réponses dépliables. Ajoute aussi un balisage SEO FAQPage.',
    category: 'content',
    Preview: FaqAccordionPreview,
    defaultData: faqAccordionDefaults,
  },
  {
    blockType: 'cta-banner',
    label: 'Bandeau d’appel à l’action',
    description:
      'Bandeau pleine largeur invitant à prendre rendez-vous. Variante sombre ou douce.',
    category: 'conversion',
    Preview: CtaBannerPreview,
    defaultData: ctaBannerDefaults,
  },
  {
    blockType: 'contact-form',
    label: 'Formulaire de contact',
    description:
      'Formulaire avec nom, email, téléphone, motif, message. Pas de données médicales (RGPD).',
    category: 'conversion',
    Preview: ContactFormPreview,
    defaultData: contactFormDefaults,
  },
  {
    blockType: 'placeholder',
    label: 'Section libre',
    description:
      'Bloc générique avec titre et texte libre. À utiliser en dépannage.',
    category: 'utility',
    Preview: PlaceholderPreview,
    defaultData: placeholderDefaults,
  },
]

export const BLOCK_CATEGORY_LABELS: Record<BlockCategory, string> = {
  hero: 'En-têtes',
  content: 'Contenu',
  'social-proof': 'Confiance',
  conversion: 'Conversion',
  utility: 'Utilitaires',
}

export function getPickerEntry(
  blockType: string,
): BlockPickerEntry | undefined {
  return BLOCK_PICKER_ENTRIES.find((e) => e.blockType === blockType)
}
