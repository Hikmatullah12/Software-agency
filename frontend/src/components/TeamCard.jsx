import SafeImage from './SafeImage'
import { API_URL } from '../auth/api'

export default function TeamCard({ name, role, bio, photo, skills, linkedin, github }) {
  const initials = name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .slice(0, 2)

  const skillList = (skills || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <article className="team-card">
      <div className="avatar">
        {photo ? (
          <SafeImage
            src={photo.startsWith('/') ? `${API_URL}${photo}` : photo}
            alt={`${name}, ${role}`}
            fallback="Profile image unavailable"
          />
        ) : (
          <span aria-hidden>{initials}</span>
        )}
      </div>
      <div className="team-info">
        <h4>{name}</h4>
        <p className="muted">{role}</p>
        {bio && <p className="team-bio">{bio}</p>}
        {skillList.length > 0 && (
          <div className="tech-tags">
            {skillList.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        )}
        {(linkedin || github) && (
          <div className="team-links">
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${name} on LinkedIn`}>
                LinkedIn
              </a>
            )}
            {linkedin && github && <span aria-hidden> · </span>}
            {github && (
              <a href={github} target="_blank" rel="noopener noreferrer" aria-label={`${name} on GitHub`}>
                GitHub
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
