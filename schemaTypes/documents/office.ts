import {defineField, defineType} from 'sanity'
import {PinIcon} from '@sanity/icons/Pin'

export const office = defineType({
  name: 'office',
  title: 'Oficina',
  type: 'document',
  icon: PinIcon,
  fields: [
    defineField({name: 'country', title: 'País (EN)', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'countryEs', title: 'País (ES)', type: 'string'}),
    defineField({name: 'city', title: 'Ciudad', type: 'string'}),
    defineField({name: 'address', title: 'Dirección', type: 'text', rows: 2}),
    defineField({name: 'location', title: 'Coordenadas (mapa)', type: 'object', fields: [{name: 'lat', type: 'number'}, {name: 'lng', type: 'number'}]}),
    defineField({name: 'orderRank', title: 'Orden', type: 'number'}),
  ],
  preview: {select: {title: 'country', subtitle: 'city'}},
})
