import {defineField, defineType} from 'sanity'

export const cta = defineType({
  name: 'cta',
  title: 'Botón (CTA)',
  type: 'object',
  fields: [
    defineField({name: 'link', title: 'Enlace', type: 'link'}),
    defineField({
      name: 'style',
      title: 'Estilo',
      type: 'string',
      initialValue: 'primary',
      options: {list: ['primary', 'secondary', 'outline', 'text'], layout: 'radio', direction: 'horizontal'},
    }),
  ],
  preview: {select: {title: 'link.label', subtitle: 'style'}},
})
