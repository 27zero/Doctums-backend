import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {documentInternationalization} from '@sanity/document-internationalization'
import {schemaTypes} from './schemaTypes'
import {structure, SINGLETONS} from './structure'
import {LANGUAGES, I18N_TYPES} from './schemaTypes/languages'

const singletonTypes = new Set(SINGLETONS.map((s) => s.type))

export default defineConfig({
  name: 'default',
  title: 'Sanity Doctums',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'sodiif40',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [
    structureTool({structure}),
    visionTool({defaultApiVersion: '2024-10-01'}),
    documentInternationalization({
      supportedLanguages: LANGUAGES,
      schemaTypes: I18N_TYPES,
    }),
  ],

  schema: {
    types: schemaTypes,
    // No permitir crear singletons desde "Create new"
    templates: (templates) => templates.filter(({schemaType}) => !singletonTypes.has(schemaType)),
  },

  document: {
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({action}) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : input,
  },
})
