import {defineField, defineType} from 'sanity'
import {CaseIcon} from '@sanity/icons/Case'

// "Partnerships you can trust": Harcum College, Westcliff University...
export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Caso de cliente',
  type: 'document',
  icon: CaseIcon,
  fields: [
    defineField({name: 'institution', title: 'Institución', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'institution'}}),
    defineField({name: 'logo', title: 'Logo', type: 'imageWithAlt'}),
    defineField({name: 'summary', title: 'Resumen (EN)', type: 'text', rows: 2}),
    defineField({name: 'summaryEs', title: 'Resumen (ES)', type: 'text', rows: 2}),
    defineField({name: 'platforms', title: 'Plataformas', type: 'array', of: [{type: 'reference', to: [{type: 'partner'}]}]}),
    defineField({name: 'services', title: 'Servicios', type: 'array', of: [{type: 'reference', to: [{type: 'servicePage'}]}]}),
    defineField({name: 'results', title: 'Resultados', type: 'array', of: [{type: 'stat'}]}),
    defineField({name: 'body', title: 'Historia completa', type: 'blockContent'}),
    defineField({name: 'orderRank', title: 'Orden', type: 'number'}),
  ],
  preview: {select: {title: 'institution', subtitle: 'summary', media: 'logo'}},
})
