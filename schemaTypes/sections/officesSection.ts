import {defineField, defineType} from 'sanity'
import {EarthGlobeIcon} from '@sanity/icons/EarthGlobe'
import {sectionHeaderFields, sectionSettingsFields, sectionGroups, headerPreview} from './_common'

export const officesSection = defineType({
  name: 'officesSection',
  title: 'Global reach / Oficinas',
  type: 'object',
  icon: EarthGlobeIcon,
  groups: sectionGroups,
  fields: [
    ...sectionHeaderFields.map((f) => ({...f, group: 'content'})),
    defineField({name: 'body', title: 'Texto', type: 'blockContent', group: 'content'}),
    defineField({name: 'offices', title: 'Oficinas', type: 'array', of: [{type: 'reference', to: [{type: 'office'}]}], group: 'content'}),
    defineField({name: 'showMap', title: 'Mostrar mapa', type: 'boolean', initialValue: true, group: 'settings'}),
    ...sectionSettingsFields,
  ],
  preview: headerPreview('Global reach / Oficinas'),
})
