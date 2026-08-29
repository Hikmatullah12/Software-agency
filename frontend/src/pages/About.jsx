import './about.css'
import { useEffect, useState } from 'react'
import aboutImg from '../../../images/about/about-agency.jpg'
import TeamCard from '../components/TeamCard'
import SafeImage from '../components/SafeImage'
import CTA from '../components/CTA'
import { API_URL } from '../auth/api'

const values = [
  { title: 'Integrity', description: 'Transparent communication and ethical practices.' },
  { title: 'Quality', description: 'Delivering reliable, maintainable software.' },
  { title: 'Collaboration', description: 'Partnering closely with clients for the best outcomes.' },
  { title: 'Innovation', description: 'Always learning and applying modern practices.' },
]

export default function About() {
  const [team, setTeam] = useState([])
  const [teamLoading, setTeamLoading] = useState(true)
  const [teamError, setTeamError] = useState('')

  useEffect(() => {
    // ?active=1 ensures only members marked active in the admin portal show publicly.
    fetch(`${API_URL}/api/team-members?active=1`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Unable to load team'))))
      .then((data) => setTeam(Array.isArray(data.teamMembers) ? data.teamMembers : []))
      .catch(() => setTeamError('Our team directory is temporarily unavailable. Please check back soon.'))
      .finally(() => setTeamLoading(false))
  }, [])

  return (
    <div className="page about-page">
      <section className="about-hero section bg-light-blue">
        <div className="container hero-grid">
          <div className="hero-media">
            <SafeImage src={aboutImg} alt="Hikmat Tech Solutions office and team" fallback="About image unavailable" />
          </div>
          <div className="hero-content">
            <span className="eyebrow">About Us</span>
            <h1>About Hikmat Tech Solutions</h1>
            <p className="lead">
              Hikmat Tech Solutions is a professional software services agency
              focused on delivering quality digital products for businesses.
            </p>
            <p>
              We combine engineering excellence with a user-centered approach
              to build web and mobile applications, database systems, and
              secure infrastructure.
            </p>
          </div>
        </div>
      </section>

      <section className="our-story section bg-white">
        <div className="container">
          <div className="section-header centered">
            <span className="eyebrow">Our Story</span>
            <h2>Founded by Engineers, Built for Businesses</h2>
          </div>
          <p className="story-text">
            Founded by experienced technologists, our agency grew from a small
            team of engineers into a full-service firm delivering end-to-end
            solutions for clients across industries.
          </p>
        </div>
      </section>

      <section className="mission-vision section bg-light-blue">
        <div className="container mv-grid">
          <div className="mv-card">
            <h3>Our Mission</h3>
            <p>
              To empower businesses through tailored software solutions that
              drive growth and efficiency.
            </p>
          </div>
          <div className="mv-card">
            <h3>Our Vision</h3>
            <p>
              To be a trusted technology partner known for innovation, quality,
              and long-term client success.
            </p>
          </div>
        </div>
      </section>

      <section className="core-values section bg-white">
        <div className="container">
          <div className="section-header centered">
            <span className="eyebrow">What Guides Us</span>
            <h2>Our Core Values</h2>
          </div>
          <ul className="values-list">
            {values.map((v) => (
              <li key={v.title}>
                <strong>{v.title}</strong>
                <p>{v.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="team section bg-light-blue">
        <div className="container">
          <div className="section-header centered">
            <span className="eyebrow">Meet the Team</span>
            <h2>Team</h2>
            <p>Our team brings diverse skills and industry experience.</p>
          </div>
          {teamLoading && <p className="team-status" role="status">Loading our team...</p>}
          {teamError && <p className="team-status" role="status">{teamError}</p>}
          {!teamLoading && !teamError && team.length === 0 && (
            <p className="team-status" role="status">Our team directory is being updated. Check back soon.</p>
          )}
          <div className="team-grid">
            {team.map((member) => (
              <TeamCard
                key={member.id}
                name={member.full_name}
                role={member.role}
                bio={member.bio}
                photo={member.photo}
                skills={member.skills}
                linkedin={member.linkedin}
                github={member.github}
              />
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </div>
  )
}
