import {defineField, defineType} from 'sanity'
import {CaseIcon} from '@sanity/icons/Case'
import {legacyUrlField, docGroups} from './_shared'

// Colección "Case Studies" de Webflow (/case-studies/*) + tarjetas "Partnerships you can trust"
export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Caso de cliente',
  type: 'document',
  icon: CaseIcon,
  groups: docGroups,
  fields: [
    defineField({name: 'institution', title: 'Institución', type: 'string', validation: (r) => r.required(), group: 'content'}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'institution'}, group: 'content'}),
    defineField({name: 'country', title: 'País', type: 'string', group: 'content'}),
    defineField({name: 'logo', title: 'Logo', type: 'imageWithAlt', group: 'content'}),
    defineField({name: 'mainImage', title: 'Imagen principal', type: 'imageWithAlt', group: 'content'}),
    defineField({name: 'summary', title: 'Resumen (EN)', type: 'text', rows: 2, group: 'content'}),
    defineField({name: 'summaryEs', title: 'Resumen (ES)', type: 'text', rows: 2, group: 'content'}),
    defineField({name: 'platforms', title: 'Plataformas', type: 'array', of: [{type: 'reference', to: [{type: 'partner'}]}], group: 'content'}),
    defineField({name: 'services', title: 'Servicios', type: 'array', of: [{type: 'reference', to: [{type: 'servicePage'}]}], group: 'content'}),
    defineField({name: 'results', title: 'Resultados', type: 'array', of: [{type: 'stat'}], group: 'content'}),
    defineField({name: 'body', title: 'Historia completa', type: 'blockContent', group: 'content'}),
    defineField({name: 'featured', title: 'Mostrar en la home', type: 'boolean', initialValue: false, group: 'content'}),
    defineField({name: 'orderRank', title: 'Orden', type: 'number', group: 'content'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
    legacyUrlField,
    defineField({name: 'webflow', title: 'Webflow (migración)', type: 'webflowMeta', hidden: ({value}) => !value}),
  ],
  preview: {select: {title: 'institution', subtitle: 'country', media: 'logo'}},
})
