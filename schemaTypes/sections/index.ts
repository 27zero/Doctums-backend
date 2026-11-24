import {heroSection} from './heroSection'
import {statsSection} from './statsSection'
import {cardGridSection} from './cardGridSection'
import {textMediaSection} from './textMediaSection'
import {richTextSection} from './richTextSection'
import {bulletListSection} from './bulletListSection'
import {stepsSection} from './stepsSection'
import {faqSection} from './faqSection'
import {ctaSection} from './ctaSection'
import {logoCloudSection} from './logoCloudSection'
import {caseStudiesSection} from './caseStudiesSection'
import {expertiseSection} from './expertiseSection'
import {teamSection} from './teamSection'
import {blogFeedSection} from './blogFeedSection'
import {officesSection} from './officesSection'
import {practiceAreasSection} from './practiceAreasSection'
import {servicesListSection} from './servicesListSection'
import {formSection} from './formSection'
import {linkedinFollowSection} from './linkedinFollowSection'

export const sections = [
  heroSection, statsSection, cardGridSection, textMediaSection, richTextSection, bulletListSection,
  stepsSection, faqSection, ctaSection, logoCloudSection, caseStudiesSection, expertiseSection,
  teamSection, blogFeedSection, officesSection, practiceAreasSection, servicesListSection,
  formSection, linkedinFollowSection,
]

// Array usado por el campo "sections" de page y servicePage
export const pageBuilderMembers = sections.map((s) => ({type: s.name}))
