import {defineField, type SlugIsUniqueValidator} from 'sanity'

// Campo requerido por @sanity/document-internationalization
export const languageField = defineField({
  name: 'language',
  title: 'Idioma',
  type: 'string',
  readOnly: true,
  hidden: true,
})

// Slug único por tipo + idioma (permite el mismo slug en EN y ES)
export const isUniquePerLanguage: SlugIsUniqueValidator = async (slug, context) => {
  const {document, getClient} = context
  const client = getClient({apiVersion: '2024-10-01'})
  const id = document?._id.replace(/^drafts\./, '')
  const params = {draft: `drafts.${id}`, published: id, slug, type: document?._type, language: (document as any)?.language ?? null}
  const query = `!defined(*[_type == $type && !(_id in [$draft, $published]) && slug.current == $slug && language == $language][0]._id)`
  return client.fetch(query, params)
}

export const slugField = (source = 'title') =>
  defineField({
    name: 'slug',
    title: 'Slug',
    type: 'slug',
    options: {source, maxLength: 120, isUnique: isUniquePerLanguage},
    validation: (r) => r.required(),
  })

// URL antigua en Webflow para generar redirecciones 301
export const legacyUrlField = defineField({
  name: 'legacyUrl',
  title: 'URL antigua (Webflow)',
  type: 'string',
  description: 'Ruta en el sitio actual, ej: /advisory-services/change-management',
  group: 'seo',
})

export const docGroups = [
  {name: 'content', title: 'Contenido', default: true},
  {name: 'seo', title: 'SEO'},
]

// Idioma visible/editable para singletons (siteSettings-en / siteSettings-es)
export const singletonLanguageField = defineField({
  name: 'language',
  title: 'Idioma',
  type: 'string',
  options: {list: [{title: 'English (US)', value: 'en'}, {title: 'Español (LATAM)', value: 'es'}], layout: 'radio', direction: 'horizontal'},
  validation: (r) => r.required(),
})
