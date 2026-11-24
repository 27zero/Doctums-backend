import {defineField, defineType} from 'sanity'
import {PackageIcon} from '@sanity/icons/Package'
import {pageBuilderMembers} from '../sections'
import {languageField, slugField, legacyUrlField, docGroups} from './_shared'

export const SERVICE_GROUPS = [
  {title: 'Advisory & Optimization Services', value: 'advisory'},
  {title: 'Tech Platform Implementation (Ellucian, Anthology…)', value: 'platform'},
  {title: 'AI Strategy & Platform', value: 'ai'},
  {title: 'Governance', value: 'governance'},
  {title: 'For EdTechs', value: 'edtech'},
]

// Servicios y sub-servicios: /advisory-optimization-services, /advisory-services/*, /ellucian-implementation-services/*,
// /banner-banner-consulting, /anthology-consulting, /cybersecurity-for-higher-education, etc.
export const servicePage = defineType({
  name: 'servicePage',
  title: 'Servicio',
  type: 'document',
  icon: PackageIcon,
  groups: docGroups,
  fields: [
    languageField,
    defineField({name: 'title', title: 'Nombre del servicio', type: 'string', validation: (r) => r.required(), group: 'content'}),
    {...slugField(), group: 'content'},
    defineField({name: 'serviceGroup', title: 'Línea de servicio', type: 'string', options: {list: SERVICE_GROUPS}, group: 'content'}),
    defineField({name: 'parent', title: 'Servicio padre', type: 'reference', to: [{type: 'servicePage'}], group: 'content', description: 'Ej: "Change Management" → padre "Advisory & Optimization Services"'}),
    defineField({name: 'isHub', title: 'Es página hub de una línea', type: 'boolean', initialValue: false, group: 'content'}),
    defineField({name: 'summary', title: 'Resumen (para tarjetas y menús)', type: 'text', rows: 3, group: 'content'}),
    defineField({name: 'icon', title: 'Ícono', type: 'image', group: 'content'}),
    defineField({name: 'cardImage', title: 'Imagen de tarjeta', type: 'imageWithAlt', group: 'content'}),
    defineField({name: 'platforms', title: 'Plataformas relacionadas', type: 'array', of: [{type: 'reference', to: [{type: 'partner'}]}], group: 'content'}),
    defineField({name: 'practiceAreas', title: 'Áreas de práctica relacionadas', type: 'array', of: [{type: 'reference', to: [{type: 'practiceArea'}]}], group: 'content'}),
    defineField({name: 'sections', title: 'Secciones', type: 'array', of: pageBuilderMembers, group: 'content'}),
    defineField({name: 'orderRank', title: 'Orden', type: 'number', group: 'content'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
    legacyUrlField,
    defineField({name: 'webflow', title: 'Webflow (migración)', type: 'webflowMeta', hidden: ({value}) => !value}),
  ],
  orderings: [{title: 'Orden', name: 'order', by: [{field: 'orderRank', direction: 'asc'}]}],
  preview: {
    select: {title: 'title', group: 'serviceGroup', parent: 'parent.title', lang: 'language', media: 'icon'},
    prepare: ({title, group, parent, lang, media}) => ({title, media, subtitle: [(lang || '').toUpperCase(), group, parent && `↳ ${parent}`].filter(Boolean).join(' · ')}),
  },
})
