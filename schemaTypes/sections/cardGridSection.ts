import {defineField, defineType} from 'sanity'
import {ThLargeIcon} from '@sanity/icons/ThLarge'
import {sectionHeaderFields, sectionSettingsFields, sectionGroups, headerPreview} from './_common'

export const cardGridSection = defineType({
  name: 'cardGridSection',
  title: 'Grilla de tarjetas',
  type: 'object',
  icon: ThLargeIcon,
  groups: sectionGroups,
  fields: [
    ...sectionHeaderFields.map((f) => ({...f, group: 'content'})),
    defineField({name: 'cards', title: 'Tarjetas', type: 'array', of: [{type: 'card'}], group: 'content'}),
    defineField({name: 'columns', title: 'Columnas', type: 'number', options: {list: [2, 3, 4]}, initialValue: 3, group: 'settings'}),
    defineField({name: 'cta', title: 'CTA de la sección', type: 'cta', group: 'content'}),
    ...sectionSettingsFields,
  ],
  preview: headerPreview('Grilla de tarjetas'),
})
