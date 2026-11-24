#!/usr/bin/env node
/**
 * Migración Webflow CMS → Sanity (doctums.com)
 *
 * 1. Webflow Designer → CMS → cada colección → Export → guarda los CSV en ./webflow-export/
 * 2. npm run webflow:build    → seed/webflow-import.ndjson + seed/webflow-import-report.md
 * 3. npm run webflow:import   → sube a Sanity (descarga y sube las imágenes del CDN de Webflow)
 *
 * - IDs deterministas: reutiliza los _id del seed base (seed/doctums-seed.ndjson) cuando el slug,
 *   la URL antigua o el nombre coinciden; si no, usa un id legible por tipo. Re-ejecutable sin duplicar.
 * - Ítems en Draft en Webflow → borradores en Sanity (drafts.<id>).
 * - Ítems archivados → no se importan.
 */
import {readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync} from 'node:fs'
import {join} from 'node:path'
import {parse} from 'csv-parse/sync'
import {JSDOM} from 'jsdom'
import {htmlToBlocks, randomKey} from '@portabletext/block-tools'
import {Schema} from '@sanity/schema'

const IN_DIR = process.argv[2] || 'webflow-export'
const OUT = 'seed/webflow-import.ndjson'
const REPORT = 'seed/webflow-import-report.md'
const key = () => randomKey(12)

// ---------------------------------------------------------------------------
// HTML → Portable Text (misma forma que schemaTypes/objects/blockContent.ts)
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

// uploads-ssl.webflow.com es el dominio antiguo del CDN de Webflow (mismas rutas en cdn.prod.website-files.com)
const fixUrl = (u) => (u || '').trim().replace('https://uploads-ssl.webflow.com/', 'https://cdn.prod.website-files.com/')
const image = (url, alt) => (url && url.trim() ? {_type: 'imageWithAlt', _sanityAsset: `image@${fixUrl(url)}`, ...(alt ? {alt: alt.trim()} : {})} : undefined)
const plainImage = (url) => (url && url.trim() ? {_type: 'image', _sanityAsset: `image@${fixUrl(url)}`} : undefined)
const embedUrl = (src) => (src.startsWith('//') ? `https:${src}` : src)

const rules = [
  {
    deserialize(el, next, block) {
      const tag = el.tagName?.toLowerCase()
      if (tag !== 'figure' && tag !== 'img') return undefined
      const iframe = tag === 'figure' && el.querySelector('iframe')
      if (iframe) return block({_type: 'embed', _key: key(), url: embedUrl(iframe.getAttribute('src') || '')})
      const img = tag === 'img' ? el : el.querySelector('img')
      if (!img) return undefined
      const caption = tag === 'figure' ? el.querySelector('figcaption')?.textContent?.trim() : undefined
      return block({...image(img.getAttribute('src'), img.getAttribute('alt') || undefined), _key: key(), ...(caption ? {caption} : {})})
    },
  },
  {
    deserialize(el, next, block) {
      if (el.tagName?.toLowerCase() !== 'iframe') return undefined
      return block({_type: 'embed', _key: key(), url: embedUrl(el.getAttribute('src') || '')})
    },
  },
  {
    // h1 dentro de rich text → h2 (el h1 es el título); h5/h6 → h4
    deserialize(el, next, block) {
      const style = {h1: 'h2', h5: 'h4', h6: 'h4'}[el.tagName?.toLowerCase()]
      if (!style) return undefined
      return block({_type: 'block', style, markDefs: [], children: next(el.childNodes)})
    },
  },
]

const clean = (html) => (html || '').replace(/‍/g, '').trim()
const toPT = (html) => {
  const h = clean(html)
  if (!h) return undefined
  const src = /<[a-z][\s\S]*>/i.test(h) ? h : h.split(/\n{2,}/).map((p) => `<p>${p}</p>`).join('')
  const blocks = htmlToBlocks(src, blockContentType, {parseHtml: (x) => new JSDOM(x).window.document, rules})
  // quitar párrafos vacíos
  const out = blocks.filter((b) => b._type !== 'block' || b.children?.some((c) => (c.text || '').trim()))
  return out.length ? out : undefined
}
const toText = (html) => {
  const h = clean(html)
  return h ? new JSDOM(`<body>${h}</body>`).window.document.body.textContent.replace(/\s+/g, ' ').trim() || undefined : undefined
}

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------
const v = (row, col) => {
  const x = row[col]
  return x === undefined || String(x).trim() === '' ? undefined : String(x).trim()
}
const bool = (x) => String(x || '').trim().toLowerCase() === 'true'
const date = (x) => {
  if (!x) return undefined
  const d = new Date(String(x).replace(/\s*\(.*\)\s*$/, ''))
  return isNaN(d) ? undefined : d.toISOString()
}
const num = (x) => (x !== undefined && x !== '' && !isNaN(Number(x)) ? Number(x) : undefined)
const slug = (s) => (s ? {_type: 'slug', current: s} : undefined)
const slugify = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

if (!existsSync(IN_DIR)) {
  console.error(`✖ No existe la carpeta ${IN_DIR}/ — exporta los CSV de Webflow y guárdalos ahí.`)
  process.exit(1)
}

const COLLECTIONS = {
  blogCategories: /blog categories/i,
  posts: /- blogs -/i,
  advisoryServices: /advisory services/i,
  ellucianServices: /ellucian implementation services/i,
  solutions: /- solutions -/i,
  teamMembers: /team members/i,
  caseStudyHighlights: /case study highlights/i,
  caseStudies: /- case studies -/i,
  practiceAreaCategories: /practice area categories/i,
  practiceAreas: /practice areas -/i,
}
const data = {}
const unknown = []
for (const f of readdirSync(IN_DIR).filter((x) => x.toLowerCase().endsWith('.csv'))) {
  const name = f.replace(/_/g, ' ')
  const k = Object.keys(COLLECTIONS).find((c) => COLLECTIONS[c].test(name))
  const rows = parse(readFileSync(join(IN_DIR, f)), {columns: true, skip_empty_lines: true, bom: true, relax_quotes: true, relax_column_count: true})
  if (!k) unknown.push({file: f, rows: rows.length, columns: Object.keys(rows[0] || {})})
  else data[k] = {file: f, rows: rows.filter((r) => !bool(r.Archived))}
}

// ---------------------------------------------------------------------------
// IDs: reutilizar los del seed base
// ---------------------------------------------------------------------------
const seedIndex = new Map()
if (existsSync('seed/doctums-seed.ndjson')) {
  for (const line of readFileSync('seed/doctums-seed.ndjson', 'utf8').split('\n').filter(Boolean)) {
    const d = JSON.parse(line)
    if (d.slug?.current) seedIndex.set(`${d._type}:slug:${d.slug.current}`, d._id)
    if (d.legacyUrl) seedIndex.set(`${d._type}:url:${d.legacyUrl}`, d._id)
    if (d.name) seedIndex.set(`${d._type}:name:${d.name.toLowerCase()}`, d._id)
  }
}
const resolveId = (type, {slug: s, url, name}, fallback) =>
  (s && seedIndex.get(`${type}:slug:${s}`)) ||
  (url && seedIndex.get(`${type}:url:${url}`)) ||
  (name && seedIndex.get(`${type}:name:${name.toLowerCase()}`)) ||
  fallback

// índice: colección → slug Webflow → {id, draft}
const refIndex = {}
const register = (coll, s, id, draft) => {
  refIndex[coll] = refIndex[coll] || new Map()
  refIndex[coll].set(s, {id, draft})
}
const missingRefs = []
const ref = (coll, s, from) => {
  if (!s) return undefined
  const hit = refIndex[coll]?.get(s.trim())
  if (!hit) {
    missingRefs.push(`${from} → ${coll}: \`${s}\``)
    return undefined
  }
  // referencias a borradores: débiles (se fortalecen al publicar)
  return {_type: 'reference', _ref: hit.id, ...(hit.draft ? {_weak: true, _strengthenOnPublish: {type: coll}} : {})}
}
const refs = (coll, list, from) =>
  (list || '').split(';').map((s) => s.trim()).filter(Boolean).map((s) => ref(coll, s, from)).filter(Boolean).map((r) => ({...r, _key: key()}))

const meta = (coll, row) => ({
  _type: 'webflowMeta',
  itemId: v(row, 'Item ID'),
  collectionId: v(row, 'Collection ID'),
  collection: data[coll].file,
  createdOn: v(row, 'Created On'),
  updatedOn: v(row, 'Updated On'),
  publishedOn: v(row, 'Published On'),
  draft: bool(row.Draft),
  archived: bool(row.Archived),
})
const docs = new Map()
const push = (coll, row, doc) => {
  doc.webflow = meta(coll, row)
  if (bool(row.Draft)) doc._id = `drafts.${doc._id}`
  docs.set(doc._id, {...(docs.get(doc._id) || {}), ...doc})
}
const isSpanish = (s) => /¿|¡|\b(la|el|los|las|del|para|una|por|con|desaparecer)\b/i.test(s || '')

// Pre-registro de IDs para poder referenciar en cualquier orden
const plan = {
  blogCategories: (r) => ['blogCategory', resolveId('blogCategory', {slug: r.Slug}, `blogcat-${r.Slug}`)],
  practiceAreaCategories: (r) => ['practiceAreaCategory', resolveId('practiceAreaCategory', {slug: r.Slug}, `pacat-${r.Slug}`)],
  practiceAreas: (r) => ['practiceArea', resolveId('practiceArea', {slug: r.Slug}, `pa-${r.Slug}`)],
  teamMembers: (r) => {
    const name = [v(r, 'Member Name'), v(r, 'Member Last Name')].filter(Boolean).join(' ')
    return ['person', resolveId('person', {name}, `person-${slugify(name)}`)]
  },
  advisoryServices: (r) => [
    'servicePage',
    resolveId('servicePage', {url: r.Slug === 'cybersecurity-for-higher-education' ? `/${r.Slug}` : `/advisory-services/${r.Slug}`, slug: r.Slug}, `svc-${r.Slug}`),
  ],
  ellucianServices: (r) => ['servicePage', resolveId('servicePage', {url: `/ellucian-implementation-services/${r.Slug}`, slug: r.Slug}, `svc-${r.Slug}`)],
  solutions: (r) => ['partner', resolveId('partner', {slug: r.Slug, url: `/solutions/${r.Slug}`}, `partner-${r.Slug}`)],
  caseStudies: (r) => ['caseStudy', resolveId('caseStudy', {slug: r.Slug}, `case-${r.Slug}`)],
  caseStudyHighlights: (r) => ['caseStudyHighlight', `highlight-${r.Slug}`],
  posts: (r) => ['post', resolveId('post', {slug: r.Slug}, `post-${r.Slug}`)],
}
// Sanity: IDs de máx. 128 caracteres ([a-zA-Z0-9._-]); con "drafts." delante → límite seguro 115.
// Si el id legible es muy largo, se usa <prefijo>-<Item ID de Webflow>.
const safeId = (id, row) => {
  const clean = id.replace(/[^a-zA-Z0-9._-]/g, '-')
  return clean.length <= 115 ? clean : `${clean.split('-')[0]}-wf${row['Item ID']}`
}
const ids = {}
for (const [coll, {rows}] of Object.entries(data)) {
  ids[coll] = new Map()
  for (const r of rows) {
    const id = safeId(plan[coll](r)[1], r)
    ids[coll].set(r['Item ID'], id)
    register(coll, r.Slug, bool(r.Draft) ? `drafts.${id}` : id, bool(r.Draft))
  }
}
const idFor = (coll, row) => ids[coll].get(row['Item ID'])

// ---------------------------------------------------------------------------
// Mapeos (columnas reales de los CSV de Webflow de Doctums)
// ---------------------------------------------------------------------------
const serviceItems = (row) => {
  const out = []
  for (let n = 1; n <= 8; n++) {
    const title = v(row, `Service Title ${n}`)
    const description = toPT(v(row, `Service Description ${n}`))
    const img = image(v(row, `Service Image ${n}`), title)
    if (title || description || img) out.push({_type: 'serviceItem', _key: key(), title, description, image: img})
  }
  return out.length ? out : undefined
}

const M = {
  blogCategories: (row) => ({
    _id: idFor('blogCategories', row),
    _type: 'blogCategory',
    language: 'en',
    title: v(row, 'Name (Title)'),
    slug: slug(row.Slug),
    image: image(v(row, 'Category Image')),
    legacyUrl: `/blog-category/${row.Slug}`,
  }),

  practiceAreaCategories: (row) => ({
    _id: idFor('practiceAreaCategories', row),
    _type: 'practiceAreaCategory',
    language: 'en',
    title: v(row, 'Name (Title)'),
    slug: slug(row.Slug),
    cardImage: image(v(row, 'Card Image'), v(row, 'Name (Title)')),
    icon: plainImage(v(row, 'Icon')),
    practiceAreas: refs('practiceAreas', v(row, 'Practices Areas'), row.Slug),
    description: v(row, 'Advisory Services - Description'),
    legacyUrl: `/practice-area-category/${row.Slug}`,
  }),

  practiceAreas: (row) => {
    const highlights = []
    for (let n = 1; n <= 6; n++) {
      const text = toPT(v(row, `Highlight ${n}`))
      const img = image(v(row, n === 6 ? 'Highlight image 6' : `Highlight Image ${n}`) || v(row, `Highlight Image ${n}`))
      if (text || img) highlights.push({_type: 'highlight', _key: key(), text, image: img})
    }
    return {
      _id: idFor('practiceAreas', row),
      _type: 'practiceArea',
      language: 'en',
      title: v(row, 'Name (Title)'),
      slug: slug(row.Slug),
      category: ref('practiceAreaCategories', v(row, 'Category'), row.Slug),
      image: image(v(row, 'Practice Area Image'), v(row, 'Name (Title)')),
      tagline: v(row, 'Tagline'),
      shortDescription: v(row, 'Short Description'),
      summary: v(row, 'Short Description'),
      highlights: highlights.length ? highlights : undefined,
      orderRank: num(v(row, 'Custom Order')),
      legacyUrl: `/practice-area/${row.Slug}`,
    }
  },

  teamMembers: (row, i) => {
    const firstName = v(row, 'Member Name')
    const lastName = v(row, 'Member Last Name')
    const name = [firstName, lastName].filter(Boolean).join(' ')
    return {
      _id: idFor('teamMembers', row),
      _type: 'person',
      name,
      firstName,
      lastName,
      slug: slug(slugify(name)),
      role: v(row, 'Member Charge'),
      bio: toPT(v(row, 'Member Bio')),
      photo: image(v(row, 'Member Headshot'), name),
      linkedin: v(row, 'LinkedIn Profile'),
      isTeamMember: true,
      orderRank: i + 1,
    }
  },

  advisoryServices: (row, i) => ({
    _id: idFor('advisoryServices', row),
    _type: 'servicePage',
    language: 'en',
    title: v(row, 'Title'),
    slug: slug(row.Slug),
    serviceGroup: /governance/i.test(row.Slug) ? 'governance' : 'advisory',
    parent: {_type: 'reference', _ref: 'svc-advisory'},
    template: v(row, 'Template'),
    bannerImage: image(v(row, 'Banner Image'), v(row, 'Title')),
    bannerDescription: toPT(v(row, 'Description')),
    summary: toText(v(row, 'Description')),
    serviceItems: serviceItems(row),
    ctaText: v(row, 'CTA Text'),
    orderRank: 10 + i,
    legacyUrl: row.Slug === 'cybersecurity-for-higher-education' ? `/${row.Slug}` : `/advisory-services/${row.Slug}`,
  }),

  ellucianServices: (row, i) => ({
    _id: idFor('ellucianServices', row),
    _type: 'servicePage',
    language: 'en',
    title: v(row, 'Title'),
    slug: slug(row.Slug),
    serviceGroup: 'platform',
    parent: {_type: 'reference', _ref: 'svc-platform'},
    template: v(row, 'Template'),
    bannerImage: image(v(row, 'Banner Image'), v(row, 'Title')),
    bannerDescription: toPT(v(row, 'Banner Description')),
    summary: toText(v(row, 'Banner Description')),
    serviceItems: serviceItems(row),
    ctaText: v(row, 'CTA Text'),
    orderRank: 40 + i,
    legacyUrl: `/ellucian-implementation-services/${row.Slug}`,
  }),

  solutions: (row, i) => ({
    _id: idFor('solutions', row),
    _type: 'partner',
    name: v(row, 'Title'),
    slug: slug(row.Slug),
    kind: 'strategic',
    hasLandingPage: true,
    template: v(row, 'Template'),
    bannerImage: image(v(row, 'Banner Image'), v(row, 'Title')),
    description: toText(v(row, 'Description')),
    serviceItems: serviceItems(row),
    ctaText: v(row, 'CTA Text'),
    ctaLink: v(row, 'CTA Link'),
    orderRank: num(i + 5),
    legacyUrl: `/solutions/${row.Slug}`,
  }),

  caseStudies: (row) => ({
    _id: idFor('caseStudies', row),
    _type: 'caseStudy',
    institution: v(row, 'Name') || v(row, 'Name (Title)') || v(row, 'Title'),
    slug: slug(row.Slug),
    legacyUrl: `/case-studies/${row.Slug}`,
    // TODO: mapear columnas propias cuando esté el CSV "Case Studies" (se listan en el reporte)
  }),

  caseStudyHighlights: (row) => {
    const caseSlug = v(row, 'Case Study')
    if (caseSlug && !refIndex.caseStudies?.has(caseSlug)) {
      // Colección "Case Studies" no exportada: crear caso base para no perder la relación
      const id = safeId(resolveId('caseStudy', {slug: caseSlug}, `case-${caseSlug}`), {'Item ID': caseSlug.slice(0, 40)})
      register('caseStudies', caseSlug, id, false)
      const pretty = caseSlug.split('---').map((p) => p.split('-').map((w) => (w.length <= 3 && /^(of|the|and)$/.test(w) ? w : w[0].toUpperCase() + w.slice(1))).join(' ')).join(' – ')
      docs.set(id, {_id: id, _type: 'caseStudy', institution: pretty.replace(/^Ollu\b/, 'OLLU').replace(/^Uvm\b/, 'UVM').replace(/^Duoc\b/, 'DUOC'), slug: slug(caseSlug), legacyUrl: `/case-studies/${caseSlug}`})
      createdCaseStubs.add(caseSlug)
    }
    return {
      _id: idFor('caseStudyHighlights', row),
      _type: 'caseStudyHighlight',
      name: v(row, 'Highlight ID'),
      slug: slug(row.Slug),
      title: v(row, 'Highlight Title'),
      image: image(v(row, 'Highlight Image'), v(row, 'Highlight Title')),
      caseStudy: ref('caseStudies', caseSlug, row.Slug),
      practiceArea: refIndex.practiceAreas?.get(practiceAreaGuess(row.Slug))
        ? {_type: 'reference', _ref: refIndex.practiceAreas.get(practiceAreaGuess(row.Slug)).id, _weak: true}
        : undefined,
      context: v(row, 'Context'),
      challenge: v(row, 'Challenge'),
      painPoints: v(row, 'Pain Points'),
      solution: v(row, 'Solution'),
      results: v(row, 'Results'),
    }
  },

  posts: (row) => {
    const title = v(row, 'Name')
    const authorName = v(row, 'Author Name')
    const author = authorFor(authorName, row)
    return {
      _id: idFor('posts', row),
      _type: 'post',
      language: isSpanish(title) ? 'es' : 'en',
      title,
      slug: slug(row.Slug),
      publishedAt: date(v(row, 'Published On')) || date(v(row, 'Created On')),
      authors: [{_type: 'reference', _ref: author, _key: key()}],
      featured: bool(row['Featured Article']),
      mainArticle: bool(row['Main Article']),
      outstanding: bool(row.Outstanding),
      order: num(v(row, 'Order')),
      timeToRead: v(row, 'Time to Read'),
      forefrontType: v(row, 'Forefront Type'),
      excerpt: v(row, 'Short Description'),
      mainImage: image(v(row, 'Forefront Image'), title),
      video: v(row, 'Video'),
      body: toPT(v(row, 'Forefront Content')),
      authorPosition: toPT(v(row, 'Author Position')),
      mainTakeaways: toPT(v(row, 'Main Takeaways')),
      qa: toPT(v(row, "Forefront Q&A's")),
      categories: refs('blogCategories', v(row, 'Category'), row.Slug),
      university:
        v(row, 'University Image') || v(row, 'University Logo') || v(row, 'University Description')
          ? {
              image: image(v(row, 'University Image')),
              logo: image(v(row, 'University Logo')),
              highlightsTitle: v(row, 'University Highlights Title'),
              location: v(row, 'University Location'),
              description: v(row, 'University Description'),
            }
          : undefined,
      legacyUrl: `/blog/${row.Slug}`,
    }
  },
}

// Highlights cuyo slug coincide con un área de práctica (p.ej. "financial-management")
const practiceAreaGuess = (s) => ({'admissions-enrollment-management': 'admission-enrollment-management', 'administrative-instructional-technology': 'administrative-instructionaltechnology'})[s] || s
const createdCaseStubs = new Set()

// Autores del blog: "Author Name" es texto en Webflow → persona (reutiliza equipo/seed por nombre)
const authorFor = (name, row) => {
  const n = (name || 'Doctums Team').replace(/\s+/g, ' ').trim()
  const fromTeam = [...docs.values()].find((d) => d._type === 'person' && d.name?.toLowerCase() === n.toLowerCase())
  const id = fromTeam?._id.replace(/^drafts\./, '') || resolveId('person', {name: n}, `person-${slugify(n)}`.slice(0, 115))
  const existing = docs.get(id) || docs.get(`drafts.${id}`) || fromTeam
  // headshot/LinkedIn solo aplican si el post nombra al autor
  const photo = name ? image(v(row, 'Author Headshot'), n) : undefined
  const linkedin = name ? v(row, 'Author LinkedIn') : undefined
  if (existing) {
    if (!existing.photo && photo) existing.photo = photo
    if (!existing.linkedin && linkedin) existing.linkedin = linkedin
  } else {
    docs.set(id, {_id: id, _type: 'person', name: n, slug: slug(slugify(n)), photo, linkedin, isOrganization: /doctums/i.test(n)})
  }
  return id
}

// ---------------------------------------------------------------------------
// Ejecutar (orden: taxonomías y personas primero)
// ---------------------------------------------------------------------------
const ORDER = ['blogCategories', 'practiceAreaCategories', 'practiceAreas', 'teamMembers', 'advisoryServices', 'ellucianServices', 'solutions', 'caseStudies', 'caseStudyHighlights', 'posts']
const stats = []
for (const coll of ORDER) {
  if (!data[coll]) continue
  data[coll].rows.forEach((row, i) => push(coll, row, M[coll](row, i)))
  stats.push({coll, file: data[coll].file, n: data[coll].rows.length, drafts: data[coll].rows.filter((r) => bool(r.Draft)).length, cols: Object.keys(data[coll].rows[0] || {})})
}

// Un borrador sin versión publicada que es referenciado fuertemente rompería el import → referencias débiles ya aplicadas.
const strip = (o) => JSON.parse(JSON.stringify(o))
mkdirSync('seed', {recursive: true})
const all = [...docs.values()].map(strip)
writeFileSync(OUT, all.map((d) => JSON.stringify(d)).join('\n') + '\n')

// ---------------------------------------------------------------------------
// Reporte
// ---------------------------------------------------------------------------
const byType = {}
all.forEach((d) => (byType[d._type] = (byType[d._type] || 0) + 1))
const images = all.map((d) => JSON.stringify(d).match(/"_sanityAsset":"image@[^"]+"/g) || []).flat()
const L = ['# Reporte de importación Webflow → Sanity', '', `Generado: ${new Date().toISOString()}`, '', '## Colecciones', '', '| Colección | Archivo | Ítems | Borradores |', '|---|---|---|---|']
stats.forEach((s) => L.push(`| ${s.coll} | ${s.file} | ${s.n} | ${s.drafts} |`))
L.push('', '## Documentos generados', '', '| Tipo | Cantidad |', '|---|---|', ...Object.entries(byType).map(([t, n]) => `| ${t} | ${n} |`))
L.push('', `**Total:** ${all.length} documentos · ${images.length} imágenes (${new Set(images).size} únicas) → \`${OUT}\``, '')
if (createdCaseStubs.size)
  L.push('## Casos de estudio creados como base', '', 'La colección **Case Studies** no venía en la exportación. Se crearon estos casos (solo nombre y slug) para mantener la relación con sus highlights:', '', ...[...createdCaseStubs].map((s) => `- \`${s}\``), '')
const missingColl = Object.keys(COLLECTIONS).filter((c) => !data[c])
if (missingColl.length) L.push('## Colecciones no incluidas en la exportación', '', ...missingColl.map((c) => `- ${c}`), '')
if (unknown.length) L.push('## CSV no reconocidos (no importados)', '', ...unknown.map((u) => `- **${u.file}** (${u.rows} filas): ${u.columns.join(', ')}`), '')
if (missingRefs.length) L.push('## Referencias no encontradas', '', ...[...new Set(missingRefs)].map((r) => `- ${r}`), '')
writeFileSync(REPORT, L.join('\n'))

console.log(stats.map((s) => `✔ ${s.coll.padEnd(22)} ${String(s.n).padStart(4)}${s.drafts ? ` (${s.drafts} borrador/es)` : ''}`).join('\n'))
console.log(`→ ${all.length} documentos, ${new Set(images).size} imágenes únicas → ${OUT}`)
if (missingRefs.length) console.log(`⚠ ${new Set(missingRefs).size} referencias no encontradas — ver ${REPORT}`)
if (createdCaseStubs.size) console.log(`⚠ ${createdCaseStubs.size} casos de estudio creados como base (falta CSV "Case Studies")`)
