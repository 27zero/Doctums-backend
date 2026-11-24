import {defineField, defineType} from 'sanity'

// Webflow: "Service Title N / Service Description N / Service Image N" (N = 1..8)
export const serviceItem = defineType({
  name: 'serviceItem',
  title: 'Ítem de servicio',
  type: 'object',
  fields: [
    defineField({name: 'title', title: 'Título', type: 'string'}),
    defineField({name: 'description', title: 'Descripción', type: 'blockContent'}),
    defineField({name: 'image', title: 'Imagen', type: 'imageWithAlt'}),
  ],
  preview: {select: {title: 'title', media: 'image'}},
})
