import {defineField, defineType} from 'sanity'

// Webflow (Practice Areas): "Highlight N / Highlight Image N" (N = 1..6)
export const highlight = defineType({
  name: 'highlight',
  title: 'Highlight',
  type: 'object',
  fields: [
    defineField({name: 'text', title: 'Texto', type: 'blockContent'}),
    defineField({name: 'image', title: 'Imagen', type: 'imageWithAlt'}),
  ],
  preview: {
    select: {text: 'text', media: 'image'},
    prepare: ({text, media}) => ({title: text?.[0]?.children?.map((c: any) => c.text).join('') || 'Highlight', media}),
  },
})
