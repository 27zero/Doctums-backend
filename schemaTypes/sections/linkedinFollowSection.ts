import {defineField, defineType} from 'sanity'
import {ShareIcon} from '@sanity/icons/Share'
import {sectionHeaderFields, sectionSettingsFields, sectionGroups, headerPreview} from './_common'

export const linkedinFollowSection = defineType({
  name: 'linkedinFollowSection',
  title: 'Síguenos en LinkedIn',
  type: 'object',
  icon: ShareIcon,
  groups: sectionGroups,
  fields: [
    ...sectionHeaderFields.map((f) => ({...f, group: 'content'})),
    defineField({name: 'cta', title: 'CTA', type: 'cta', group: 'content'}),
    ...sectionSettingsFields,
  ],
  preview: headerPreview('Síguenos en LinkedIn'),
})
