import {defineField, defineType} from 'sanity'
import {CaseIcon} from '@sanity/icons/Case'
import {sectionHeaderFields, sectionSettingsFields, sectionGroups, headerPreview} from './_common'

export const caseStudiesSection = defineType({
  name: 'caseStudiesSection',
  title: 'Casos de clientes',
  type: 'object',
  icon: CaseIcon,
  groups: sectionGroups,
  fields: [
    ...sectionHeaderFields.map((f) => ({...f, group: 'content'})),
    defineField({name: 'items', title: 'Casos', type: 'array', of: [{type: 'reference', to: [{type: 'caseStudy'}]}], group: 'content'}),
    ...sectionSettingsFields,
  ],
  preview: headerPreview('Casos de clientes'),
})
