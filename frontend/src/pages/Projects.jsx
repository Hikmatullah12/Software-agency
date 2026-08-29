import { useEffect, useMemo, useState } from 'react'
import './projects.css'
import ProjectCard from '../components/ProjectCard'
import CTA from '../components/CTA'
import { API_URL } from '../auth/api'
import { fallbackProjects } from '../data/projectsData'

export default function Projects() {
  const [projects, setProjects] = useState(fallbackProjects)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    fetch(`${API_URL}/api/projects`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!Array.isArray(data.projects) || data.projects.length === 0) return
        setProjects(
          data.projects.map((p) => ({
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

  const categories = useMemo(() => {
    const unique = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))
    return ['All', ...unique]
  }, [projects])

  const visibleProjects = activeCategory === 'All' ? projects : projects.filter((p) => p.category === activeCategory)

  return (
    <div className="page projects-page">
      <section className="page-hero bg-light-blue">
        <div className="container">
          <span className="eyebrow">Our Work</span>
          <h1>Projects</h1>
          <p className="lead">Selected projects and case studies from our portfolio.</p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          {categories.length > 2 && (
            <div className="project-filters" role="tablist" aria-label="Filter projects by category">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === cat}
                  className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="projects-grid">
            {visibleProjects.map((p) => (
              <ProjectCard key={p.id} {...p} />
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </div>
  )
}
