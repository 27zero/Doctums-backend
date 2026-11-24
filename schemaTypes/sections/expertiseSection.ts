import {defineField, defineType} from 'sanity'
import {ThListIcon} from '@sanity/icons/ThList'
import {sectionHeaderFields, sectionSettingsFields, sectionGroups, headerPreview} from './_common'

export const expertiseSection = defineType({
  name: 'expertiseSection',
  title: 'Columnas de expertise',
  type: 'object',
  icon: ThListIcon,
  groups: sectionGroups,
  fields: [
    ...sectionHeaderFields.map((f) => ({...f, group: 'content'})),
    defineField({name: 'columns', title: 'Columnas', type: 'array', of: [{type: 'linkGroup'}], group: 'content', description: 'Functional Knowledge · Technical Expertise · Business Acumen'}),
    ...sectionSettingsFields,
  ],
  preview: headerPreview('Columnas de expertise'),
})
