// Objects
import {link} from './objects/link'
import {cta} from './objects/cta'
import {seo} from './objects/seo'
import {imageWithAlt} from './objects/imageWithAlt'
import {blockContent} from './objects/blockContent'
import {stat} from './objects/stat'
import {card} from './objects/card'
import {linkGroup} from './objects/linkGroup'
import {navItem} from './objects/navItem'
import {socialLink} from './objects/socialLink'
import {faqItem} from './objects/faqItem'
import {webflowMeta} from './objects/webflowMeta'
import {serviceItem} from './objects/serviceItem'
import {highlight} from './objects/highlight'
// Sections (page builder)
import {sections} from './sections'
// Documents
import {siteSettings} from './documents/siteSettings'
import {navigation} from './documents/navigation'
import {footer} from './documents/footer'
import {page} from './documents/page'
import {servicePage} from './documents/servicePage'
import {post} from './documents/post'
import {blogCategory} from './documents/blogCategory'
import {person} from './documents/person'
import {practiceArea} from './documents/practiceArea'
import {practiceAreaCategory} from './documents/practiceAreaCategory'
import {partner} from './documents/partner'
import {caseStudy} from './documents/caseStudy'
import {caseStudyHighlight} from './documents/caseStudyHighlight'
import {office} from './documents/office'
import {faq} from './documents/faq'
import {redirect} from './documents/redirect'

export const schemaTypes = [
  // objects
  link, cta, seo, imageWithAlt, blockContent, stat, card, linkGroup, navItem, socialLink, faqItem, webflowMeta, serviceItem, highlight,
  // sections
  ...sections,
  // documents
  siteSettings, navigation, footer, page, servicePage, post, blogCategory, person,
  practiceArea, practiceAreaCategory, partner, caseStudy, caseStudyHighlight, office, faq, redirect,
]
