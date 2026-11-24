import {defineField, defineType} from 'sanity'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {languageField} from './_shared'

export const faq = defineType({
  name: 'faq',
  title: 'FAQ reutilizable',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    languageField,
    defineField({name: 'question', title: 'Pregunta', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'answer', title: 'Respuesta', type: 'blockContent'}),
    defineField({name: 'topic', title: 'Tema', type: 'string', options: {list: ['general', 'platform', 'ai', 'advisory']}}),
  ],
  preview: {select: {title: 'question', subtitle: 'topic'}},
})
