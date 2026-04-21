export interface SpecialtySchema {
  schemaType: string
  parentType: string
  medicalSpecialty?: string
  /** Whether the practitioner qualifies as an IndividualPhysician (vs Person) */
  isPhysician: boolean
}

export const specialtySchemaMap: Record<string, SpecialtySchema> = {
  'dermatologue': { schemaType: 'Dermatology', parentType: 'MedicalBusiness', isPhysician: true },
  'dentiste': { schemaType: 'Dentist', parentType: 'MedicalBusiness', isPhysician: true },
  'ophtalmologue': { schemaType: 'Optometric', parentType: 'MedicalBusiness', isPhysician: true },
  'orl': { schemaType: 'Otolaryngologic', parentType: 'MedicalBusiness', isPhysician: true },
  'cardiologue': { schemaType: 'Physician', parentType: 'MedicalBusiness', medicalSpecialty: 'Cardiovascular', isPhysician: true },
  'gynecologue': { schemaType: 'Gynecologic', parentType: 'MedicalBusiness', isPhysician: true },
  'pediatre': { schemaType: 'Pediatric', parentType: 'MedicalBusiness', isPhysician: true },
  'psychiatre': { schemaType: 'Psychiatric', parentType: 'MedicalBusiness', isPhysician: true },
  'kinesitherapeute': { schemaType: 'Physiotherapy', parentType: 'MedicalBusiness', isPhysician: false },
  'osteopathe': { schemaType: 'MedicalBusiness', parentType: 'LocalBusiness', isPhysician: false },
  'infirmier': { schemaType: 'Nursing', parentType: 'MedicalBusiness', isPhysician: false },
  'orthophoniste': { schemaType: 'MedicalBusiness', parentType: 'LocalBusiness', isPhysician: false },
  'sage-femme': { schemaType: 'Midwifery', parentType: 'MedicalBusiness', isPhysician: false },
  'sophrologue': { schemaType: 'HealthAndBeautyBusiness', parentType: 'LocalBusiness', isPhysician: false },
  'naturopathe': { schemaType: 'HealthAndBeautyBusiness', parentType: 'LocalBusiness', isPhysician: false },
  'hypnotherapeute': { schemaType: 'HealthAndBeautyBusiness', parentType: 'LocalBusiness', isPhysician: false },
  'default': { schemaType: 'MedicalBusiness', parentType: 'LocalBusiness', isPhysician: false },
}

export function getSpecialtySchema(slug: string): SpecialtySchema {
  return specialtySchemaMap[slug] ?? specialtySchemaMap['default']!
}
