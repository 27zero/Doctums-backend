import {defineField, defineType} from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({name: 'metaTitle', title: 'Meta title', type: 'string', validation: (r) => r.max(70).warning('Máx. 70 caracteres')}),
    defineField({name: 'metaDescription', title: 'Meta description', type: 'text', rows: 3, validation: (r) => r.max(160).warning('Máx. 160 caracteres')}),
    defineField({name: 'ogImage', title: 'Imagen para compartir (OG)', type: 'image'}),
    defineField({name: 'canonicalUrl', title: 'URL canónica', type: 'url'}),
    defineField({name: 'noIndex', title: 'No indexar', type: 'boolean', initialValue: false}),
  ],
})
