import {defineField, defineType} from 'sanity'

// Trazabilidad de la migración: IDs y campos originales de Webflow
export const webflowMeta = defineType({
  name: 'webflowMeta',
  title: 'Webflow (migración)',
  type: 'object',
  readOnly: true,
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({name: 'itemId', title: 'Item ID', type: 'string'}),
    defineField({name: 'collectionId', title: 'Collection ID', type: 'string'}),
    defineField({name: 'collection', title: 'Colección', type: 'string'}),
    defineField({name: 'createdOn', title: 'Created On', type: 'string'}),
    defineField({name: 'updatedOn', title: 'Updated On', type: 'string'}),
    defineField({name: 'publishedOn', title: 'Published On', type: 'string'}),
    defineField({name: 'draft', title: 'Draft', type: 'boolean'}),
    defineField({name: 'archived', title: 'Archived', type: 'boolean'}),
    defineField({name: 'raw', title: 'Campos sin mapear (JSON)', type: 'text', rows: 6}),
  ],
})
