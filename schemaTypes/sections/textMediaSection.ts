import {defineField, defineType} from 'sanity'
import {ImageIcon} from '@sanity/icons/Image'
import {sectionHeaderFields, sectionSettingsFields, sectionGroups, headerPreview} from './_common'

export const textMediaSection = defineType({
  name: 'textMediaSection',
  title: 'Texto + imagen',
  type: 'object',
  icon: ImageIcon,
  groups: sectionGroups,
  fields: [
    ...sectionHeaderFields.map((f) => ({...f, group: 'content'})),
    defineField({name: 'body', title: 'Texto', type: 'blockContent', group: 'content'}),
    defineField({name: 'image', title: 'Imagen', type: 'imageWithAlt', group: 'content'}),
    defineField({name: 'ctas', title: 'Botones', type: 'array', of: [{type: 'cta'}], group: 'content'}),
    defineField({name: 'imagePosition', title: 'Posición de imagen', type: 'string', options: {list: ['left', 'right']}, initialValue: 'right', group: 'settings'}),
    ...sectionSettingsFields,
  ],
  preview: headerPreview('Texto + imagen'),
})
