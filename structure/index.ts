import type {StructureResolver, StructureBuilder} from 'sanity/structure'
import {CogIcon} from '@sanity/icons/Cog'
import {MenuIcon} from '@sanity/icons/Menu'
import {BlockElementIcon} from '@sanity/icons/BlockElement'
import {DocumentIcon} from '@sanity/icons/Document'
import {PackageIcon} from '@sanity/icons/Package'
import {EditIcon} from '@sanity/icons/Edit'
import {TagIcon} from '@sanity/icons/Tag'
import {UserIcon} from '@sanity/icons/User'
import {TagsIcon} from '@sanity/icons/Tags'
import {FolderIcon} from '@sanity/icons/Folder'
import {StarIcon} from '@sanity/icons/Star'
import {CaseIcon} from '@sanity/icons/Case'
import {PinIcon} from '@sanity/icons/Pin'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {ArrowRightIcon} from '@sanity/icons/ArrowRight'
import {EarthGlobeIcon} from '@sanity/icons/EarthGlobe'
import {LANGUAGES} from '../schemaTypes/languages'

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

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Doctums')
    .items([
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
      S.divider(),
      byLanguage(S, 'page', 'Páginas', DocumentIcon),
      byLanguage(S, 'servicePage', 'Servicios', PackageIcon),
      S.listItem()
        .title('Áreas de práctica')
        .icon(TagsIcon)
        .child(
          S.list()
            .title('Áreas de práctica')
            .items([
              byLanguage(S, 'practiceArea', 'Áreas de práctica', TagsIcon),
              byLanguage(S, 'practiceAreaCategory', 'Categorías de práctica', FolderIcon),
            ]),
        ),
      S.divider(),
      byLanguage(S, 'post', 'Blog · Artículos', EditIcon),
      byLanguage(S, 'blogCategory', 'Blog · Categorías', TagIcon),
      S.documentTypeListItem('person').title('Equipo y autores').icon(UserIcon),
      S.divider(),
      S.documentTypeListItem('partner').title('Plataformas y partners').icon(StarIcon),
      S.documentTypeListItem('caseStudy').title('Casos de clientes').icon(CaseIcon),
      S.documentTypeListItem('office').title('Oficinas').icon(PinIcon),
      byLanguage(S, 'faq', 'FAQs', HelpCircleIcon),
      S.divider(),
      S.documentTypeListItem('redirect').title('Redirecciones 301').icon(ArrowRightIcon),
    ])
