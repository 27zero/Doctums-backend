import {defineField, defineType} from 'sanity'

// Tarjeta genérica: servicios, features "Why Teams Choose Doctums", ofertas IA, plataformas...
export const card = defineType({
  name: 'card',
  title: 'Tarjeta',
  type: 'object',
  fields: [
    defineField({name: 'icon', title: 'Ícono', type: 'image'}),
    defineField({name: 'image', title: 'Imagen', type: 'imageWithAlt'}),
    defineField({name: 'eyebrow', title: 'Antetítulo', type: 'string'}),
    defineField({name: 'title', title: 'Título', type: 'string'}),
    defineField({name: 'description', title: 'Descripción', type: 'blockContent'}),
    defineField({name: 'items', title: 'Lista', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'cta', title: 'CTA', type: 'cta'}),
  ],
  preview: {select: {title: 'title', subtitle: 'eyebrow', media: 'image'}},
})
