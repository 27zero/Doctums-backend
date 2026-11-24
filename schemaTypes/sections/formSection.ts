import {defineField, defineType} from 'sanity'
import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {sectionHeaderFields, sectionSettingsFields, sectionGroups, headerPreview} from './_common'

export const formSection = defineType({
  name: 'formSection',
  title: 'Formulario',
  type: 'object',
  icon: EnvelopeIcon,
  groups: sectionGroups,
  fields: [
    ...sectionHeaderFields.map((f) => ({...f, group: 'content'})),
    defineField({name: 'formType', title: 'Tipo', type: 'string', options: {list: [{title: 'Contacto (HubSpot)', value: 'hubspot'}, {title: 'Newsletter', value: 'newsletter'}, {title: 'Agendar (calendario)', value: 'calendar'}]}, initialValue: 'hubspot', group: 'content'}),
    defineField({name: 'hubspotPortalId', title: 'HubSpot Portal ID', type: 'string', group: 'content'}),
    defineField({name: 'hubspotFormId', title: 'HubSpot Form ID', type: 'string', group: 'content'}),
    defineField({name: 'calendarUrl', title: 'URL del calendario', type: 'url', group: 'content'}),
    defineField({name: 'successMessage', title: 'Mensaje de éxito', type: 'string', group: 'content'}),
    defineField({name: 'errorMessage', title: 'Mensaje de error', type: 'string', group: 'content'}),
    defineField({name: 'image', title: 'Imagen', type: 'imageWithAlt', group: 'content'}),
    ...sectionSettingsFields,
  ],
  preview: headerPreview('Formulario'),
})
