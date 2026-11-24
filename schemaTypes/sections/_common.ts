import {defineField} from 'sanity'

// Campos compartidos por todas las secciones del page builder
export const sectionHeaderFields = [
  defineField({name: 'eyebrow', title: 'Antetítulo', type: 'string'}),
  defineField({name: 'heading', title: 'Título', type: 'string'}),
  defineField({name: 'intro', title: 'Introducción', type: 'blockContent'}),
]

export const sectionSettingsFields = [
  defineField({name: 'anchorId', title: 'ID de ancla', type: 'string', group: 'settings', description: 'Ej: global-reach → /about#global-reach'}),
  defineField({
    name: 'theme',
    title: 'Fondo',
    type: 'string',
    group: 'settings',
    initialValue: 'light',
    options: {list: ['light', 'dark', 'brand', 'muted'], layout: 'radio', direction: 'horizontal'},
  }),
  defineField({name: 'hidden', title: 'Ocultar sección', type: 'boolean', group: 'settings', initialValue: false}),
]

export const sectionGroups = [
  {name: 'content', title: 'Contenido', default: true},
  {name: 'settings', title: 'Ajustes'},
]

export const headerPreview = (subtitle: string) => ({
  select: {title: 'heading', eyebrow: 'eyebrow', hidden: 'hidden'},
  prepare: ({title, eyebrow, hidden}: {title?: string; eyebrow?: string; hidden?: boolean}) => ({
    title: title || eyebrow || '(sin título)',
    subtitle: `${hidden ? '🚫 Oculta · ' : ''}${subtitle}`,
  }),
})
