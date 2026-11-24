# Exportaciones CSV de Webflow

Guarda aquí un CSV por colección del CMS de Webflow (Designer → CMS → colección → **Export**).
Deja el nombre que genera Webflow, por ejemplo `Doctums - Blog Posts - 64f….csv`.

Colecciones detectadas en doctums.com (sitemap, nov-2026):

| Colección Webflow | URL | Ítems | Tipo en Sanity |
|---|---|---|---|
| Blog Posts | /blog/* | 91 | `post` |
| Blog Categories | /blog-category/* | 7 | `blogCategory` |
| Authors / Team | (sin página) | — | `person` |
| Practice Areas | /practice-area/* | 14 | `practiceArea` |
| Practice Area Categories | /practice-area-category/* | 3 | `practiceAreaCategory` |
| Case Studies | /case-studies/* | 7 | `caseStudy` |
| Services | /services/* | 3 | `servicePage` |

Luego: `npm run webflow:build` y `npm run webflow:import`.
