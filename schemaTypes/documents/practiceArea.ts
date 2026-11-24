import {defineField, defineType} from 'sanity'
import {TagsIcon} from '@sanity/icons/Tags'
import {pageBuilderMembers} from '../sections'
import {languageField, slugField, legacyUrlField, docGroups} from './_shared'

// /practice-area/<slug>
export const practiceArea = defineType({
  name: 'practiceArea',
  title: 'Área de práctica',
  type: 'document',
  icon: TagsIcon,
  groups: docGroups,
  fields: [
    languageField,
    defineField({name: 'title', title: 'Nombre', type: 'string', validation: (r) => r.required(), group: 'content'}),
    {...slugField(), group: 'content'},
    defineField({name: 'category', title: 'Categoría', type: 'reference', to: [{type: 'practiceAreaCategory'}], group: 'content'}),
    defineField({name: 'summary', title: 'Resumen', type: 'text', rows: 3, group: 'content'}),
    defineField({name: 'image', title: 'Practice Area Image', type: 'imageWithAlt', group: 'content'}),
    defineField({name: 'tagline', title: 'Tagline', type: 'text', rows: 2, group: 'content'}),
    defineField({name: 'shortDescription', title: 'Short Description', type: 'text', rows: 3, group: 'content'}),
    defineField({name: 'highlights', title: 'Highlights (1–6)', type: 'array', of: [{type: 'highlight'}], validation: (r) => r.max(6), group: 'content'}),
    defineField({name: 'orderRank', title: 'Custom Order', type: 'number', group: 'content'}),
    defineField({name: 'sections', title: 'Secciones', type: 'array', of: pageBuilderMembers, group: 'content'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
    legacyUrlField,
    defineField({name: 'webflow', title: 'Webflow (migración)', type: 'webflowMeta', hidden: ({value}) => !value}),
  ],
  preview: {select: {title: 'title', subtitle: 'category.title'}},
})
