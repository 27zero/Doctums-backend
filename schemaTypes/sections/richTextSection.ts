import {defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {sectionHeaderFields, sectionSettingsFields, sectionGroups, headerPreview} from './_common'

export const richTextSection = defineType({
  name: 'richTextSection',
  title: 'Texto enriquecido',
  type: 'object',
  icon: DocumentTextIcon,
  groups: sectionGroups,
  fields: [
    ...sectionHeaderFields.map((f) => ({...f, group: 'content'})),
    defineField({name: 'body', title: 'Texto', type: 'blockContent', group: 'content'}),
    ...sectionSettingsFields,
  ],
  preview: headerPreview('Texto enriquecido'),
})
