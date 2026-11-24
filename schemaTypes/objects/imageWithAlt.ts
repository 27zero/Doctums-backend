import {defineField, defineType} from 'sanity'

export const imageWithAlt = defineType({
  name: 'imageWithAlt',
  title: 'Imagen',
  type: 'image',
  options: {hotspot: true},
  fields: [
    defineField({name: 'alt', title: 'Texto alternativo', type: 'string', validation: (r) => r.warning().required()}),
    defineField({name: 'caption', title: 'Pie de foto', type: 'string'}),
  ],
})
