import { Link } from 'react-router-dom'
import SafeImage from './SafeImage'

export default function ServiceCard({ image, title, description, techs, category }) {
  return (
    <article className="service-card">
      <div className="service-media">
        <SafeImage src={image} alt={`${title} service`} fallback="Service image unavailable" />
        {category && <span className="service-badge badge">{category}</span>}
      </div>
      <div className="service-body">
        <h3>{title}</h3>
        <p className="muted">{description}</p>
        {techs && techs.length > 0 && (
          <div className="tech-tags">
            {techs.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        )}
        <div className="service-actions">
          <Link to="/services" className="card-link">
            Learn More
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M3 8h9m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
        </div>
      </div>
    </article>
  )
}
