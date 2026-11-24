import {defineField, defineType} from 'sanity'
import {TagIcon} from '@sanity/icons/Tag'
import {languageField, slugField} from './_shared'
import {defineField as df} from 'sanity'

export const blogCategory = defineType({
  name: 'blogCategory',
  title: 'Categoría del blog',
  type: 'document',
  icon: TagIcon,
  fields: [
    languageField,
    defineField({name: 'title', title: 'Nombre', type: 'string', validation: (r) => r.required()}),
    slugField(),
    defineField({name: 'description', title: 'Descripción', type: 'text', rows: 3}),
    defineField({name: 'image', title: 'Category Image', type: 'imageWithAlt'}),
    df({name: 'legacyUrl', title: 'URL antigua (Webflow)', type: 'string'}),
    defineField({name: 'orderRank', title: 'Orden', type: 'number'}),
    defineField({name: 'webflow', title: 'Webflow (migración)', type: 'webflowMeta', hidden: ({value}) => !value}),
  ],
  orderings: [{title: 'Orden', name: 'order', by: [{field: 'orderRank', direction: 'asc'}]}],
})
