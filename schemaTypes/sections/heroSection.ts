import {defineField, defineType} from 'sanity'
import {HomeIcon} from '@sanity/icons/Home'
import {sectionHeaderFields, sectionSettingsFields, sectionGroups, headerPreview} from './_common'

export const heroSection = defineType({
  name: 'heroSection',
  title: 'Hero',
  type: 'object',
  icon: HomeIcon,
  groups: sectionGroups,
  fields: [
    ...sectionHeaderFields.map((f) => ({...f, group: 'content'})),
    defineField({name: 'ctas', title: 'Botones', type: 'array', of: [{type: 'cta'}], group: 'content'}),
    defineField({name: 'image', title: 'Imagen / fondo', type: 'imageWithAlt', group: 'content'}),
    defineField({name: 'serviceCards', title: 'Tarjetas de servicio enlazadas', type: 'array', of: [{type: 'card'}], group: 'content', description: 'Ej: Advisory & Optimization · Tech Platform Implementation · AI Strategy & Platform'}),
    defineField({name: 'variant', title: 'Variante', type: 'string', options: {list: ['home', 'page', 'minimal']}, initialValue: 'page', group: 'settings'}),
    ...sectionSettingsFields,
  ],
  preview: headerPreview('Hero'),
})
