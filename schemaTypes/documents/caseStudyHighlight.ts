import {defineField, defineType} from 'sanity'
import {BulbOutlineIcon} from '@sanity/icons/BulbOutline'

// Webflow: colección "Case Study Highlights"
export const caseStudyHighlight = defineType({
  name: 'caseStudyHighlight',
  title: 'Highlight de caso',
  type: 'document',
  icon: BulbOutlineIcon,
  fields: [
    defineField({name: 'name', title: 'Highlight ID', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'name'}}),
    defineField({name: 'title', title: 'Highlight Title', type: 'string'}),
    defineField({name: 'image', title: 'Highlight Image', type: 'imageWithAlt'}),
    defineField({name: 'caseStudy', title: 'Case Study', type: 'reference', to: [{type: 'caseStudy'}]}),
    defineField({name: 'practiceArea', title: 'Área de práctica relacionada', type: 'reference', to: [{type: 'practiceArea'}]}),
    defineField({name: 'context', title: 'Context', type: 'text', rows: 4}),
    defineField({name: 'challenge', title: 'Challenge', type: 'text', rows: 4}),
    defineField({name: 'painPoints', title: 'Pain Points', type: 'text', rows: 4}),
    defineField({name: 'solution', title: 'Solution', type: 'text', rows: 4}),
    defineField({name: 'results', title: 'Results', type: 'text', rows: 4}),
    defineField({name: 'webflow', title: 'Webflow (migración)', type: 'webflowMeta', hidden: ({value}) => !value}),
  ],
  preview: {select: {title: 'title', subtitle: 'caseStudy.institution', media: 'image'}},
})
