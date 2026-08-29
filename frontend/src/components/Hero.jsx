import { Link } from 'react-router-dom'
import hero from '../../../images/home/hero-agency.jpg'
import SafeImage from './SafeImage'

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-shape hero-shape-a" aria-hidden="true" />
      <div className="hero-shape hero-shape-b" aria-hidden="true" />
      <div className="container hero-inner">
        <div className="hero-text">
          <span className="eyebrow on-dark-eyebrow">Software &amp; Digital Solutions</span>
          <h1>Building Digital Solutions for Modern Businesses</h1>
          <p>
            Hikmat Tech Solutions delivers reliable web, mobile, database,
            cybersecurity, and IT solutions that help businesses grow,
            modernize, and operate more efficiently.
          </p>
          <div className="hero-actions">
            <Link to="/services" className="btn primary">Explore Our Services</Link>
            <Link to="/projects" className="btn outline">View Our Projects</Link>
          </div>
        </div>

        <div className="hero-image">
          <div className="hero-image-frame">
            <SafeImage src={hero} alt="Hikmat Tech Solutions team collaborating" className="hero-image-asset" fallback="Agency image unavailable" />
          </div>
          <div className="hero-floating-card">
            <span className="dot" />
            <div>
              <strong>Delivery on track</strong>
              <small>Agile sprints, weekly updates</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
