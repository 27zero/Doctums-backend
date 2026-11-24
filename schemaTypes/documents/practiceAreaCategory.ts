import {defineField, defineType} from 'sanity'
import {FolderIcon} from '@sanity/icons/Folder'
import {languageField, slugField} from './_shared'

export const practiceAreaCategory = defineType({
  name: 'practiceAreaCategory',
  title: 'Categoría de práctica',
  type: 'document',
  icon: FolderIcon,
  fields: [
    languageField,
    defineField({name: 'title', title: 'Nombre', type: 'string', validation: (r) => r.required()}),
    slugField(),
    defineField({name: 'description', title: 'Descripción', type: 'text', rows: 3}),
    defineField({name: 'icon', title: 'Ícono', type: 'image'}),
    defineField({name: 'orderRank', title: 'Orden', type: 'number'}),
  ],
})
