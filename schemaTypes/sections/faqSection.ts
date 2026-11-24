import {defineField, defineType} from 'sanity'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {sectionHeaderFields, sectionSettingsFields, sectionGroups, headerPreview} from './_common'

export const faqSection = defineType({
  name: 'faqSection',
  title: 'Preguntas frecuentes',
  type: 'object',
  icon: HelpCircleIcon,
  groups: sectionGroups,
  fields: [
    ...sectionHeaderFields.map((f) => ({...f, group: 'content'})),
    defineField({name: 'items', title: 'Preguntas', type: 'array', of: [{type: 'faqItem'}], group: 'content'}),
    defineField({name: 'shared', title: 'FAQs reutilizables', type: 'array', of: [{type: 'reference', to: [{type: 'faq'}]}], group: 'content'}),
    ...sectionSettingsFields,
  ],
  preview: headerPreview('Preguntas frecuentes'),
})
