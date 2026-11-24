import {defineField, defineType} from 'sanity'
import {UlistIcon} from '@sanity/icons/Ulist'
import {sectionHeaderFields, sectionSettingsFields, sectionGroups, headerPreview} from './_common'

export const bulletListSection = defineType({
  name: 'bulletListSection',
  title: 'Lista con íconos',
  type: 'object',
  icon: UlistIcon,
  groups: sectionGroups,
  fields: [
    ...sectionHeaderFields.map((f) => ({...f, group: 'content'})),
    defineField({name: 'items', title: 'Ítems', type: 'array', of: [{type: 'card'}], group: 'content', description: 'Ej: los 5 bullets de «Why talk to us?»'}),
    defineField({name: 'cta', title: 'CTA', type: 'cta', group: 'content'}),
    ...sectionSettingsFields,
  ],
  preview: headerPreview('Lista con íconos'),
})
