import {defineField, defineType} from 'sanity'
import {StarIcon} from '@sanity/icons/Star'
import {sectionHeaderFields, sectionSettingsFields, sectionGroups, headerPreview} from './_common'

export const logoCloudSection = defineType({
  name: 'logoCloudSection',
  title: 'Logos de partners',
  type: 'object',
  icon: StarIcon,
  groups: sectionGroups,
  fields: [
    ...sectionHeaderFields.map((f) => ({...f, group: 'content'})),
    defineField({name: 'partners', title: 'Partners', type: 'array', of: [{type: 'reference', to: [{type: 'partner'}]}], group: 'content'}),
    ...sectionSettingsFields,
  ],
  preview: headerPreview('Logos de partners'),
})
