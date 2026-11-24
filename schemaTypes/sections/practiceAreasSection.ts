import {defineField, defineType} from 'sanity'
import {TagsIcon} from '@sanity/icons/Tags'
import {sectionHeaderFields, sectionSettingsFields, sectionGroups, headerPreview} from './_common'

export const practiceAreasSection = defineType({
  name: 'practiceAreasSection',
  title: 'Áreas de práctica',
  type: 'object',
  icon: TagsIcon,
  groups: sectionGroups,
  fields: [
    ...sectionHeaderFields.map((f) => ({...f, group: 'content'})),
    defineField({name: 'categories', title: 'Categorías', type: 'array', of: [{type: 'reference', to: [{type: 'practiceAreaCategory'}]}], group: 'content'}),
    defineField({name: 'cta', title: 'CTA', type: 'cta', group: 'content'}),
    ...sectionSettingsFields,
  ],
  preview: headerPreview('Áreas de práctica'),
})
