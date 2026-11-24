# Sanity Doctums

Sanity Studio (v6) para la migración de **doctums.com** (Webflow → Sanity).

- **Proyecto Sanity:** `Doctums-Back` · projectId `sodiif40` · dataset `production`
- **Idiomas:** EN (Estados Unidos, `/`) y ES (Latinoamérica, `/latam`)

## Requisitos

- Node.js **22.12 o superior**
- Haber iniciado sesión en Sanity: `npx sanity login`

## Instalación

```bash
cd C:\Users\USUARIO\Desktop\Sanity-Doctums
npm install
copy .env.example .env        # (en macOS/Linux: cp .env.example .env)
npm run dev                   # http://localhost:3333
```

## Cargar el contenido inicial

El seed trae el contenido base de doctums.com: 96 documentos.

```bash
node scripts/build-seed.mjs   # regenera seed/doctums-seed.ndjson (opcional)
npm run seed                  # sanity dataset import ... production --replace
```

## Migración del CMS de Webflow

El script `scripts/webflow-import.mjs` convierte los CSV exportados del CMS de Webflow en documentos de Sanity:

- **Rich text → Portable Text**: títulos, listas, enlaces, imágenes con alt y pie, videos y embeds.
- **Imágenes**: se descargan del CDN de Webflow y se suben a Sanity al importar.
- **Referencias**: autor y categorías del blog, categoría de cada área de práctica.
- **IDs deterministas**: si el slug o el nombre coincide con el seed base, reutiliza ese `_id`, así las páginas siguen apuntando bien. Si no, usa `wf-<ItemID>`. Se puede re-ejecutar sin duplicar.
- **Trazabilidad**: cada documento guarda en `webflow` el Item ID, las fechas, el estado y las columnas que no se mapearon (en JSON), para no perder nada.
- **Reporte**: `seed/webflow-import-report.md` lista las columnas sin mapear, los CSV no reconocidos y las referencias rotas.

```bash
# 1. Exporta cada colección desde Webflow (CMS → Export) a ./webflow-export/
npm run seed            # contenido base (páginas, navegación, footer…)
npm run webflow:build   # CSV → seed/webflow-import.ndjson + reporte
npm run webflow:import  # sube a Sanity (con --replace)
```

## Publicar el Studio

```bash
npm run deploy                # → https://doctums.sanity.studio
```

En sanity.io/manage → API → CORS origins agrega `http://localhost:3333` y la URL del frontend.

## Modelo de contenido

| Tipo | Uso en doctums.com |
|---|---|
| `siteSettings` (singleton por idioma) | Logo, barra de anuncio, email, redes, GTM, HubSpot, SEO por defecto |
| `navigation` (singleton por idioma) | Header con mega-menú "For Institutions", Company, Blog, selector EN/ES |
| `footer` (singleton por idioma) | Columnas, enlaces legales, copyright y disclaimer |
| `page` | Home, About, Team, For EdTechs, Talk to us, Blog, Careers, Security, Privacy |
| `servicePage` | Hubs (Advisory & Optimization, Tech Platform, AI Strategy) y sub-servicios (`/advisory-services/*`, `/ellucian-implementation-services/*`…) |
| `partner` | Banner, Colleague, Anthology, Element451, Student First, Scholarship Magic (con página propia opcional) |
| `practiceArea` / `practiceAreaCategory` | 14 áreas de práctica en 3 categorías |
| `post` / `blogCategory` / `person` | Blog (7 categorías), autores y equipo |
| `caseStudy` | "Partnerships you can trust" (Harcum, Westcliff) |
| `office` | Global reach: Toronto, Chicago, Ciudad de México, Santiago |
| `faq` | Preguntas reutilizables |
| `redirect` | 301 desde las URLs de Webflow |

### Page builder (campo `sections`)

`heroSection`, `statsSection`, `cardGridSection`, `textMediaSection`, `richTextSection`, `bulletListSection`,
`stepsSection`, `faqSection`, `ctaSection`, `logoCloudSection`, `caseStudiesSection`, `expertiseSection`,
`teamSection`, `blogFeedSection`, `officesSection`, `practiceAreasSection`, `servicesListSection`,
`formSection` (HubSpot / newsletter / calendario), `linkedinFollowSection`.

Cada sección tiene antetítulo, título, intro, ancla, fondo (light/dark/brand/muted) y la opción de ocultarla.

## Pendientes de la migración

- [ ] Importar los ~90 artículos del blog (texto, fecha, imagen, categoría) desde Webflow (export CSV o API).
- [ ] Subir imágenes: logos, fotos del equipo, mockups.
- [ ] Contenido en español del sitio `/latam` (los singletons ES ya existen).
- [ ] Respuestas de las FAQs y textos largos marcados con `TODO`.
- [ ] Revisar problemas del sitio actual: texto de relleno en áreas de práctica ("Here will be the practice areas…"),
      "Contact us" del nav y de /for-edtechs con `href="#"`, selector EN apuntando a `/old-home`.
- [ ] Completar el mapa de redirecciones 301 con todas las URLs antiguas (campo `legacyUrl` de cada documento).
# Doctums-backend
