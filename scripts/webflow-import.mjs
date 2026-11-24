#!/usr/bin/env node
/**
 * Migración Webflow CMS → Sanity
 *
 * 1. En Webflow Designer: CMS → (cada colección) → ⋯ → "Export" → descarga el CSV.
 * 2. Guarda los CSV en ./webflow-export/ (el nombre del archivo puede quedar como lo genera Webflow,
 *    ej. "Doctums - Blog Posts - 6650….csv").
 * 3. node scripts/webflow-import.mjs            → genera seed/webflow-import.ndjson + reporte
 * 4. npm run import:webflow                     → sube a Sanity (descarga las imágenes de Webflow)
 *
 * IDs deterministas (wf-<ItemID>): se puede re-ejecutar cuantas veces se quiera sin duplicar.
 */
import {readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync} from 'node:fs'
import {join, basename} from 'node:path'
import {parse} from 'csv-parse/sync'
import {JSDOM} from 'jsdom'
import {htmlToBlocks, randomKey} from '@portabletext/block-tools'
import {Schema} from '@sanity/schema'

const IN_DIR = process.argv[2] || 'webflow-export'
const OUT = 'seed/webflow-import.ndjson'
const REPORT = 'seed/webflow-import-report.md'

// ---------------------------------------------------------------------------
// Portable Text (misma forma que schemaTypes/objects/blockContent.ts)
// ---------------------------------------------------------------------------
const ptSchema = Schema.compile({
  name: 'migration',
  types: [
    {
      type: 'object',
      name: 'holder',
      fields: [
        {
          name: 'body',
          type: 'array',
          of: [
            {
              type: 'block',
              styles: [{value: 'normal'}, {value: 'h2'}, {value: 'h3'}, {value: 'h4'}, {value: 'blockquote'}],
              marks: {annotations: [{name: 'link', type: 'object', fields: [{name: 'href', type: 'url'}, {name: 'blank', type: 'boolean'}]}]},
            },
            {type: 'object', name: 'imageWithAlt', fields: [{name: 'alt', type: 'string'}, {name: 'caption', type: 'string'}]},
            {type: 'object', name: 'embed', fields: [{name: 'url', type: 'url'}, {name: 'caption', type: 'string'}]},
          ],
        },
      ],
    },
  ],
})
const blockContentType = ptSchema.get('holder').fields.find((f) => f.name === 'body').type

const imgAsset = (url, alt) =>
  url ? {_type: 'imageWithAlt', _sanityAsset: `image@${url.trim()}`, ...(alt ? {alt} : {})} : undefined

const rules = [
  {
    // <figure><img/><figcaption/></figure> y <img> sueltos → imageWithAlt
    deserialize(el, next, block) {
      const tag = el.tagName?.toLowerCase()
      if (tag !== 'figure' && tag !== 'img') return undefined
      const iframe = tag === 'figure' && el.querySelector('iframe')
      if (iframe) {
        const src = iframe.getAttribute('src') || ''
        return block({_type: 'embed', _key: randomKey(12), url: src.startsWith('//') ? `https:${src}` : src})
      }
      const img = tag === 'img' ? el : el.querySelector('img')
      if (!img) return undefined
      const caption = tag === 'figure' ? el.querySelector('figcaption')?.textContent?.trim() : undefined
      return block({...imgAsset(img.getAttribute('src'), img.getAttribute('alt') || undefined), _key: randomKey(12), ...(caption ? {caption} : {})})
    },
  },
  {
    deserialize(el, next, block) {
      if (el.tagName?.toLowerCase() !== 'iframe') return undefined
      const src = el.getAttribute('src') || ''
      return block({_type: 'embed', _key: randomKey(12), url: src.startsWith('//') ? `https:${src}` : src})
    },
  },
  {
    // h1 dentro del cuerpo → h2 (el h1 es el título del documento); h5/h6 → h4
    deserialize(el, next, block) {
      const tag = el.tagName?.toLowerCase()
      const map = {h1: 'h2', h5: 'h4', h6: 'h4'}
      if (!map[tag]) return undefined
      return block({_type: 'block', style: map[tag], markDefs: [], children: next(el.childNodes)})
    },
  },
]

const toPT = (html) => {
  if (!html || !html.trim()) return undefined
  const blocks = htmlToBlocks(html, blockContentType, {parseHtml: (h) => new JSDOM(h).window.document, rules})
  // block-tools pone _type del miembro: renombrar 'image' → 'imageWithAlt' por si acaso
  return blocks.map((b) => (b._type === 'image' ? {...b, _type: 'imageWithAlt'} : b))
}

const htmlToText = (html) => (html ? new JSDOM(`<body>${html}</body>`).window.document.body.textContent.replace(/\s+/g, ' ').trim() : undefined)

// ---------------------------------------------------------------------------
// Utilidades CSV
// ---------------------------------------------------------------------------
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
/** Devuelve el valor de la primera columna cuyo nombre normalizado coincida con alguno de los candidatos */
const pick = (row, ...cands) => {
  for (const c of cands) {
    const k = Object.keys(row).find((h) => norm(h) === norm(c))
    if (k && row[k] !== undefined && String(row[k]).trim() !== '') return String(row[k]).trim()
  }
  return undefined
}
const usedCols = new Map() // colección → Set(columnas usadas)
const use = (coll, row, ...cands) => {
  const set = usedCols.get(coll) || new Set()
  usedCols.set(coll, set)
  for (const c of cands) {
    const k = Object.keys(row).find((h) => norm(h) === norm(c))
    if (k) set.add(k)
  }
  return pick(row, ...cands)
}
const bool = (v) => /^(true|yes|1)$/i.test(String(v || '').trim())
const date = (v) => {
  if (!v) return undefined
  const d = new Date(v)
  return isNaN(d) ? undefined : d.toISOString()
}
const list = (v) => (v ? v.split(';').map((s) => s.trim()).filter(Boolean) : [])
const slug = (s) => (s ? {_type: 'slug', current: s} : undefined)

// ---------------------------------------------------------------------------
// Detección de colecciones por nombre de archivo
// ---------------------------------------------------------------------------
const COLLECTIONS = [
  {key: 'blogCategories', match: /blog.?categor|^categor/i, type: 'blogCategory'},
  {key: 'practiceAreaCategories', match: /practice.?area.?categor/i, type: 'practiceAreaCategory'},
  {key: 'practiceAreas', match: /practice.?area/i, type: 'practiceArea'},
  {key: 'authors', match: /author|team|member|people|person|equipo/i, type: 'person'},
  {key: 'caseStudies', match: /case.?stud|casos/i, type: 'caseStudy'},
  {key: 'services', match: /service/i, type: 'servicePage'},
  {key: 'posts', match: /blog|post|article|insight/i, type: 'post'},
]

if (!existsSync(IN_DIR)) {
  console.error(`✖ No existe la carpeta ${IN_DIR}/ — exporta los CSV de Webflow y guárdalos ahí.`)
  process.exit(1)
}
const files = readdirSync(IN_DIR).filter((f) => f.toLowerCase().endsWith('.csv'))
const data = {}
const unknown = []
for (const f of files) {
  const name = basename(f, '.csv').replace(/^.*? - (.*?) - [0-9a-f]+$/i, '$1') // "Site - Blog Posts - 66ab…" → "Blog Posts"
  const coll = COLLECTIONS.find((c) => c.match.test(name))
  const rows = parse(readFileSync(join(IN_DIR, f)), {columns: true, skip_empty_lines: true, bom: true, relax_quotes: true, relax_column_count: true})
  if (!coll) {
    unknown.push({file: f, rows: rows.length, columns: rows[0] ? Object.keys(rows[0]) : []})
    continue
  }
  data[coll.key] = {file: f, rows, type: coll.type}
}

// ---------------------------------------------------------------------------
// Índices slug → _id (las referencias en el CSV de Webflow vienen como slugs)
// ---------------------------------------------------------------------------
// Reutilizar los _id del seed base (seed/doctums-seed.ndjson) cuando el slug/nombre coincide,
// así el contenido de Webflow reemplaza los placeholders y las páginas siguen referenciándolos.
const seedIndex = new Map()
if (existsSync('seed/doctums-seed.ndjson')) {
  for (const line of readFileSync('seed/doctums-seed.ndjson', 'utf8').split('\n').filter(Boolean)) {
    const d = JSON.parse(line)
    if (d.slug?.current) seedIndex.set(`${d._type}:${d.slug.current}`, d._id)
    if (d._type === 'person' && d.name) seedIndex.set(`person:name:${d.name.toLowerCase()}`, d._id)
    if (d._type === 'caseStudy' && d.institution) seedIndex.set(`caseStudy:name:${d.institution.toLowerCase()}`, d._id)
  }
}
const idOf = (row, type) =>
  (type && (seedIndex.get(`${type}:${pick(row, 'Slug')}`) || seedIndex.get(`${type}:name:${(pick(row, 'Name') || '').toLowerCase()}`))) ||
  `wf-${pick(row, 'Item ID', 'ItemID', '_id') || pick(row, 'Slug')}`
const slugIndex = {}
for (const [k, {rows, type}] of Object.entries(data)) {
  slugIndex[k] = new Map(rows.map((r) => [pick(r, 'Slug'), idOf(r, type)]))
}
const missingRefs = []
const refTo = (collKey, s, fromId) => {
  if (!s) return undefined
  const id = slugIndex[collKey]?.get(s) || (collKey === 'authors' && seedIndex.get(`person:name:${s.toLowerCase()}`))
  if (!id) {
    missingRefs.push(`${fromId} → ${collKey}:${s}`)
    return undefined
  }
  return {_type: 'reference', _ref: id}
}
const refsTo = (collKey, v, fromId) => list(v).map((s) => refTo(collKey, s, fromId)).filter(Boolean).map((r) => ({...r, _key: randomKey(12)}))

const SYSTEM_COLS = ['Name', 'Slug', 'Collection ID', 'Locale ID', 'Item ID', 'Archived', 'Draft', 'Created On', 'Updated On', 'Published On']
const meta = (coll, row) => {
  const used = new Set([...(usedCols.get(coll) || []), ...SYSTEM_COLS])
  const rest = Object.fromEntries(Object.entries(row).filter(([k, v]) => !used.has(k) && String(v).trim() !== ''))
  return {
    _type: 'webflowMeta',
    itemId: pick(row, 'Item ID'),
    collectionId: pick(row, 'Collection ID'),
    collection: data[coll].file,
    createdOn: pick(row, 'Created On'),
    updatedOn: pick(row, 'Updated On'),
    publishedOn: pick(row, 'Published On'),
    draft: bool(pick(row, 'Draft')),
    archived: bool(pick(row, 'Archived')),
    ...(Object.keys(rest).length ? {raw: JSON.stringify(rest, null, 2)} : {}),
  }
}
const seo = (coll, row) => {
  const metaTitle = use(coll, row, 'Meta Title', 'SEO Title', 'Title Tag')
  const metaDescription = use(coll, row, 'Meta Description', 'SEO Description', 'Meta Desc')
  const og = use(coll, row, 'Open Graph Image', 'OG Image', 'Social Image')
  if (!metaTitle && !metaDescription && !og) return undefined
  return {_type: 'seo', metaTitle, metaDescription, ogImage: og ? {_type: 'image', _sanityAsset: `image@${og}`} : undefined}
}
const lang = (coll, row, fallback = 'en') => {
  const v = use(coll, row, 'Language', 'Idioma', 'Locale')
  if (!v) return fallback
  return /^es|span/i.test(v) ? 'es' : 'en'
}

// ---------------------------------------------------------------------------
// Mapeos por colección
// ---------------------------------------------------------------------------
const docs = []
const M = {
  blogCategories: (row) => ({
    _id: idOf(row, 'blogCategory'),
    _type: 'blogCategory',
    language: lang('blogCategories', row),
    title: use('blogCategories', row, 'Name'),
    slug: slug(use('blogCategories', row, 'Slug')),
    description: htmlToText(use('blogCategories', row, 'Description', 'Short Description', 'Summary')),
    orderRank: Number(use('blogCategories', row, 'Order', 'Sort Order')) || undefined,
    legacyUrl: `/blog-category/${pick(row, 'Slug')}`,
  }),

  practiceAreaCategories: (row) => ({
    _id: idOf(row, 'practiceAreaCategory'),
    _type: 'practiceAreaCategory',
    language: lang('practiceAreaCategories', row),
    title: use('practiceAreaCategories', row, 'Name'),
    slug: slug(use('practiceAreaCategories', row, 'Slug')),
    description: htmlToText(use('practiceAreaCategories', row, 'Description', 'Short Description', 'Summary')),
    icon: (() => {
      const u = use('practiceAreaCategories', row, 'Icon', 'Image')
      return u ? {_type: 'image', _sanityAsset: `image@${u}`} : undefined
    })(),
    orderRank: Number(use('practiceAreaCategories', row, 'Order', 'Sort Order')) || undefined,
  }),

  practiceAreas: (row) => {
    const _id = idOf(row, 'practiceArea')
    const c = 'practiceAreas'
    const body = toPT(use(c, row, 'Body', 'Content', 'Description', 'Rich Text', 'Post Body'))
    return {
      _id,
      _type: 'practiceArea',
      language: lang(c, row),
      title: use(c, row, 'Name'),
      slug: slug(use(c, row, 'Slug')),
      category: refTo('practiceAreaCategories', use(c, row, 'Category', 'Practice Area Category', 'Practice Area Categories'), _id),
      summary: htmlToText(use(c, row, 'Summary', 'Short Description', 'Excerpt')),
      sections: body ? [{_type: 'richTextSection', _key: randomKey(12), intro: body, theme: 'light'}] : undefined,
      seo: seo(c, row),
      legacyUrl: `/practice-area/${pick(row, 'Slug')}`,
    }
  },

  authors: (row) => {
    const c = 'authors'
    const photo = use(c, row, 'Photo', 'Image', 'Avatar', 'Picture', 'Profile Picture', 'Headshot')
    return {
      _id: idOf(row, 'person'),
      _type: 'person',
      name: use(c, row, 'Name'),
      slug: slug(use(c, row, 'Slug')),
      role: use(c, row, 'Title', 'Job Title', 'Position', 'Role', 'Cargo'),
      photo: imgAsset(photo, pick(row, 'Name')),
      bio: toPT(use(c, row, 'Bio', 'Biography', 'Description', 'About')),
      linkedin: use(c, row, 'LinkedIn', 'Linkedin URL', 'LinkedIn Link', 'Linkedin Profile'),
      isTeamMember: bool(use(c, row, 'Team Member', 'Show in Team', 'Is Team Member')) || /team|member|equipo/i.test(data[c].file),
      orderRank: Number(use(c, row, 'Order', 'Sort Order')) || undefined,
    }
  },

  caseStudies: (row) => {
    const c = 'caseStudies'
    return {
      _id: idOf(row, 'caseStudy'),
      _type: 'caseStudy',
      institution: use(c, row, 'Name', 'Institution'),
      slug: slug(use(c, row, 'Slug')),
      country: use(c, row, 'Country', 'País', 'Location'),
      logo: imgAsset(use(c, row, 'Logo', 'Institution Logo'), pick(row, 'Name')),
      mainImage: imgAsset(use(c, row, 'Main Image', 'Image', 'Hero Image', 'Thumbnail', 'Cover')),
      summary: htmlToText(use(c, row, 'Summary', 'Short Description', 'Excerpt', 'Description')),
      body: toPT(use(c, row, 'Body', 'Content', 'Rich Text', 'Case Study', 'Story')),
      featured: bool(use(c, row, 'Featured')),
      seo: seo(c, row),
      legacyUrl: `/case-studies/${pick(row, 'Slug')}`,
    }
  },

  services: (row) => {
    const c = 'services'
    const body = toPT(use(c, row, 'Body', 'Content', 'Description', 'Rich Text'))
    return {
      _id: idOf(row, 'servicePage'),
      _type: 'servicePage',
      language: lang(c, row),
      title: use(c, row, 'Name'),
      slug: slug(use(c, row, 'Slug')),
      summary: htmlToText(use(c, row, 'Summary', 'Short Description', 'Excerpt')),
      icon: (() => {
        const u = use(c, row, 'Icon')
        return u ? {_type: 'image', _sanityAsset: `image@${u}`} : undefined
      })(),
      cardImage: imgAsset(use(c, row, 'Image', 'Main Image', 'Thumbnail')),
      sections: body ? [{_type: 'richTextSection', _key: randomKey(12), intro: body, theme: 'light'}] : undefined,
      seo: seo(c, row),
      legacyUrl: `/services/${pick(row, 'Slug')}`,
    }
  },

  posts: (row) => {
    const c = 'posts'
    const _id = idOf(row, 'post')
    const authorField = use(c, row, 'Author', 'Authors', 'Autor', 'Written By')
    const authors = data.authors ? refsTo('authors', authorField, _id) : []
    return {
      _id,
      _type: 'post',
      language: lang(c, row, /^[¿¡]|ción|ó|á|é/.test(pick(row, 'Name') || '') ? 'es' : 'en'),
      title: use(c, row, 'Name', 'Title'),
      slug: slug(use(c, row, 'Slug')),
      publishedAt: date(use(c, row, 'Date', 'Publish Date', 'Post Date', 'Published Date', 'Fecha')) || date(pick(row, 'Published On')) || date(pick(row, 'Created On')),
      authors: authors.length ? authors : undefined,
      authorName: !authors.length ? authorField : undefined, // texto plano si "Author" no es referencia
      categories: data.blogCategories ? refsTo('blogCategories', use(c, row, 'Category', 'Categories', 'Blog Category', 'Blog Categories'), _id) : undefined,
      featured: bool(use(c, row, 'Featured', 'Featured?', 'Destacado')),
      excerpt: htmlToText(use(c, row, 'Excerpt', 'Post Summary', 'Summary', 'Short Description', 'Intro')),
      mainImage: imgAsset(use(c, row, 'Main Image', 'Thumbnail Image', 'Thumbnail', 'Image', 'Cover Image', 'Featured Image'), pick(row, 'Name')),
      body: toPT(use(c, row, 'Post Body', 'Body', 'Content', 'Rich Text', 'Article')),
      seo: seo(c, row),
      legacyUrl: `/blog/${pick(row, 'Slug')}`,
    }
  },
}

// Orden: primero taxonomías/autores (para las referencias), luego el resto
const ORDER = ['blogCategories', 'practiceAreaCategories', 'authors', 'practiceAreas', 'services', 'caseStudies', 'posts']
const stats = []
for (const k of ORDER) {
  if (!data[k]) continue
  let n = 0
  for (const row of data[k].rows) {
    if (bool(pick(row, 'Archived'))) continue
    const d = M[k](row)
    d.webflow = meta(k, row)
    docs.push(d)
    n++
  }
  stats.push({k, file: data[k].file, n, cols: Object.keys(data[k].rows[0] || {})})
}

// post.authorName no existe en el esquema: si quedó texto plano, crear persona al vuelo
for (const d of docs.filter((x) => x._type === 'post' && x.authorName)) {
  const names = d.authorName.split(/;| with | & /).map((s) => s.trim()).filter(Boolean)
  d.authors = names.map((name) => {
    const id = seedIndex.get(`person:name:${name.toLowerCase()}`) || `wf-author-${name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-')}`
    if (!id.startsWith('person-') && !docs.find((x) => x._id === id)) docs.push({_id: id, _type: 'person', name, isOrganization: /doctums/i.test(name)})
    return {_type: 'reference', _ref: id, _key: randomKey(12)}
  })
  delete d.authorName
}

// Quitar undefined y escribir
mkdirSync('seed', {recursive: true})
const clean = (o) => JSON.parse(JSON.stringify(o))
writeFileSync(OUT, docs.map((d) => JSON.stringify(clean(d))).join('\n') + '\n')

// Reporte
const lines = ['# Reporte de importación Webflow → Sanity', '', `Generado: ${new Date().toISOString()}`, '']
lines.push('| Colección | Archivo | Documentos |', '|---|---|---|')
stats.forEach((s) => lines.push(`| ${s.k} | ${s.file} | ${s.n} |`))
lines.push('', `**Total:** ${docs.length} documentos → \`${OUT}\``, '')
for (const s of stats) {
  const used = usedCols.get(s.k) || new Set()
  const unmapped = s.cols.filter((c) => !used.has(c) && !SYSTEM_COLS.includes(c))
  if (unmapped.length) lines.push(`### Columnas sin mapear en ${s.k}`, '', 'Se guardan en `webflow.raw` de cada documento:', '', ...unmapped.map((c) => `- ${c}`), '')
}
if (unknown.length) {
  lines.push('### CSV no reconocidos (no importados)', '')
  unknown.forEach((u) => lines.push(`- **${u.file}** (${u.rows} filas): ${u.columns.join(', ')}`))
  lines.push('')
}
if (missingRefs.length) lines.push('### Referencias no encontradas', '', ...[...new Set(missingRefs)].map((r) => `- ${r}`), '')
writeFileSync(REPORT, lines.join('\n'))

console.log(stats.map((s) => `✔ ${s.k.padEnd(24)} ${String(s.n).padStart(4)}  (${s.file})`).join('\n'))
if (unknown.length) console.log(`⚠ ${unknown.length} CSV no reconocidos — ver ${REPORT}`)
if (missingRefs.length) console.log(`⚠ ${missingRefs.length} referencias no encontradas — ver ${REPORT}`)
console.log(`→ ${docs.length} documentos en ${OUT}\n→ Siguiente paso: npm run import:webflow`)
