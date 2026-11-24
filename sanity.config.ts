import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {documentInternationalization} from '@sanity/document-internationalization'
import {schemaTypes} from './schemaTypes'
import {structure, SINGLETONS, WEBFLOW_COLLECTION_IDS} from './structure'

const wf = (collectionId: string, collection: string) => ({_type: 'webflowMeta', collectionId, collection})
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
    templates: (templates) => [
      ...templates.filter(({schemaType}) => !singletonTypes.has(schemaType)),
      // Plantillas de las colecciones "CMS Collections" que comparten tipo (ver structure/index.ts)
      {id: 'team-member', title: 'Team Member', schemaType: 'person', value: {isTeamMember: true}},
      // Servicios: una plantilla por idioma (advisory-service-en, advisory-service-es, …)
      ...LANGUAGES.flatMap((l) => [
        {
          id: `advisory-service-${l.id}`,
          title: `Advisory Service (${l.id.toUpperCase()})`,
          schemaType: 'servicePage',
          value: {language: l.id, serviceGroup: 'advisory', parent: {_type: 'reference', _ref: 'svc-advisory'}, webflow: wf(WEBFLOW_COLLECTION_IDS.advisoryServices, 'For institutions - Advisory Services')},
        },
        {
          id: `ellucian-service-${l.id}`,
          title: `Ellucian Implementation Service (${l.id.toUpperCase()})`,
          schemaType: 'servicePage',
          value: {language: l.id, serviceGroup: 'platform', parent: {_type: 'reference', _ref: 'svc-platform'}, webflow: wf(WEBFLOW_COLLECTION_IDS.ellucianServices, 'For institutions - Ellucian Implementation Services')},
        },
      ]),
      {id: 'solution', title: 'Solution', schemaType: 'partner', value: {hasLandingPage: true, kind: 'strategic', webflow: wf(WEBFLOW_COLLECTION_IDS.solutions, 'For institutions - Solutions')}},
    ],
  },

  document: {
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({action}) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : input,
  },
})
