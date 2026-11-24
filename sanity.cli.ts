import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'sodiif40',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  studioHost: 'doctums',
  deployment: {
    autoUpdates: true,
  },
})
