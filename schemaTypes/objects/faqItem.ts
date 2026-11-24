import {defineField, defineType} from 'sanity'

export const faqItem = defineType({
  name: 'faqItem',
  title: 'Pregunta',
  type: 'object',
  fields: [
    defineField({name: 'question', title: 'Pregunta', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'answer', title: 'Respuesta', type: 'blockContent'}),
  ],
  preview: {select: {title: 'question'}},
})
