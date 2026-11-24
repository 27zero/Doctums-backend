import {defineField, defineType} from 'sanity'

// Grupo de enlaces (columnas del mega-menú y del footer)
export const linkGroup = defineType({
  name: 'linkGroup',
  title: 'Grupo de enlaces',
  type: 'object',
  fields: [
    defineField({name: 'title', title: 'Título', type: 'string'}),
    defineField({name: 'link', title: 'Enlace del título (opcional)', type: 'link'}),
    defineField({name: 'links', title: 'Enlaces', type: 'array', of: [{type: 'link'}]}),
  ],
  preview: {select: {title: 'title', links: 'links'}, prepare: ({title, links}) => ({title, subtitle: `${links?.length || 0} enlaces`})},
})
