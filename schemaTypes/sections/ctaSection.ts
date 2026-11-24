import {defineField, defineType} from 'sanity'
import {BulbOutlineIcon} from '@sanity/icons/BulbOutline'
import {sectionHeaderFields, sectionSettingsFields, sectionGroups, headerPreview} from './_common'

export const ctaSection = defineType({
  name: 'ctaSection',
  title: 'Llamado a la acción',
  type: 'object',
  icon: BulbOutlineIcon,
  groups: sectionGroups,
  fields: [
    ...sectionHeaderFields.map((f) => ({...f, group: 'content'})),
    defineField({name: 'body', title: 'Texto', type: 'blockContent', group: 'content'}),
    defineField({name: 'bullets', title: 'Bullets', type: 'array', of: [{type: 'card'}], group: 'content'}),
    defineField({name: 'ctas', title: 'Botones', type: 'array', of: [{type: 'cta'}], group: 'content'}),
    ...sectionSettingsFields,
  ],
  preview: headerPreview('Llamado a la acción'),
})
