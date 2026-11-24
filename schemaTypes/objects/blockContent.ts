import {defineArrayMember, defineType} from 'sanity'

export const blockContent = defineType({
  name: 'blockContent',
  title: 'Contenido enriquecido',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
        {title: 'H4', value: 'h4'},
        {title: 'Cita', value: 'blockquote'},
      ],
      marks: {
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Enlace',
            fields: [
              {name: 'href', type: 'url', title: 'URL', validation: (r) => r.uri({allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel']})},
              {name: 'blank', type: 'boolean', title: 'Nueva pestaña'},
            ],
          },
          {
            name: 'internalLink',
            type: 'object',
            title: 'Enlace interno',
            fields: [{name: 'reference', type: 'reference', to: [{type: 'page'}, {type: 'servicePage'}, {type: 'post'}, {type: 'practiceArea'}]}],
          },
        ],
      },
    }),
    defineArrayMember({type: 'imageWithAlt'}),
    defineArrayMember({
      name: 'embed',
      title: 'Embed / Video',
      type: 'object',
      fields: [
        {name: 'url', type: 'url', title: 'URL (YouTube, Vimeo, etc.)'},
        {name: 'caption', type: 'string', title: 'Pie'},
      ],
    }),
    defineArrayMember({
      name: 'callout',
      title: 'Destacado',
      type: 'object',
      fields: [
        {name: 'tone', type: 'string', options: {list: ['info', 'tip', 'warning']}, initialValue: 'info'},
        {name: 'text', type: 'text', rows: 3},
      ],
    }),
  ],
})
