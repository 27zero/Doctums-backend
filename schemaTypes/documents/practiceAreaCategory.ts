import {defineField, defineType} from 'sanity'
import {FolderIcon} from '@sanity/icons/Folder'
import {languageField, slugField} from './_shared'
import {defineField as df} from 'sanity'

export const practiceAreaCategory = defineType({
  name: 'practiceAreaCategory',
  title: 'Categoría de práctica',
  type: 'document',
  icon: FolderIcon,
  fields: [
    languageField,
    defineField({name: 'title', title: 'Nombre', type: 'string', validation: (r) => r.required()}),
    slugField(),
    defineField({name: 'description', title: 'Descripción (Advisory Services - Description)', type: 'text', rows: 3}),
    defineField({name: 'cardImage', title: 'Card Image', type: 'imageWithAlt'}),
    defineField({name: 'icon', title: 'Ícono', type: 'image'}),
    defineField({name: 'practiceAreas', title: 'Practice Areas', type: 'array', of: [{type: 'reference', to: [{type: 'practiceArea'}], weak: true}]}),
    df({name: 'legacyUrl', title: 'URL antigua (Webflow)', type: 'string'}),
    defineField({name: 'orderRank', title: 'Orden', type: 'number'}),
    defineField({name: 'webflow', title: 'Webflow (migración)', type: 'webflowMeta', hidden: ({value}) => !value}),
  ],
})
