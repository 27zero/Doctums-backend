import {defineField, defineType} from 'sanity'
import {OlistIcon} from '@sanity/icons/Olist'
import {sectionHeaderFields, sectionSettingsFields, sectionGroups, headerPreview} from './_common'

export const stepsSection = defineType({
  name: 'stepsSection',
  title: 'Pasos',
  type: 'object',
  icon: OlistIcon,
  groups: sectionGroups,
  fields: [
    ...sectionHeaderFields.map((f) => ({...f, group: 'content'})),
    defineField({name: 'steps', title: 'Pasos', type: 'array', of: [{type: 'card'}], group: 'content'}),
    ...sectionSettingsFields,
  ],
  preview: headerPreview('Pasos'),
})
