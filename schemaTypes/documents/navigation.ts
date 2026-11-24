import {defineField, defineType} from 'sanity'
import {MenuIcon} from '@sanity/icons/Menu'
import {singletonLanguageField as languageField} from './_shared'

export const navigation = defineType({
  name: 'navigation',
  title: 'Navegación (header)',
  type: 'document',
  icon: MenuIcon,
  fields: [
    languageField,
    defineField({name: 'items', title: 'Menú principal', type: 'array', of: [{type: 'navItem'}]}),
    defineField({name: 'cta', title: 'Botón del header', type: 'cta'}),
    defineField({
      name: 'languageSwitcher',
      title: 'Selector de idioma',
      type: 'array',
      of: [{type: 'link'}],
      description: 'Ej: ES - Latin America → /latam · EN - United States → /',
    }),
  ],
  preview: {select: {lang: 'language'}, prepare: ({lang}) => ({title: `Navegación (${(lang || '').toUpperCase()})`})},
})
