import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './home.css'
import Hero from '../components/Hero'
import ServiceCard from '../components/ServiceCard'
import ProjectCard from '../components/ProjectCard'
import CTA from '../components/CTA'
import SafeImage from '../components/SafeImage'
import { API_URL } from '../auth/api'
import { fallbackServices, getLocalServiceImage } from '../data/servicesData'
import { fallbackProjects } from '../data/projectsData'
import aboutImg from '../../../images/about/about-agency.jpg'

const whyChooseUs = [
  {
    title: 'Modern Technology',
    description: 'We build with current frameworks and scalable, maintainable architectures.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M9 3 3 12l6 9M15 3l6 9-6 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    ),
  },
  {
    title: 'Skilled Team',
    description: 'Experienced engineers and designers who care about quality and craft.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    ),
  },
  {
    title: 'Reliable Delivery',
    description: 'Structured, transparent project delivery that keeps timelines on track.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden><path d="m9 12 2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    ),
  },
  {
    title: 'Ongoing Support',
    description: 'Responsive maintenance and support plans after your project ships.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    ),
  },
]

const stats = [
  { value: '50+', label: 'Projects in Portfolio' },
  { value: '6+', label: 'Core Services' },
  { value: '4+', label: 'Team Members' },
  { value: '100%', label: 'Client-Focused' },
]

export default function Home() {
  const [services, setServices] = useState(fallbackServices)
  const [projects, setProjects] = useState(fallbackProjects.slice(0, 3))

  useEffect(() => {
    fetch(`${API_URL}/api/services`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        const active = (data.services || []).filter((s) => s.is_active)
        if (active.length === 0) return
        setServices(
          active.slice(0, 6).map((s) => ({
            id: s.id,
            slug: s.slug,
            name: s.name,
            summary: s.summary || s.description || '',
            image: s.image_path ? `${API_URL}${s.image_path}` : getLocalServiceImage(s),
            techs: [],
          })),
        )
      })
      .catch(() => {})

    fetch(`${API_URL}/api/projects`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!Array.isArray(data.projects) || data.projects.length === 0) return
        setProjects(
          data.projects.slice(0, 3).map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            techs: p.technologies ? p.technologies.split(',').map((t) => t.trim()).filter(Boolean) : [],
            category: p.service_name,
            image: p.cover_image ? `${API_URL}${p.cover_image}` : undefined,
          })),
        )
      })
      .catch(() => {})
  }, [])

  return (
    <div className="page home-page">
      <Hero />

      <section className="about-preview section bg-white">
        <div className="container">
          <div className="about-preview-media">
            <SafeImage src={aboutImg} alt="Hikmat Tech Solutions team at work" fallback="About image unavailable" />
          </div>
          <div>
            <span className="eyebrow">About Us</span>
            <h2>Technology Solutions Built Around Your Business</h2>
            <p>
              We combine engineering expertise with a user-centered approach to
              build web and mobile applications, database systems, and secure
              infrastructure that fit the way your business actually works.
            </p>
            <ul className="about-preview-features">
              <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg> Modern Technology</li>
              <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg> Experienced Team</li>
              <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg> Scalable Solutions</li>
              <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg> Client-Focused Approach</li>
            </ul>
            <Link to="/about" className="btn primary">Learn More</Link>
          </div>
        </div>
      </section>

      <section className="featured-services section bg-light-blue">
        <div className="container">
          <div className="section-header centered">
            <span className="eyebrow">What We Do</span>
            <h2>Featured Services</h2>
            <p>Practical, well-engineered solutions across the technology stack.</p>
          </div>
          <div className="services-grid">
            {services.map((s) => (
              <ServiceCard key={s.id} title={s.name} image={s.image} description={s.summary} techs={s.techs} />
            ))}
          </div>
          <div className="section-footer-cta">
            <Link to="/services" className="btn outline">View All Services</Link>
          </div>
        </div>
      </section>

      <section className="why-choose section bg-white">
        <div className="container">
          <div className="section-header centered">
            <span className="eyebrow">Why Hikmat Tech Solutions</span>
            <h2>Why Choose Us</h2>
          </div>
          <div className="why-grid">
            {whyChooseUs.map((item) => (
              <div className="why-item" key={item.title}>
                <div className="why-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p className="muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="stats-section bg-dark">
        <div className="container stats-grid">
          {stats.map((s) => (
            <div className="stat-item" key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="featured-projects section bg-light-blue">
        <div className="container">
          <div className="section-header centered">
            <span className="eyebrow">Our Work</span>
            <h2>Featured Projects</h2>
            <p>A look at recent work across web, mobile, and data-driven products.</p>
          </div>
          <div className="projects-grid">
            {projects.map((p) => (
              <ProjectCard key={p.id} {...p} />
            ))}
          </div>
          <div className="section-footer-cta">
            <Link to="/projects" className="btn outline">View All Projects</Link>
          </div>
        </div>
      </section>

      <CTA />
    </div>
  )
}
