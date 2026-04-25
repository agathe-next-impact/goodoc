/**
 * Side-effect imports: each block module calls `registerBlock(...)` at
 * module load. Importing this barrel from `apps/web` is enough to populate
 * the registry before any `SectionRenderer` runs.
 *
 * Registration order is not significant — each block is keyed by its
 * unique `blockType` literal.
 */
import './placeholder'
import './hero-split'
import './services-grid'
import './about-hero'
import './practitioner-card'
import './opening-hours'
import './location-map'
import './testimonials-grid'
import './faq-accordion'
import './contact-form'
import './cta-banner'
import './fee-pricing'
import './partner-logos'

export { Placeholder, placeholderSchema } from './placeholder'
export { HeroSplit, heroSplitSchema } from './hero-split'
export { ServicesGrid, servicesGridSchema } from './services-grid'
export { AboutHero, aboutHeroSchema } from './about-hero'
export { PractitionerCard, practitionerCardSchema } from './practitioner-card'
export { OpeningHours, openingHoursSchema } from './opening-hours'
export { LocationMap, locationMapSchema } from './location-map'
export { TestimonialsGrid, testimonialsGridSchema } from './testimonials-grid'
export { FaqAccordion, faqAccordionSchema } from './faq-accordion'
export { ContactForm, contactFormSchema } from './contact-form'
export { CtaBanner, ctaBannerSchema } from './cta-banner'
export { FeePricing, feePricingSchema } from './fee-pricing'
export { PartnerLogos, partnerLogosSchema } from './partner-logos'

export function registerBuiltInBlocks(): void {
  // no-op — the side-effect imports above have already run.
}
