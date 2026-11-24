import {defineField, defineType} from 'sanity'

export const socialLink = defineType({
  name: 'socialLink',
  title: 'Red social',
  type: 'object',
  fields: [
    defineField({name: 'platform', title: 'Plataforma', type: 'string', options: {list: ['linkedin', 'youtube', 'x', 'instagram', 'facebook']}}),
    defineField({name: 'url', title: 'URL', type: 'url'}),
  ],
  preview: {select: {title: 'platform', subtitle: 'url'}},
})
