import {defineField, defineType} from 'sanity'

export const navItem = defineType({
  name: 'navItem',
  title: 'Ítem de menú',
  type: 'object',
  fields: [
    defineField({name: 'label', title: 'Texto', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'link', title: 'Enlace directo', type: 'link', description: 'Déjalo vacío si es un mega-menú'}),
    defineField({name: 'columns', title: 'Columnas del mega-menú', type: 'array', of: [{type: 'linkGroup'}]}),
  ],
  preview: {select: {title: 'label', cols: 'columns'}, prepare: ({title, cols}) => ({title, subtitle: cols?.length ? `Mega-menú · ${cols.length} columnas` : 'Enlace'})},
})
