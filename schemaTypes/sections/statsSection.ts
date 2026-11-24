import {defineField, defineType} from 'sanity'
import {BarChartIcon} from '@sanity/icons/BarChart'
import {sectionHeaderFields, sectionSettingsFields, sectionGroups, headerPreview} from './_common'

export const statsSection = defineType({
  name: 'statsSection',
  title: 'Cifras',
  type: 'object',
  icon: BarChartIcon,
  groups: sectionGroups,
  fields: [
    ...sectionHeaderFields.map((f) => ({...f, group: 'content'})),
    defineField({name: 'stats', title: 'Cifras', type: 'array', of: [{type: 'stat'}], group: 'content'}),
    ...sectionSettingsFields,
  ],
  preview: headerPreview('Cifras'),
})
