// EN = sitio de Estados Unidos (/), ES = Latinoamérica (/latam)
export const LANGUAGES = [
  {id: 'en', title: 'English (US)'},
  {id: 'es', title: 'Español (LATAM)'},
]

// Tipos traducibles con @sanity/document-internationalization
// (settings / navigation / footer son singletons por idioma: ver structure/index.ts)
export const I18N_TYPES = [
  'page',
  'servicePage',
  'post',
  'practiceArea',
  'practiceAreaCategory',
  'blogCategory',
  'faq',
]
