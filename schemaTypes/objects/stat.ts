import {defineField, defineType} from 'sanity'

export const stat = defineType({
  name: 'stat',
  title: 'Cifra',
  type: 'object',
  fields: [
    defineField({name: 'value', title: 'Valor', type: 'string', description: 'Ej: 100+, 20+, 50%'}),
    defineField({name: 'label', title: 'Etiqueta', type: 'string'}),
    defineField({name: 'description', title: 'Descripción', type: 'text', rows: 2}),
  ],
  preview: {select: {title: 'value', subtitle: 'label'}},
})
