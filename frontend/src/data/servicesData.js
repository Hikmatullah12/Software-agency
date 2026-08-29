import webImg from '../../../images/services/service-web-development.jpg'
import mobileImg from '../../../images/services/service-mobile-development.jpg'
import uiuxImg from '../../../images/services/service-uiux-design.jpg'
import dbImg from '../../../images/services/service-database-solutions.jpg'
import cyberImg from '../../../images/services/service-cybersecurity.jpg'
import consultImg from '../../../images/services/service-it-consulting.jpg'

// Static fallback content shown when the database has no services yet.
// Keys are matched against API service slugs/names so admin-entered data
// takes over automatically once services are added.
export const fallbackServices = [
  {
    id: 'fallback-web',
    slug: 'web-development',
    name: 'Web Development',
    image: webImg,
    summary: 'Full-stack web applications, responsive frontends, and APIs.',
    techs: ['React', 'Node.js', 'Express', 'REST'],
  },
  {
    id: 'fallback-mobile',
    slug: 'mobile-app-development',
    name: 'Mobile App Development',
    image: mobileImg,
    summary: 'Cross-platform and native mobile apps with smooth UX.',
    techs: ['React Native', 'Flutter', 'iOS', 'Android'],
  },
  {
    id: 'fallback-uiux',
    slug: 'ui-ux-design',
    name: 'UI/UX Design',
    image: uiuxImg,
    summary: 'User-centered design, prototypes, and usability testing.',
    techs: ['Figma', 'Prototyping', 'Design Systems'],
  },
  {
    id: 'fallback-db',
    slug: 'database-solutions',
    name: 'Database Solutions',
    image: dbImg,
    summary: 'Relational and NoSQL database design and optimization.',
    techs: ['MySQL', 'Postgres', 'MongoDB'],
  },
  {
    id: 'fallback-cyber',
    slug: 'cybersecurity',
    name: 'Cybersecurity',
    image: cyberImg,
    summary: 'Security assessments, hardening, and incident response.',
    techs: ['Pen-testing', 'Vulnerability Scans', 'Monitoring'],
  },
  {
    id: 'fallback-consulting',
    slug: 'it-consulting',
    name: 'IT Consulting',
    image: consultImg,
    summary: 'Technical strategy, cloud migration, and operational best practices.',
    techs: ['Cloud', 'Architecture', 'DevOps'],
  },
]

const imageBySlugFragment = [
  { matches: ['web'], image: webImg },
  { matches: ['mobile', 'app'], image: mobileImg },
  { matches: ['ui', 'ux', 'design'], image: uiuxImg },
  { matches: ['database', 'db', 'data'], image: dbImg },
  { matches: ['cyber', 'security'], image: cyberImg },
  { matches: ['consult', 'it-consult'], image: consultImg },
]

// Picks a relevant local image for a DB-provided service that has no uploaded image yet.
export function getLocalServiceImage(service) {
  const key = `${service.slug || ''} ${service.name || ''}`.toLowerCase()
  return imageBySlugFragment.find(({ matches }) => matches.some((m) => key.includes(m)))?.image
}
