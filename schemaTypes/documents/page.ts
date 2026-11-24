import {defineField, defineType} from 'sanity'
import {DocumentIcon} from '@sanity/icons/Document'
import {pageBuilderMembers} from '../sections'
import {languageField, slugField, legacyUrlField, docGroups} from './_shared'

// Páginas generales: Home, About, Team, For EdTechs, Talk to us, Blog, Careers, Security, Privacy...
export const page = defineType({
  name: 'page',
  title: 'Página',
  type: 'document',
  icon: DocumentIcon,
  groups: docGroups,
  fields: [
    languageField,
    defineField({name: 'title', title: 'Título interno', type: 'string', validation: (r) => r.required(), group: 'content'}),
    {...slugField(), group: 'content', description: 'Usa "home" para la página de inicio'},
    defineField({name: 'sections', title: 'Secciones', type: 'array', of: pageBuilderMembers, group: 'content'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
    legacyUrlField,
  ],
  preview: {select: {title: 'title', slug: 'slug.current', lang: 'language'}, prepare: ({title, slug, lang}) => ({title, subtitle: `${(lang || '').toUpperCase()} · /${slug || ''}`})},
})
