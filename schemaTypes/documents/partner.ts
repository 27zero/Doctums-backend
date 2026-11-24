import {defineField, defineType} from 'sanity'
import {StarIcon} from '@sanity/icons/Star'
import {pageBuilderMembers} from '../sections'
import {slugField, legacyUrlField, docGroups} from './_shared'

// Plataformas y partners: Ellucian Banner, Colleague, Anthology, Student First, Element451, Scholarship Magic
export const partner = defineType({
  name: 'partner',
  title: 'Plataforma / Partner',
  type: 'document',
  icon: StarIcon,
  groups: docGroups,
  fields: [
    defineField({name: 'name', title: 'Nombre', type: 'string', validation: (r) => r.required(), group: 'content'}),
    {...slugField('name'), group: 'content'},
    defineField({name: 'kind', title: 'Tipo', type: 'string', options: {list: [{title: 'Partner estratégico', value: 'strategic'}, {title: 'Plataforma que implementamos', value: 'platform'}]}, group: 'content'}),
    defineField({name: 'logo', title: 'Logo', type: 'imageWithAlt', group: 'content'}),
    defineField({name: 'description', title: 'Descripción (EN)', type: 'text', rows: 3, group: 'content'}),
    defineField({name: 'descriptionEs', title: 'Descripción (ES)', type: 'text', rows: 3, group: 'content'}),
    defineField({name: 'website', title: 'Sitio web', type: 'url', group: 'content'}),
    defineField({name: 'hasLandingPage', title: 'Tiene página propia', type: 'boolean', initialValue: false, group: 'content'}),
    defineField({name: 'sections', title: 'Secciones de su página', type: 'array', of: pageBuilderMembers, hidden: ({document}) => !document?.hasLandingPage, group: 'content'}),
    defineField({name: 'orderRank', title: 'Orden', type: 'number', group: 'content'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
    legacyUrlField,
  ],
  preview: {select: {title: 'name', subtitle: 'kind', media: 'logo'}},
})
