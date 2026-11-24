import {defineField, defineType} from 'sanity'
import {TagIcon} from '@sanity/icons/Tag'
import {languageField, slugField} from './_shared'

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
    defineField({name: 'orderRank', title: 'Orden', type: 'number'}),
  ],
  orderings: [{title: 'Orden', name: 'order', by: [{field: 'orderRank', direction: 'asc'}]}],
})
