import { Link } from 'react-router-dom'

export default function ProjectCard({ image, title, description, techs, category }) {
  return (
    <article className="project-card">
      <div className="project-thumb">
        {image ? (
          <>
            <img
              src={image}
              alt={`${title} project screenshot`}
              onError={(event) => {
                event.currentTarget.style.display = 'none'
                event.currentTarget.nextElementSibling?.removeAttribute('hidden')
              }}
            />
            <div className="image-fallback" hidden role="img" aria-label={`${title} image unavailable`}>
              Project image unavailable
            </div>
          </>
        ) : (
          <div className="placeholder-thumb">Project screenshot placeholder</div>
        )}
        {category && <span className="project-badge badge">{category}</span>}
      </div>

      <div className="project-body">
        <h3>{title}</h3>
        <p className="muted">{description}</p>

        {techs && techs.length > 0 && (
          <div className="tech-tags">
            {techs.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        )}

        <Link to="/projects" className="card-link">
          View Project
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M3 8h9m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
      </div>
    </article>
  )
}
