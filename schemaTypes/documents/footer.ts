import {defineField, defineType} from 'sanity'
import {BlockElementIcon} from '@sanity/icons/BlockElement'
import {singletonLanguageField as languageField} from './_shared'

export const footer = defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  icon: BlockElementIcon,
  fields: [
    languageField,
    defineField({name: 'connectTitle', title: 'Título redes', type: 'string', initialValue: 'Connect with us'}),
    defineField({name: 'columns', title: 'Columnas', type: 'array', of: [{type: 'linkGroup'}]}),
    defineField({name: 'legalLinks', title: 'Enlaces legales', type: 'array', of: [{type: 'link'}]}),
    defineField({name: 'copyright', title: 'Copyright', type: 'string'}),
    defineField({name: 'disclaimer', title: 'Disclaimer de marcas', type: 'text', rows: 3}),
  ],
  preview: {select: {lang: 'language'}, prepare: ({lang}) => ({title: `Footer (${(lang || '').toUpperCase()})`})},
})
