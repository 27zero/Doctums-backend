import {defineField, defineType} from 'sanity'
import {PackageIcon} from '@sanity/icons/Package'
import {sectionHeaderFields, sectionSettingsFields, sectionGroups, headerPreview} from './_common'

export const servicesListSection = defineType({
  name: 'servicesListSection',
  title: 'Lista de servicios',
  type: 'object',
  icon: PackageIcon,
  groups: sectionGroups,
  fields: [
    ...sectionHeaderFields.map((f) => ({...f, group: 'content'})),
    defineField({name: 'services', title: 'Servicios / plataformas', type: 'array', of: [{type: 'reference', to: [{type: 'servicePage'}, {type: 'partner'}]}], group: 'content'}),
    defineField({name: 'layout', title: 'Diseño', type: 'string', options: {list: ['cards', 'list', 'accordion']}, initialValue: 'cards', group: 'settings'}),
    ...sectionSettingsFields,
  ],
  preview: headerPreview('Lista de servicios'),
})
