import type {StructureResolver, StructureBuilder, StructureResolverContext} from 'sanity/structure'
import {map, catchError, startWith} from 'rxjs'
import {of} from 'rxjs'
import {CogIcon} from '@sanity/icons/Cog'
import {MenuIcon} from '@sanity/icons/Menu'
import {BlockElementIcon} from '@sanity/icons/BlockElement'
import {DocumentIcon} from '@sanity/icons/Document'
import {PackageIcon} from '@sanity/icons/Package'
import {EditIcon} from '@sanity/icons/Edit'
import {TagIcon} from '@sanity/icons/Tag'
import {UserIcon} from '@sanity/icons/User'
import {UsersIcon} from '@sanity/icons/Users'
import {TagsIcon} from '@sanity/icons/Tags'
import {FolderIcon} from '@sanity/icons/Folder'
import {StarIcon} from '@sanity/icons/Star'
import {CaseIcon} from '@sanity/icons/Case'
import {SparklesIcon} from '@sanity/icons/Sparkles'
import {BulbOutlineIcon} from '@sanity/icons/BulbOutline'
import {RocketIcon} from '@sanity/icons/Rocket'
import {ThListIcon} from '@sanity/icons/ThList'
import {PinIcon} from '@sanity/icons/Pin'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {ArrowRightIcon} from '@sanity/icons/ArrowRight'
import {EarthGlobeIcon} from '@sanity/icons/EarthGlobe'
import {LANGUAGES} from '../schemaTypes/languages'

// ─────────────────────────────────────────────────────────────────────────────
// Colecciones CMS — mismo nombre y orden que en el CMS de Webflow
// ─────────────────────────────────────────────────────────────────────────────
export type CmsCollection = {
  id: string
  title: string
  type: string
  /** Filtro GROQ adicional (sobre _type) para colecciones que comparten tipo */
  filter?: string
  icon: any
  /** Templates para el botón "+" de la lista */
  templates?: string[]
  ordering?: {field: string; direction: 'asc' | 'desc'}[]
}

// IDs de colección de Webflow (se guardan en el campo webflow.collectionId de cada ítem)
export const WEBFLOW_COLLECTION_IDS = {
  advisoryServices: '678c05bb0a39bf1dec22829b',
  ellucianServices: '678bfcdbec8afcb96a8b6847',
  solutions: '678c1765e5fec0b1f9f2e2d2',
}

const byOrder = [{field: 'orderRank', direction: 'asc' as const}]

export const CMS_COLLECTIONS: CmsCollection[] = [
  {id: 'practice-area-categories', title: 'Practice Area Categories', type: 'practiceAreaCategory', icon: FolderIcon, ordering: byOrder},
  {id: 'practice-areas', title: 'Practice Areas', type: 'practiceArea', icon: TagsIcon, ordering: byOrder},
  {id: 'case-study-highlights', title: 'Case Study Highlights', type: 'caseStudyHighlight', icon: SparklesIcon},
  {id: 'case-studies', title: 'Case Studies', type: 'caseStudy', icon: CaseIcon, ordering: byOrder},
  {
    id: 'team-members',
    title: 'Team Members',
    type: 'person',
    filter: 'isTeamMember == true',
    icon: UsersIcon,
    templates: ['team-member'],
    ordering: byOrder,
  },
  {
    id: 'advisory-services',
    title: 'For institutions - Advisory Services',
    type: 'servicePage',
    filter: `webflow.collectionId == "${WEBFLOW_COLLECTION_IDS.advisoryServices}"`,
    icon: BulbOutlineIcon,
    templates: ['advisory-service'],
    ordering: byOrder,
  },
  {
    id: 'solutions',
    title: 'For institutions - Solutions',
    type: 'partner',
    filter: `webflow.collectionId == "${WEBFLOW_COLLECTION_IDS.solutions}"`,
    icon: RocketIcon,
    templates: ['solution'],
    ordering: byOrder,
  },
  {
    id: 'ellucian-implementation-services',
    title: 'For institutions - Ellucian Implementation Services',
    type: 'servicePage',
    filter: `webflow.collectionId == "${WEBFLOW_COLLECTION_IDS.ellucianServices}"`,
    icon: PackageIcon,
    templates: ['ellucian-service'],
    ordering: byOrder,
  },
  {id: 'blog-categories', title: 'Blog Categories', type: 'blogCategory', icon: TagIcon, ordering: byOrder},
  {
    id: 'blogs',
    title: 'Blogs',
    type: 'post',
    icon: EditIcon,
    ordering: [{field: 'publishedAt', direction: 'desc'}],
  },
  {
    id: 'partners',
    title: 'Partners',
    type: 'partner',
    filter: `!(webflow.collectionId == "${WEBFLOW_COLLECTION_IDS.solutions}")`,
    icon: StarIcon,
    ordering: byOrder,
  },
]

const filterFor = (c: CmsCollection) => `_type == "${c.type}"${c.filter ? ` && ${c.filter}` : ''}`

// Tipos con versión EN / ES (@sanity/document-internationalization)
const I18N = new Set(['servicePage', 'post', 'practiceArea', 'practiceAreaCategory', 'blogCategory', 'faq', 'page'])
const isI18n = (c: CmsCollection) => I18N.has(c.type)

// Cuenta ítems como Webflow: cada documento una sola vez (publicado o solo borrador),
// sin contar versiones de Releases.
const countExpr = (f: string) =>
  `count(*[${f} && !(_id in path("drafts.**")) && !(_id in path("versions.**"))]) + count(*[${f} && _id in path("drafts.**") && !defined(*[_id == string::split(^._id, "drafts.")[1] && ${f}][0]._id)])`

const countQuery = () =>
  `{${CMS_COLLECTIONS.flatMap((c) => {
    const f = filterFor(c)
    const entries = [`"${c.id}": ${countExpr(f)}`]
    if (isI18n(c)) LANGUAGES.forEach((l) => entries.push(`"${c.id}__${l.id}": ${countExpr(`${f} && language == "${l.id}"`)}`))
    return entries
  }).join(',')}}`

const itemsLabel = (n?: number) => (n === undefined ? '' : n === 0 ? 'No items' : n === 1 ? '1 item' : `${n} items`)
const withCount = (title: string, n?: number) => (n === undefined ? title : `${title}  ·  ${itemsLabel(n)}`)

const ordered = (list: any, c: CmsCollection) => (c.ordering ? list.defaultOrdering(c.ordering) : list)

// Plantillas del botón "+": para tipos traducibles, una por idioma (`<template>-en`, `<template>-es`)
const templatesFor = (S: StructureBuilder, c: CmsCollection, lang?: string) => {
  const langs = lang ? [lang] : LANGUAGES.map((l) => l.id)
  if (c.templates) {
    return c.templates.flatMap((t) => (isI18n(c) ? langs.map((l) => S.initialValueTemplateItem(`${t}-${l}`)) : [S.initialValueTemplateItem(t)]))
  }
  return isI18n(c) ? langs.map((l) => S.initialValueTemplateItem(`${c.type}-${l}`)) : [S.initialValueTemplateItem(c.type)]
}

const collectionItem = (S: StructureBuilder, c: CmsCollection, counts: Record<string, number>) => {
  const base = S.documentList().schemaType(c.type).apiVersion('2024-10-01')

  // Colecciones sin idioma (Team Members, Case Studies, Solutions, Partners…): lista directa
  const child = !isI18n(c)
    ? ordered(base.id(c.id).title(c.title).filter(filterFor(c)), c).initialValueTemplates(templatesFor(S, c))
    : // Colecciones traducibles: English (US) / Español (LATAM) / Todos
      S.list()
        .id(c.id)
        .title(c.title)
        .items([
          ...LANGUAGES.map((l) =>
            S.listItem()
              .id(`${c.id}-${l.id}`)
              .title(withCount(l.title, counts[`${c.id}__${l.id}`]))
              .icon(EarthGlobeIcon)
              .child(
                ordered(
                  S.documentList()
                    .id(`${c.id}-${l.id}`)
                    .title(`${c.title} · ${l.id.toUpperCase()}`)
                    .schemaType(c.type)
                    .apiVersion('2024-10-01')
                    .filter(`${filterFor(c)} && language == $lang`)
                    .params({lang: l.id}),
                  c,
                ).initialValueTemplates(templatesFor(S, c, l.id)),
              ),
          ),
          S.divider(),
          S.listItem()
            .id(`${c.id}-all`)
            .title(withCount('Todos', counts[c.id]))
            .child(
              ordered(base.id(`${c.id}-all`).title(`${c.title} · Todos`).filter(filterFor(c)), c).initialValueTemplates(
                templatesFor(S, c),
              ),
            ),
        ])

  return S.listItem().id(c.id).title(withCount(c.title, counts[c.id])).icon(c.icon).schemaType(c.type).child(child)
}

// ─────────────────────────────────────────────────────────────────────────────
// Sitio (lo que en Webflow vive en Pages / Settings, no en el CMS)
// ─────────────────────────────────────────────────────────────────────────────

// Singletons por idioma: IDs fijos  siteSettings-en, siteSettings-es, navigation-en, ...
export const SINGLETONS = [
  {type: 'siteSettings', title: 'Ajustes del sitio', icon: CogIcon},
  {type: 'navigation', title: 'Navegación (header)', icon: MenuIcon},
  {type: 'footer', title: 'Footer', icon: BlockElementIcon},
]

const singletonsForLang = (S: StructureBuilder, lang: string) =>
  SINGLETONS.map(({type, title, icon}) =>
    S.listItem()
      .title(title)
      .icon(icon)
      .id(`${type}-${lang}`)
      .child(
        S.document()
          .schemaType(type)
          .documentId(`${type}-${lang}`)
          .title(`${title} (${lang.toUpperCase()})`),
      ),
  )

const byLanguage = (S: StructureBuilder, type: string, title: string, icon: any) =>
  S.listItem()
    .title(title)
    .icon(icon)
    .child(
      S.list()
        .title(title)
        .items([
          ...LANGUAGES.map((l) =>
            S.listItem()
              .title(l.title)
              .icon(EarthGlobeIcon)
              .child(
                S.documentList()
                  .title(`${title} · ${l.id.toUpperCase()}`)
                  .schemaType(type)
                  .filter('_type == $type && language == $lang')
                  .params({type, lang: l.id})
                  .initialValueTemplates([S.initialValueTemplateItem(`${type}-${l.id}`)]),
              ),
          ),
          S.divider(),
          S.listItem().title('Todos').child(S.documentTypeList(type).title(`${title} · Todos`)),
        ]),
    )

const buildRoot = (S: StructureBuilder, counts: Record<string, number> = {}) =>
  S.list()
    .title('Doctums')
    .items([
      S.divider().title('CMS Collections'),
      ...CMS_COLLECTIONS.map((c) => collectionItem(S, c, counts)),

      S.divider().title('Sitio'),
      byLanguage(S, 'page', 'Páginas', DocumentIcon),
      byLanguage(S, 'servicePage', 'Todos los servicios', ThListIcon),
      byLanguage(S, 'faq', 'FAQs', HelpCircleIcon),
      S.documentTypeListItem('office').title('Oficinas').icon(PinIcon),
      S.documentTypeListItem('person').title('Personas (equipo + autores)').icon(UserIcon),

      S.divider().title('Configuración'),
      S.listItem()
        .title('Configuración global')
        .icon(CogIcon)
        .child(
          S.list()
            .title('Configuración global')
            .items(
              LANGUAGES.map((l) =>
                S.listItem()
                  .title(l.title)
                  .icon(EarthGlobeIcon)
                  .child(S.list().title(l.title).items(singletonsForLang(S, l.id))),
              ),
            ),
        ),
      S.documentTypeListItem('redirect').title('Redirecciones 301').icon(ArrowRightIcon),
    ])

// La raíz se actualiza en vivo con el número de ítems de cada colección (como Webflow).
export const structure: StructureResolver = (S, context: StructureResolverContext) =>
  context.documentStore
    .listenQuery(countQuery(), {}, {tag: 'cms-collection-counts', throttleTime: 1000} as any)
    .pipe(
      map((counts: any) => buildRoot(S, counts || {})),
      startWith(buildRoot(S)),
      catchError(() => of(buildRoot(S))),
    )
