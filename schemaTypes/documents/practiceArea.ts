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
    defineField({name: 'sections', title: 'Secciones', type: 'array', of: pageBuilderMembers, group: 'content'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
    legacyUrlField,
  ],
  preview: {select: {title: 'title', subtitle: 'category.title'}},
})
