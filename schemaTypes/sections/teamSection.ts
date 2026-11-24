import {defineField, defineType} from 'sanity'
import {UsersIcon} from '@sanity/icons/Users'
import {sectionHeaderFields, sectionSettingsFields, sectionGroups, headerPreview} from './_common'

export const teamSection = defineType({
  name: 'teamSection',
  title: 'Equipo',
  type: 'object',
  icon: UsersIcon,
  groups: sectionGroups,
  fields: [
    ...sectionHeaderFields.map((f) => ({...f, group: 'content'})),
    defineField({name: 'mode', title: 'Mostrar', type: 'string', options: {list: [{title: 'Todo el equipo (orden manual)', value: 'all'}, {title: 'Selección', value: 'selected'}]}, initialValue: 'all', group: 'content'}),
    defineField({name: 'members', title: 'Personas', type: 'array', of: [{type: 'reference', to: [{type: 'person'}]}], hidden: ({parent}) => parent?.mode !== 'selected', group: 'content'}),
    ...sectionSettingsFields,
  ],
  preview: headerPreview('Equipo'),
})
