import {defineField, defineType} from 'sanity'
import {BookIcon} from '@sanity/icons/Book'
import {sectionHeaderFields, sectionSettingsFields, sectionGroups, headerPreview} from './_common'

export const blogFeedSection = defineType({
  name: 'blogFeedSection',
  title: 'Blog & Insights',
  type: 'object',
  icon: BookIcon,
  groups: sectionGroups,
  fields: [
    ...sectionHeaderFields.map((f) => ({...f, group: 'content'})),
    defineField({name: 'showCategories', title: 'Mostrar categorías', type: 'boolean', initialValue: true, group: 'content'}),
    defineField({name: 'mode', title: 'Artículos', type: 'string', options: {list: [{title: 'Últimos', value: 'latest'}, {title: 'Destacados (manual)', value: 'manual'}, {title: 'Por categoría', value: 'category'}]}, initialValue: 'latest', group: 'content'}),
    defineField({name: 'posts', title: 'Artículos', type: 'array', of: [{type: 'reference', to: [{type: 'post'}]}], hidden: ({parent}) => parent?.mode !== 'manual', group: 'content'}),
    defineField({name: 'category', title: 'Categoría', type: 'reference', to: [{type: 'blogCategory'}], hidden: ({parent}) => parent?.mode !== 'category', group: 'content'}),
    defineField({name: 'limit', title: 'Cantidad', type: 'number', initialValue: 3, group: 'content'}),
    defineField({name: 'cta', title: 'CTA', type: 'cta', group: 'content'}),
    defineField({name: 'showNewsletter', title: 'Mostrar formulario newsletter', type: 'boolean', initialValue: true, group: 'content'}),
    ...sectionSettingsFields,
  ],
  preview: headerPreview('Blog & Insights'),
})
