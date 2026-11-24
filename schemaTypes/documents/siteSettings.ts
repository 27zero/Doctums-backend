import {defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons/Cog'
import {singletonLanguageField as languageField} from './_shared'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Ajustes del sitio',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'general', title: 'General', default: true},
    {name: 'announcement', title: 'Barra de anuncio'},
    {name: 'contact', title: 'Contacto'},
    {name: 'integrations', title: 'Integraciones'},
    {name: 'seo', title: 'SEO por defecto'},
  ],
  fields: [
    languageField,
    defineField({name: 'title', title: 'Nombre del sitio', type: 'string', group: 'general'}),
    defineField({name: 'tagline', title: 'Tagline', type: 'string', group: 'general'}),
    defineField({name: 'logo', title: 'Logo', type: 'image', group: 'general'}),
    defineField({name: 'logoDark', title: 'Logo (fondo oscuro)', type: 'image', group: 'general'}),
    defineField({name: 'favicon', title: 'Favicon', type: 'image', group: 'general'}),
    defineField({name: 'homePage', title: 'Página de inicio', type: 'reference', to: [{type: 'page'}], group: 'general'}),
    defineField({name: 'blogPage', title: 'Página del blog', type: 'reference', to: [{type: 'page'}], group: 'general'}),

    defineField({
      name: 'announcement',
      title: 'Anuncio',
      type: 'object',
      group: 'announcement',
      fields: [
        {name: 'enabled', title: 'Activo', type: 'boolean', initialValue: false},
        {name: 'text', title: 'Texto', type: 'string'},
        {name: 'cta', title: 'CTA', type: 'cta'},
      ],
    }),

    defineField({name: 'email', title: 'Email de contacto', type: 'string', group: 'contact'}),
    defineField({name: 'phone', title: 'Teléfono', type: 'string', group: 'contact'}),
    defineField({name: 'socialLinks', title: 'Redes sociales', type: 'array', of: [{type: 'socialLink'}], group: 'contact'}),
    defineField({name: 'contactCta', title: 'CTA global de contacto', type: 'cta', group: 'contact', description: 'Botón "Contact us" del header'}),
    defineField({name: 'bookingUrl', title: 'URL para agendar llamada', type: 'url', group: 'contact'}),

    defineField({name: 'gtmId', title: 'Google Tag Manager ID', type: 'string', group: 'integrations'}),
    defineField({name: 'hubspotPortalId', title: 'HubSpot Portal ID', type: 'string', group: 'integrations'}),
    defineField({name: 'newsletterFormId', title: 'HubSpot Form ID (newsletter)', type: 'string', group: 'integrations'}),

    defineField({name: 'seo', title: 'SEO por defecto', type: 'seo', group: 'seo'}),
  ],
  preview: {select: {lang: 'language'}, prepare: ({lang}) => ({title: `Ajustes del sitio (${(lang || '').toUpperCase()})`})},
})
