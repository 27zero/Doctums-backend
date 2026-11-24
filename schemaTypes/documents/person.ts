import {defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons/User'

// Miembros del equipo y autores del blog
export const person = defineType({
  name: 'person',
  title: 'Persona',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({name: 'name', title: 'Nombre', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'name'}}),
    defineField({name: 'role', title: 'Cargo (EN)', type: 'string'}),
    defineField({name: 'roleEs', title: 'Cargo (ES)', type: 'string'}),
    defineField({name: 'photo', title: 'Foto', type: 'imageWithAlt'}),
    defineField({name: 'bio', title: 'Bio (EN)', type: 'blockContent'}),
    defineField({name: 'bioEs', title: 'Bio (ES)', type: 'blockContent'}),
    defineField({name: 'linkedin', title: 'LinkedIn', type: 'url'}),
    defineField({name: 'isTeamMember', title: 'Mostrar en /team', type: 'boolean', initialValue: false}),
    defineField({name: 'isOrganization', title: 'Es autor institucional (Doctums Team)', type: 'boolean', initialValue: false}),
    defineField({name: 'orderRank', title: 'Orden en el equipo', type: 'number'}),
  ],
  orderings: [{title: 'Orden', name: 'order', by: [{field: 'orderRank', direction: 'asc'}]}],
  preview: {select: {title: 'name', subtitle: 'role', media: 'photo'}},
})
