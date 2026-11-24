// Genera seed/doctums-seed.ndjson con el contenido base de doctums.com (EN)
// Uso: node scripts/build-seed.mjs  →  npm run seed
import {writeFileSync, mkdirSync} from 'node:fs'

let k = 0
const key = () => `k${(++k).toString(36)}`
const slug = (s) => ({_type: 'slug', current: s})
const ref = (id) => ({_type: 'reference', _ref: id, _key: key()})
const ref1 = (id) => ({_type: 'reference', _ref: id})
const pt = (text) => text.split('\n\n').map((p) => ({_type: 'block', _key: key(), style: 'normal', markDefs: [], children: [{_type: 'span', _key: key(), text: p, marks: []}]}))
const ext = (label, url, blank = false) => ({_type: 'link', label, linkType: 'external', external: url, openInNewTab: blank})
const int = (label, id) => ({_type: 'link', label, linkType: 'internal', internal: ref1(id)})
const cta = (link, style = 'primary') => ({_type: 'cta', _key: key(), link, style})
const card = (o) => ({_type: 'card', _key: key(), ...o, description: o.description ? pt(o.description) : undefined})
const stat = (value, label) => ({_type: 'stat', _key: key(), value, label})
const sec = (type, o) => ({_type: type, _key: key(), theme: 'light', ...o, intro: o.intro ? pt(o.intro) : undefined})
const L = (links) => links.map((l) => ({...l, _key: key()}))
const group = (title, links) => ({_type: 'linkGroup', _key: key(), title, links: L(links)})
const docs = []
const add = (d) => (docs.push(d), d._id)

// ---------- Partners / plataformas ----------
const partners = [
  ['partner-banner', 'Ellucian Banner', 'platform', 'banner-banner-consulting'],
  ['partner-colleague', 'Ellucian Colleague', 'platform', 'ellucian-colleague-consulting'],
  ['partner-anthology', 'Anthology', 'platform', 'anthology-consulting'],
  ['partner-element451', 'Element451', 'strategic', 'element451'],
  ['partner-student-first', 'Student First', 'strategic', 'solutions/student-first-sis'],
  ['partner-scholarship-magic', 'Scholarship Magic', 'strategic', 'solutions/scholarship-magic'],
]
partners.forEach(([id, name, kind, url], i) =>
  add({_id: id, _type: 'partner', name, slug: slug(url.split('/').pop()), kind, hasLandingPage: true, orderRank: i + 1, legacyUrl: `/${url}`}),
)

// ---------- Oficinas ----------
const offices = [
  ['office-canada', 'Canada', 'Canadá', 'Toronto, ON', 43.6532, -79.3832],
  ['office-usa', 'USA', 'Estados Unidos', 'Chicago, IL', 41.8781, -87.6298],
  ['office-mexico', 'Mexico', 'México', 'Mexico City', 19.4326, -99.1332],
  ['office-chile', 'Chile', 'Chile', 'Santiago de Chile', -33.4489, -70.6693],
]
offices.forEach(([id, country, countryEs, city, lat, lng], i) =>
  add({_id: id, _type: 'office', country, countryEs, city, location: {lat, lng}, orderRank: i + 1}),
)

// ---------- Equipo y autores ----------
add({_id: 'person-doctums-team', _type: 'person', name: 'Doctums Team', slug: slug('doctums-team'), isOrganization: true})
const team = [
  ['Wesley Matthews', 'President and Founder', 'Presidente y Fundador', 'https://www.linkedin.com/in/wesley-matthews-8a35361/'],
  ['Jonathan Fry', 'Senior Vice President, Global Sales and Partnerships', 'Vicepresidente Senior, Ventas Globales y Alianzas', 'https://www.linkedin.com/in/jonathanafry/'],
  ['Moira Kirkland', 'Senior Vice President, Advisory Services', 'Vicepresidenta Senior, Servicios de Consultoría', 'https://www.linkedin.com/in/moiras/'],
  ['Salvador Salazar', 'Vice President, Innovation and Strategy', 'Vicepresidente, Innovación y Estrategia', 'https://www.linkedin.com/in/salvadorsalazar/'],
  ['Juan Jose Zamur', 'Vice President, LATAM Operations', 'Vicepresidente, Operaciones LATAM', 'https://www.linkedin.com/in/jjza/'],
]
const sl = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
team.forEach(([name, role, roleEs, linkedin], i) =>
  add({_id: `person-${sl(name)}`, _type: 'person', name, slug: slug(sl(name)), role, roleEs, linkedin, isTeamMember: true, orderRank: i + 1}),
)
;['Rodolfo González Gatica', 'Carol Suter', 'Stacy Ybarra', 'Robert Messner', 'Dr. Fortune Mhlanga', 'Ivan Alonso', 'Josh Dietrich', 'Juan Espinoza', 'Connie Atchley', 'Will Kartsimas', 'Tim Coley', 'Sulema Cabrera', 'Keith Fowlkes', 'Larry Kamons', 'Devon Taylor'].forEach((name) =>
  add({_id: `person-${sl(name)}`, _type: 'person', name, slug: slug(sl(name)), isTeamMember: false}),
)

// ---------- Casos ----------
add({_id: 'case-harcum', _type: 'caseStudy', institution: 'Harcum College', slug: slug('harcum-college'), summary: 'Leading the implementation of Student First, its new SIS.', platforms: [ref('partner-student-first')], orderRank: 1})
add({_id: 'case-westcliff', _type: 'caseStudy', institution: 'Westcliff University', slug: slug('westcliff-university'), summary: 'Project and change management for its Student First implementation.', platforms: [ref('partner-student-first')], orderRank: 2})

// ---------- Blog categories ----------
const cats = [
  'Enrollment and retention management', 'Student experience and success', 'Finance and human capital management',
  'Regulatory evolution and compliance', 'Artificial intelligence application and governance',
  'Business process innovation and technology optimization', 'Governance and technology strategy',
]
cats.forEach((title, i) => add({_id: `blogcat-${sl(title)}`, _type: 'blogCategory', language: 'en', title, slug: slug(sl(title)), orderRank: i + 1}))
const catIds = cats.map((c) => `blogcat-${sl(c)}`)

// ---------- Practice areas ----------
const paCats = [
  ['pacat-student-lifecycle', 'Student Lifecycle', 'student-lifecycle'],
  ['pacat-institutional-performance', 'Institutional Performance', 'institutional-performance'],
  ['pacat-enterprise-transformation', 'Enterprise Transformation', 'platforms-and-technology'],
]
paCats.forEach(([id, title, s], i) => add({_id: id, _type: 'practiceAreaCategory', language: 'en', title, slug: slug(s), orderRank: i + 1}))
const pas = [
  ['admission-enrollment-management', 'Admissions & Enrollment Management', 0],
  ['financial-aid', 'Financial Aid', 0],
  ['records-registration', 'Records & Registration', 0],
  ['student-finance-accounts-receivable', 'Student Finance & Accounts Receivable', 0],
  ['curriculum-faculty-management', 'Curriculum & Faculty Management', 0],
  ['financial-management', 'Financial Management', 1],
  ['human-resources-payroll', 'Human Resources & Payroll', 1],
  ['data-analytics-institutional-research', 'Data Analytics & Institutional Research', 1],
  ['regulatory-compliance', 'Regulatory Compliance', 1],
  ['professional-development-organizational-design', 'Professional Development & Organizational Design', 1],
  ['administrative-instructionaltechnology', 'Administrative & Instructional Technology', 2],
  ['change-management', 'Change Management', 2],
  ['technology-solution-selection', 'Technology Solution Selection', 2],
  ['project-management', 'Project Management', 2],
]
pas.forEach(([s, title, c]) =>
  add({_id: `pa-${s}`, _type: 'practiceArea', language: 'en', title, slug: slug(s), category: ref1(paCats[c][0]), legacyUrl: `/practice-area/${s}`}),
)

// ---------- Servicios ----------
const svc = (id, title, s, group, o = {}) =>
  add({_id: `svc-${id}`, _type: 'servicePage', language: 'en', title, slug: slug(s), serviceGroup: group, legacyUrl: `/${s}`, ...o})

const whyCards = [
  ['Higher-ed native delivery', 'Teams made of former higher-ed practitioners who know how institutions run.'],
  ['Clear scope and steady execution', 'Defined scope, realistic timelines and consistent delivery.'],
  ['Governance and ownership clarity', 'Clear decision rights so work keeps moving after we leave.'],
  ['Continuity through staffing and priority shifts', 'Coverage that survives turnover and changing priorities.'],
].map(([title, description]) => card({title, description}))
const talkBullets = ['Flexible, skills-based capacity', 'Vendor-agnostic expertise', 'Embedded, hands-on support', 'Business process optimization', 'AI-informed, real-time delivery'].map((title) => card({title}))
const talkCta = () => sec('ctaSection', {heading: "Let's Talk About What's Next for Your Institution.", bullets: talkBullets, ctas: [cta(int('Contact Us', 'page-talk-to-us'))]})
const whySection = () => sec('cardGridSection', {heading: 'Why Teams Choose Doctums', cards: whyCards, columns: 4})
const linkedinFollow = () => sec('linkedinFollowSection', {heading: 'Follow us on LinkedIn', cta: cta(ext('Follow', 'https://www.linkedin.com/company/doctums-global', true), 'outline')})

svc('advisory', 'Advisory & Optimization Services', 'advisory-optimization-services', 'advisory', {
  isHub: true, orderRank: 1,
  summary: 'Get more from the technology you already have with independent advisory.',
  sections: [
    sec('heroSection', {heading: 'Get More From the Technology You Already Have.', intro: 'Independent, higher-ed native advisory to optimize your systems, processes and teams.'}),
    sec('statsSection', {heading: 'Outcomes', stats: [stat('50%', 'Faster financial aid processing'), stat('20%', 'Lower managed services costs'), stat('✓', 'Enrollment preserved by meeting aid deadlines')]}),
    sec('cardGridSection', {heading: 'Our services', columns: 3, cards: [
      card({title: 'Integration Services', items: ['SaaS-ready integrations for Banner and Colleague']}),
      card({title: 'Data & Reporting Services', items: ['Informer/Argos to Ellucian Insights', 'Data Store Design for SIS']}),
      card({title: 'Constituent Experience Services', items: ['Experience Card development', 'Journey Mapping']}),
      card({title: 'Business Optimization Services', items: ['Portfolio Rationalization', 'Business Process Modeling and Redesign', 'Change Management']}),
      card({title: 'Governance Services', items: ['Data Governance', 'IT Governance']}),
      card({title: 'Staff Augmentation & Managed Services'}),
    ]}),
    sec('practiceAreasSection', {heading: 'Practice Areas and Functional Expertise', categories: paCats.map(([id]) => ref(id))}),
    whySection(), talkCta(), linkedinFollow(),
  ],
})
svc('platform', 'Tech Platform Implementation Services', 'tech-platform-implementation-services', 'platform', {
  isHub: true, orderRank: 2,
  summary: 'The right expertise behind your technology: Banner, Colleague, Anthology, Element451, Student First and Scholarship Magic.',
  sections: [
    sec('heroSection', {heading: 'The Right Expertise Behind Your Technology.'}),
    sec('servicesListSection', {heading: 'Platforms we implement', services: partners.map(([id]) => ref(id)), layout: 'cards'}),
    whySection(),
    sec('faqSection', {heading: 'Frequently asked questions', items: [
      'Which platforms does Doctums implement?', 'How is Doctums different from a vendor implementation team?',
      'How do you reduce rework?', 'What happens after go-live?',
    ].map((question) => ({_type: 'faqItem', _key: key(), question, answer: pt('TODO: migrar respuesta desde doctums.com')}))}),
    talkCta(), linkedinFollow(),
  ],
})
svc('ai', 'AI Strategy & Platform', 'ai-strategy-platform', 'ai', {
  isHub: true, orderRank: 3,
  summary: 'A practical path forward with AI: readiness, governance, tools and a board-ready roadmap.',
  sections: [
    sec('heroSection', {heading: 'A Practical Path Forward With AI.'}),
    sec('richTextSection', {heading: 'The Pressure Is Real. So Are the Constraints.'}),
    sec('bulletListSection', {heading: 'Our Approach to AI Strategy Consulting', items: ['Start with readiness, not tools', 'Govern before you scale', "Build for the staff you have, not the team you wish you had", 'Bring practical AI fluency, not just theoretical expertise'].map((title) => card({title}))}),
    sec('cardGridSection', {heading: "What's Included in a Doctums AI Strategy Engagement?", columns: 3, cards: ['AI Readiness Assessment', 'AI Governance Framework', 'AI Tool Evaluation', 'Board-Ready AI Roadmap', 'Staff Training and Enablement Plan'].map((title) => card({title}))}),
    sec('richTextSection', {heading: 'How It Works'}),
    sec('richTextSection', {heading: 'Who This Is For'}),
    sec('faqSection', {heading: 'FAQs', items: []}),
    sec('ctaSection', {heading: 'Ready to Build a Practical AI Strategy?', ctas: [cta(ext('Book a Discovery Call', 'https://doctums-7677754.hs-sites.com/doctums-sales-calendar', true))]}),
  ],
})
const advisorySubs = [
  ['change-management', 'Change Management'], ['portfolio-rationalization', 'Portfolio Rationalization'],
  ['executive-coaching', 'Executive Coaching'], ['data-governance', 'Data Governance'], ['it-governance', 'IT Governance'],
  ['constituent-experience-services', 'Constituent Experience Services'],
]
advisorySubs.forEach(([s, t], i) => svc(s, t, `advisory-services/${s}`, ['data-governance', 'it-governance'].includes(s) ? 'governance' : 'advisory', {parent: ref1('svc-advisory'), orderRank: 10 + i}))
svc('cybersecurity', 'Cybersecurity', 'cybersecurity-for-higher-education', 'advisory', {parent: ref1('svc-advisory'), orderRank: 20})
svc('edtech-consulting', 'Edtech Consulting', 'higher-education-technology-consulting', 'platform', {parent: ref1('svc-platform'), orderRank: 30})
const ellucianSubs = [
  ['integration-services', 'Integration Services'], ['managed-services', 'Managed Services'], ['optimization-services', 'Optimization Services'],
  ['reporting-and-analytics-services', 'Reporting and Analytics Services'], ['technology-and-business-process-assessments', 'Technology and Business Process Assessments'],
]
ellucianSubs.forEach(([s, t], i) => svc(s, t, `ellucian-implementation-services/${s}`, 'platform', {parent: ref1('svc-platform'), orderRank: 40 + i}))
svc('financial-aid-strategy', 'Financial Aid Strategy', 'financial-aid-strategy', 'advisory', {parent: ref1('svc-advisory'), practiceAreas: [ref('pa-financial-aid')], orderRank: 50, legacyUrl: '/practice-area/financial-aid'})

// ---------- Páginas ----------
const page = (id, title, s, sections, seo) => add({_id: `page-${id}`, _type: 'page', language: 'en', title, slug: slug(s), sections, seo: seo && {_type: 'seo', ...seo}, legacyUrl: s === 'home' ? '/' : `/${s}`})

page('home', 'Home', 'home', [
  sec('heroSection', {variant: 'home', eyebrow: 'Higher Education Technology Strategy & Transformation', heading: 'We help Higher Ed institutions navigate technology decisions with confidence.', serviceCards: [
    card({title: 'Advisory & Optimization Services', cta: cta(int('Advisory & Optimization Services', 'svc-advisory'), 'text')}),
    card({title: 'Tech Platform Implementation Services', cta: cta(int('Tech Platform Implementation Services', 'svc-platform'), 'text')}),
    card({title: 'AI Strategy & Platform', cta: cta(int('AI Strategy & Platform', 'svc-ai'), 'text')}),
  ]}),
  sec('statsSection', {stats: [stat('100+', 'Higher Ed Experts'), stat('20+', 'Years average Higher Ed expertise'), stat('200+', 'Institutions Supported'), stat('7', 'Countries Served Across the Americas')]}),
  sec('cardGridSection', {heading: 'We work with you to optimize your student experience.', intro: 'We are experts on all that helps you to operate your education organization.', columns: 2, cards: [
    card({title: 'Functional knowledge and expertise backed by best-in-class partnerships'}),
    card({title: 'Embedded advisory with independent guidance'}),
  ], cta: cta(int('Discover all areas of practice here', 'page-practice-areas'), 'text')}),
  sec('caseStudiesSection', {heading: 'Partnerships you can trust', items: [ref('case-harcum'), ref('case-westcliff')]}),
  sec('expertiseSection', {heading: 'Our Expertise', columns: [
    group('Functional Knowledge', ['Student Accounts', 'Financial Aid', 'Admissions', 'Finance', 'HR'].map((label) => ({_type: 'link', label}))),
    group('Technical Expertise', ['Banner', 'Colleague', 'Anthology', 'Student First', 'Element451', 'Scholarship Magic', 'Integrations'].map((label) => ({_type: 'link', label}))),
    group('Business Acumen', ['IT Governance', 'Data Governance', 'Student Experience', 'AI Strategy', 'Change Management', 'Business Process Optimization'].map((label) => ({_type: 'link', label}))),
  ]}),
  sec('logoCloudSection', {heading: 'Strategic Partners', partners: [ref('partner-student-first'), ref('partner-element451'), ref('partner-scholarship-magic')]}),
  sec('blogFeedSection', {eyebrow: 'Blog & Insights', heading: 'The people who make things happen in higher education.', mode: 'latest', limit: 3, showCategories: true, showNewsletter: true, cta: cta(int('See all articles', 'page-blog'), 'outline')}),
  sec('officesSection', {heading: 'Global reach', intro: 'We serve institutions across the United States, Canada and Latin America.', offices: offices.map(([id]) => ref(id)), showMap: true}),
  linkedinFollow(),
], {metaTitle: 'Higher Education Technology Consulting & Strategy | Doctums'})

page('about', 'About', 'about', [
  sec('heroSection', {heading: "We're not just consultants.", intro: 'Former registrars, CIOs, EdTech executives and higher-ed leaders.', ctas: [cta(int('Meet our team', 'page-team'))]}),
  sec('richTextSection', {heading: 'Agile, scalable, and cost-effective solutions'}),
  sec('servicesListSection', {heading: 'A portfolio that bridges the gap between strategy and execution', layout: 'list', services: ['svc-advisory', 'svc-platform', 'svc-ai'].map(ref)}),
  sec('officesSection', {heading: 'Global reach', offices: offices.map(([id]) => ref(id))}),
], {metaTitle: 'About Doctums | Experts in Higher Education Technology Strategy'})

page('team', 'Our Team', 'team', [
  sec('heroSection', {heading: "Higher Education's top experts, at your service."}),
  sec('teamSection', {mode: 'all'}),
], {metaTitle: 'Meet Our Higher Education Experts & Consultants | Doctums Team'})

page('talk-to-us', 'Talk to us', 'talk-to-us', [
  sec('heroSection', {heading: 'Higher Education Consulting.'}),
  sec('formSection', {heading: 'Start with a one-hour strategic session.', formType: 'hubspot', successMessage: 'Thank you! We will be in touch shortly.', errorMessage: 'Oops! Something went wrong.'}),
  sec('stepsSection', {heading: 'What happens after you reach out?', steps: ['Schedule your first free consultation', 'We review your current systems and priorities', 'Receive a short report with recommendations'].map((title) => card({title}))}),
  sec('bulletListSection', {heading: 'Why talk to us?', items: talkBullets.map((c) => ({...c, _key: key()}))}),
  linkedinFollow(),
], {metaTitle: 'Schedule a Higher Education Strategy Consultation | Doctums'})

page('for-edtechs', 'For EdTechs', 'for-edtechs', [
  sec('heroSection', {heading: 'For EdTechs.', intro: "Accelerate your product's implementation and change management in higher education."}),
  sec('cardGridSection', {columns: 2, cards: [
    card({title: 'Speed to implementation', items: ['Product Development', 'Technical Implementation services']}),
    card({title: 'Speed to readiness', items: ['Change Management', 'Advisory']}),
  ]}),
  sec('practiceAreasSection', {heading: 'We work with you to optimize your student experience.', categories: paCats.map(([id]) => ref(id))}),
  sec('ctaSection', {heading: 'Partner with Doctums to Transform Experiences Today.', ctas: [cta(int('Contact us', 'page-talk-to-us'))]}),
], {metaTitle: 'EdTech Partnerships & Higher Education Market Strategy | Doctums'})

page('blog', 'Blog', 'blog', [
  sec('blogFeedSection', {heading: 'The people who make things happen in higher education.', mode: 'latest', limit: 12, showCategories: true, showNewsletter: true}),
], {metaTitle: 'Higher Education Insights, Trends & Best Practices | Doctums Blog'})

page('practice-areas', 'Practice Areas', 'practice-areas', [sec('practiceAreasSection', {heading: 'Areas of practice', categories: paCats.map(([id]) => ref(id))})])
page('careers', 'Careers', 'careers', [sec('richTextSection', {heading: 'Careers'})])
page('security', 'Information Security', 'security', [sec('richTextSection', {heading: 'Information Security'})])
page('privacy-policy', 'Privacy Policy', 'privacy-policy', [sec('richTextSection', {heading: 'Privacy Policy'})])

// ---------- Artículos de ejemplo (los 3 destacados de la home) ----------
const post = (s, title, author, cat) =>
  add({_id: `post-${s}`, _type: 'post', language: 'en', title, slug: slug(s), authors: [ref(author)], categories: [ref(cat)], featured: true, body: pt('TODO: migrar contenido desde doctums.com'), legacyUrl: `/blog/${s}`})
post('before-you-choose-a-new-erp-decide-what-success-looks-like', 'Before You Choose a New ERP, Decide What Success Looks Like.', 'person-doctums-team', catIds[6])
post('doctums-and-element451-announce-partnership-to-help-colleges-put-ai-agents-and-an-ai-native-crm-to-work', 'Doctums and Element451 Announce Partnership to Help Colleges Put AI Agents and an AI-Native CRM to Work', 'person-doctums-team', catIds[4])
post('technology-choices-and-the-freedom-to-choose', 'Technology Choices and the Freedom to Choose', `person-${sl('Rodolfo González Gatica')}`, catIds[6])

// ---------- Singletons ----------
const social = [
  {_type: 'socialLink', _key: key(), platform: 'linkedin', url: 'https://www.linkedin.com/company/doctums-global'},
  {_type: 'socialLink', _key: key(), platform: 'youtube', url: 'https://www.youtube.com/@DoctumsHigherEd/featured'},
]
for (const lang of ['en', 'es']) {
  add({
    _id: `siteSettings-${lang}`, _type: 'siteSettings', language: lang, title: 'Doctums',
    tagline: lang === 'en' ? 'Higher Education Technology Strategy & Transformation' : 'Estrategia y transformación tecnológica para la educación superior',
    homePage: lang === 'en' ? ref1('page-home') : undefined, blogPage: lang === 'en' ? ref1('page-blog') : undefined,
    announcement: lang === 'en' ? {enabled: true, text: 'Doctums and Element451 partner to put AI to work for higher education.', cta: {_type: 'cta', link: int('Know more', 'post-doctums-and-element451-announce-partnership-to-help-colleges-put-ai-agents-and-an-ai-native-crm-to-work'), style: 'text'}} : {enabled: false},
    email: 'info@doctums.com', socialLinks: social,
    contactCta: lang === 'en' ? {_type: 'cta', link: int('Contact us', 'page-talk-to-us'), style: 'primary'} : undefined,
    bookingUrl: 'https://doctums-7677754.hs-sites.com/doctums-sales-calendar', gtmId: 'GTM-MXCZC9B7',
  })
}
const nav = (label, id) => int(label, id)
add({
  _id: 'navigation-en', _type: 'navigation', language: 'en',
  items: [
    {_type: 'navItem', _key: key(), label: 'For Institutions', columns: [
      group('Advisory Services', [...advisorySubs.map(([s, t]) => nav(t, `svc-${s}`)), nav('Cybersecurity', 'svc-cybersecurity')]),
      group('Ellucian Services', [nav('Anthology Consulting', 'partner-anthology'), nav('Ellucian Banner Consulting', 'partner-banner'), nav('Ellucian Colleague Consulting', 'partner-colleague'), nav('Edtech Consulting', 'svc-edtech-consulting'), ...ellucianSubs.map(([s, t]) => nav(t, `svc-${s}`))]),
      group('Partners', [nav('Student First SIS', 'partner-student-first'), nav('Scholarship Magic', 'partner-scholarship-magic'), nav('Element 451', 'partner-element451')]),
    ]},
    {_type: 'navItem', _key: key(), label: 'For EdTechs', link: nav('For EdTechs', 'page-for-edtechs')},
    {_type: 'navItem', _key: key(), label: 'Company', columns: [group('Company', [nav('About', 'page-about'), nav('Our Team', 'page-team'), nav('Careers', 'page-careers')])]},
    {_type: 'navItem', _key: key(), label: 'Blog', link: nav('Blog', 'page-blog')},
  ],
  cta: {_type: 'cta', link: nav('Contact us', 'page-talk-to-us'), style: 'primary'},
  languageSwitcher: L([ext('ES - Latin America', '/latam'), ext('EN - United States', '/')]),
})
add({_id: 'navigation-es', _type: 'navigation', language: 'es', items: [], languageSwitcher: L([ext('ES - Latinoamérica', '/latam'), ext('EN - United States', '/')])})

const footerCols = [
  group('Company', [nav('About', 'page-about'), nav('Our Team', 'page-team'), nav('Careers', 'page-careers'), nav('Blog', 'page-blog')]),
  group('Advisory & Optimization', [nav('Advisory Services', 'svc-advisory'), nav('Constituent Experience Services', 'svc-constituent-experience-services'), nav('Change Management', 'svc-change-management'), nav('Executive Coaching', 'svc-executive-coaching'), nav('Portfolio Rationalization', 'svc-portfolio-rationalization'), nav('Financial Aid Strategy', 'svc-financial-aid-strategy'), nav('Admissions', 'pa-admission-enrollment-management')]),
  group('Tech Platform Implementation', [nav('Banner', 'partner-banner'), nav('Colleague', 'partner-colleague'), nav('Anthology', 'partner-anthology'), nav('Student First', 'partner-student-first'), nav('Element451', 'partner-element451'), nav('Scholarship Magic', 'partner-scholarship-magic'), nav('Integration Services', 'svc-integration-services')]),
  group('AI Strategy & Platform', [nav('IT Governance', 'svc-it-governance'), nav('Data Governance', 'svc-data-governance'), nav('Change Management', 'svc-change-management'), nav('Business Process Optimization', 'svc-technology-and-business-process-assessments')]),
]
add({_id: 'footer-en', _type: 'footer', language: 'en', connectTitle: 'Connect with us', columns: footerCols, legalLinks: L([nav('Information Security', 'page-security'), nav('Privacy Policy', 'page-privacy-policy')]), copyright: 'Doctums 2026 ® | All rights reserved.', disclaimer: 'All product names, logos and brands are property of their respective owners.'})
add({_id: 'footer-es', _type: 'footer', language: 'es', connectTitle: 'Conéctate con nosotros', columns: [], copyright: 'Doctums 2026 ® | Todos los derechos reservados.'})

// ---------- Redirecciones ----------
const redirects = [
  ['/old-home', '/'], ['/services/advisory', '/advisory-optimization-services'],
  ['/practice-area/financial-aid', '/financial-aid-strategy'],
]
redirects.forEach(([source, destination], i) => add({_id: `redirect-${i + 1}`, _type: 'redirect', source, destination, permanent: true, note: 'Migración Webflow → Sanity'}))

// ---------- Escribir ----------
const clean = (o) => JSON.parse(JSON.stringify(o)) // quita undefined
mkdirSync('seed', {recursive: true})
writeFileSync('seed/doctums-seed.ndjson', docs.map((d) => JSON.stringify(clean(d))).join('\n') + '\n')
console.log(`✔ ${docs.length} documentos → seed/doctums-seed.ndjson`)
