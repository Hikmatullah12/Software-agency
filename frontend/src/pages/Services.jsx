import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './services.css'
import ServiceCard from '../components/ServiceCard'
import CTA from '../components/CTA'
import { API_URL } from '../auth/api'
import { fallbackServices, getLocalServiceImage } from '../data/servicesData'

const benefits = [
  { title: 'Tailored to your business', description: 'Every engagement starts with your goals, not a generic template.' },
  { title: 'Transparent process', description: 'Clear timelines, regular updates, and no surprises along the way.' },
  { title: 'Built to scale', description: 'Architecture decisions made with your future growth in mind.' },
]

export default function Services() {
  const [services, setServices] = useState(fallbackServices)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/api/services`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        const active = (data.services || []).filter((s) => s.is_active)
        if (active.length === 0) return
        setServices(
          active.map((s) => ({
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
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page services-page">
      <section className="page-hero bg-light-blue">
        <div className="container">
          <span className="eyebrow">What We Offer</span>
          <h1>Services</h1>
          <p className="lead">
            Explore the services we offer to help your business build, secure,
            and scale its technology.
          </p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          {loading && services === fallbackServices && (
            <p className="team-status" role="status">Loading services...</p>
          )}
          <div className="services-grid">
            {services.map((s) => (
              <ServiceCard key={s.id} title={s.name} image={s.image} description={s.summary} techs={s.techs} />
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-light-blue">
        <div className="container">
          <div className="section-header centered">
            <span className="eyebrow">Why It Works</span>
            <h2>Benefits of Working With Us</h2>
          </div>
          <div className="why-grid benefits-grid">
            {benefits.map((b) => (
              <div className="why-item" key={b.title}>
                <h3>{b.title}</h3>
                <p className="muted">{b.description}</p>
              </div>
            ))}
          </div>
          <div className="section-footer-cta">
            <Link to="/contact" className="btn primary">Discuss Your Project</Link>
          </div>
        </div>
      </section>

      <CTA />
    </div>
  )
}
