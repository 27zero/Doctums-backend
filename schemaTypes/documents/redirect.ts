import {defineField, defineType} from 'sanity'
import {ArrowRightIcon} from '@sanity/icons/ArrowRight'

// Redirecciones 301 desde las URLs de Webflow
export const redirect = defineType({
  name: 'redirect',
  title: 'Redirección',
  type: 'document',
  icon: ArrowRightIcon,
  fields: [
    defineField({name: 'source', title: 'Desde', type: 'string', validation: (r) => r.required().custom((v) => (v?.startsWith('/') ? true : 'Debe empezar con /'))}),
    defineField({name: 'destination', title: 'Hacia', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'permanent', title: 'Permanente (301)', type: 'boolean', initialValue: true}),
    defineField({name: 'note', title: 'Nota', type: 'string'}),
  ],
  preview: {select: {title: 'source', subtitle: 'destination'}},
})
