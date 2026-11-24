import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'

export const link = defineType({
  name: 'link',
  title: 'Enlace',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({name: 'label', title: 'Texto', type: 'string'}),
    defineField({
      name: 'linkType',
      title: 'Tipo',
      type: 'string',
      initialValue: 'internal',
      options: {list: [{title: 'Interno', value: 'internal'}, {title: 'Externo', value: 'external'}, {title: 'Email', value: 'email'}], layout: 'radio', direction: 'horizontal'},
    }),
    defineField({
      name: 'internal',
      title: 'Documento interno',
      type: 'reference',
      to: [{type: 'page'}, {type: 'servicePage'}, {type: 'post'}, {type: 'practiceArea'}, {type: 'practiceAreaCategory'}, {type: 'blogCategory'}, {type: 'partner'}],
      hidden: ({parent}) => parent?.linkType !== 'internal',
    }),
    defineField({name: 'anchor', title: 'Ancla (#seccion)', type: 'string', hidden: ({parent}) => parent?.linkType !== 'internal'}),
    defineField({
      name: 'external',
      title: 'URL externa',
      type: 'url',
      validation: (r) => r.uri({allowRelative: true, scheme: ['http', 'https']}),
      hidden: ({parent}) => parent?.linkType !== 'external',
    }),
    defineField({name: 'email', title: 'Email', type: 'string', hidden: ({parent}) => parent?.linkType !== 'email'}),
    defineField({name: 'openInNewTab', title: 'Abrir en nueva pestaña', type: 'boolean', initialValue: false}),
  ],
  preview: {
    select: {title: 'label', ext: 'external', int: 'internal.title', email: 'email'},
    prepare: ({title, ext, int, email}) => ({title: title || 'Enlace', subtitle: int || ext || email}),
  },
})
