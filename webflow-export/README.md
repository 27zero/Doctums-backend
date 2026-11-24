# Exportaciones CSV de Webflow

CSV exportados del CMS de Webflow (Designer → CMS → colección → **Export**), fuente de `npm run webflow:build`.

| CSV de Webflow | Ítems | Tipo en Sanity | URL antigua |
|---|---|---|---|
| Blogs | 91 | `post` (+ `person` para "Author Name") | /blog/* |
| Blog Categories | 7 | `blogCategory` | /blog-category/* |
| Team Members | 8 | `person` | /team |
| Practice Areas | 14 | `practiceArea` | /practice-area/* |
| Practice Area Categories | 3 | `practiceAreaCategory` | /practice-area-category/* |
| For institutions – Advisory Services | 7 | `servicePage` (advisory / governance) | /advisory-services/* |
| For institutions – Ellucian Implementation Services | 5 | `servicePage` (platform) | /ellucian-implementation-services/* |
| For institutions – Solutions | 2 | `partner` | /solutions/* |
| Case Study Highlights | 10 | `caseStudyHighlight` | — |
| **Case Studies** | — | `caseStudy` | /case-studies/* — **falta exportar** |

Para actualizar: reemplaza el CSV y vuelve a correr `npm run webflow:build && npm run webflow:import`.
