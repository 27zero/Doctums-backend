import {defineField, defineType} from 'sanity'
import {EditIcon} from '@sanity/icons/Edit'
import {languageField, slugField, legacyUrlField, docGroups} from './_shared'

export const post = defineType({
  name: 'post',
  title: 'Artículo del blog',
  type: 'document',
  icon: EditIcon,
  groups: docGroups,
  fields: [
    languageField,
    defineField({name: 'title', title: 'Título', type: 'string', validation: (r) => r.required(), group: 'content'}),
    {...slugField(), group: 'content'},
    defineField({name: 'publishedAt', title: 'Fecha de publicación', type: 'datetime', initialValue: () => new Date().toISOString(), group: 'content'}),
    defineField({name: 'authors', title: 'Autores', type: 'array', of: [{type: 'reference', to: [{type: 'person'}]}], group: 'content', description: 'Usa "Doctums Team" para artículos institucionales'}),
    defineField({name: 'categories', title: 'Categorías', type: 'array', of: [{type: 'reference', to: [{type: 'blogCategory'}]}], group: 'content'}),
    defineField({name: 'featured', title: 'Destacado', type: 'boolean', initialValue: false, group: 'content'}),
    defineField({name: 'excerpt', title: 'Extracto', type: 'text', rows: 3, validation: (r) => r.max(300), group: 'content'}),
    defineField({name: 'mainImage', title: 'Imagen principal', type: 'imageWithAlt', group: 'content'}),
    defineField({name: 'body', title: 'Contenido', type: 'blockContent', group: 'content'}),
    defineField({name: 'related', title: 'Artículos relacionados', type: 'array', of: [{type: 'reference', to: [{type: 'post'}]}], validation: (r) => r.max(3), group: 'content'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
    legacyUrlField,
  ],
  orderings: [{title: 'Más recientes', name: 'publishedDesc', by: [{field: 'publishedAt', direction: 'desc'}]}],
  preview: {
    select: {title: 'title', author: 'authors.0.name', date: 'publishedAt', media: 'mainImage', lang: 'language'},
    prepare: ({title, author, date, media, lang}) => ({title, media, subtitle: [(lang || '').toUpperCase(), author, date && new Date(date).toLocaleDateString()].filter(Boolean).join(' · ')}),
  },
})
