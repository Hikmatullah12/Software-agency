import { useEffect, useMemo, useState } from 'react'
import { adminRequest, API_URL } from '../../auth/api'
import { useToast } from '../components/Toast'
import ConfirmModal from '../components/ConfirmModal'
import ImageDropzone from '../components/ImageDropzone'

const emptyForm = {
  title: '', service_id: '', category: '', client: '', start_date: '', end_date: '', status: 'active',
  short_description: '', description: '', challenge: '', solution: '', impact_metrics: '',
  technologies: '', live_demo_url: '', github_url: '',
}

const statusOptions = ['planned', 'active', 'completed', 'archived']

function resolveImage(src) {
  if (!src) return null
  return src.startsWith('http') ? src : `${API_URL}${src}`
}

export default function ProjectsManagement() {
  const { notify } = useToast()
  const [projects, setProjects] = useState([])
  const [services, setServices] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [selectedTeamIds, setSelectedTeamIds] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [image, setImage] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function loadAll() {
    setLoading(true)
    try {
      const [projectsData, servicesData, teamData] = await Promise.all([
        adminRequest('/api/projects'),
        adminRequest('/api/services'),
        adminRequest('/api/team-members'),
      ])
      setProjects(projectsData.projects)
      setServices(servicesData.services)
      setTeamMembers(teamData.teamMembers)
    } catch (requestError) {
      notify(requestError.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { loadAll() }, 0)
    return () => window.clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function toggleTeamMember(id) {
    setSelectedTeamIds((current) => (current.includes(id) ? current.filter((v) => v !== id) : [...current, id]))
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
    setSelectedTeamIds([])
    setImage(null)
    setError('')
  }

  function beginEdit(project) {
    setEditingId(project.id)
    setForm({
      title: project.title,
      service_id: String(project.service_id),
      category: project.category || '',
      client: project.client || '',
      start_date: project.start_date ? project.start_date.slice(0, 10) : '',
      end_date: project.end_date ? project.end_date.slice(0, 10) : '',
      status: project.status || 'active',
      short_description: project.short_description || '',
      description: project.description || '',
      challenge: project.challenge || '',
      solution: project.solution || '',
      impact_metrics: project.impact_metrics || '',
      technologies: project.technologies || '',
      live_demo_url: project.live_demo_url || '',
      github_url: project.github_url || '',
    })
    setSelectedTeamIds((project.team_members || []).map((m) => m.id))
    setImage(null)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    const body = new FormData()
    Object.entries(form).forEach(([key, value]) => body.append(key, value))
    body.append('team_member_ids', selectedTeamIds.join(','))
    if (image) body.append('image', image)

    try {
      const data = await adminRequest(editingId ? `/api/projects/${editingId}` : '/api/projects', {
        method: editingId ? 'PUT' : 'POST',
        body,
      })
      notify(data.message, 'success')
      resetForm()
      await loadAll()
    } catch (requestError) {
      setError(requestError.message)
      notify(requestError.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      const data = await adminRequest(`/api/projects/${pendingDelete.id}`, { method: 'DELETE' })
      notify(data.message, 'success')
      setPendingDelete(null)
      await loadAll()
    } catch (requestError) {
      notify(requestError.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  const categories = useMemo(() => Array.from(new Set(projects.map((p) => p.category).filter(Boolean))), [projects])

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter
      const matchesService = serviceFilter === 'all' || String(p.service_id) === serviceFilter
      return matchesSearch && matchesCategory && matchesService
    })
  }, [projects, search, categoryFilter, serviceFilter])

  return (
    <section>
      <div className="admin-page-header">
        <div>
          <p className="admin-kicker">Portfolio</p>
          <h1>Projects</h1>
          <p className="admin-intro">Manage the case studies shown on your public Projects page.</p>
        </div>
        {editingId && <button type="button" className="secondary-button" onClick={resetForm}>+ New project</button>}
      </div>

      <form className="admin-form-card" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit project' : 'Add project'}</h2>
        <div className="admin-form-grid">
          <label>Project Title
            <input name="title" value={form.title} onChange={updateField} maxLength="255" required />
          </label>
          <label>Service
            <select name="service_id" value={form.service_id} onChange={updateField} required>
              <option value="">Select a service</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label>Category
            <input name="category" value={form.category} onChange={updateField} maxLength="100" placeholder="e.g. Web Development" />
          </label>
          <label>Client Name
            <input name="client" value={form.client} onChange={updateField} maxLength="255" />
          </label>
          <label>Start Date
            <input type="date" name="start_date" value={form.start_date} onChange={updateField} />
          </label>
          <label>End Date
            <input type="date" name="end_date" value={form.end_date} onChange={updateField} />
          </label>
          <label>Status
            <select name="status" value={form.status} onChange={updateField}>
              {statusOptions.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
            </select>
          </label>
          <label>Live Demo URL
            <input type="url" name="live_demo_url" value={form.live_demo_url} onChange={updateField} placeholder="https://..." />
          </label>
          <label>GitHub URL
            <input type="url" name="github_url" value={form.github_url} onChange={updateField} placeholder="https://github.com/..." />
          </label>
          <label className="wide-field">Short Description
            <textarea name="short_description" value={form.short_description} onChange={updateField} rows="2" maxLength="500" />
          </label>
          <label className="wide-field">Full Description
            <textarea name="description" value={form.description} onChange={updateField} rows="4" required />
          </label>
          <label className="wide-field">Challenge
            <textarea name="challenge" value={form.challenge} onChange={updateField} rows="3" placeholder="What problem did the client face?" />
          </label>
          <label className="wide-field">Solution
            <textarea name="solution" value={form.solution} onChange={updateField} rows="3" placeholder="How did we solve it?" />
          </label>
          <label className="wide-field">Impact Metrics
            <textarea name="impact_metrics" value={form.impact_metrics} onChange={updateField} rows="2" placeholder="e.g. 40% faster load times, 2x conversion rate" />
          </label>
          <label className="wide-field">Technologies <span className="field-hint">(comma-separated)</span>
            <input name="technologies" value={form.technologies} onChange={updateField} placeholder="React, Node.js, MySQL" required />
          </label>

          <div className="wide-field">
            <span className="field-label">Assigned Team Members</span>
            {teamMembers.length === 0 ? (
              <p className="muted" style={{ fontSize: 13 }}>No team members yet — add some under Team Members first.</p>
            ) : (
              <div className="team-assign-list">
                {teamMembers.map((member) => (
                  <label className="team-assign-item" key={member.id}>
                    <input
                      type="checkbox"
                      checked={selectedTeamIds.includes(member.id)}
                      onChange={() => toggleTeamMember(member.id)}
                    />
                    {member.full_name} <span className="muted">— {member.role}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <ImageDropzone label="Project Image" existingUrl={editingId ? resolveImage(projects.find((p) => p.id === editingId)?.cover_image) : null} onChange={setImage} />
        </div>
        {error && <div className="error">{error}</div>}
        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save changes' : 'Create project'}</button>
          {editingId && <button type="button" className="secondary-button" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <div className="admin-toolbar">
        <div className="admin-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
          <input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {categories.length > 0 && (
          <select className="admin-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <select className="admin-select" value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
          <option value="all">All services</option>
          {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="admin-loading-state">Loading projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="admin-empty-state">No projects match your filters.</div>
      ) : (
        <div className="admin-card-grid">
          {filteredProjects.map((project) => (
            <div className="admin-item-card" key={project.id}>
              <div className="admin-item-thumb">
                {project.cover_image ? (
                  <img src={resolveImage(project.cover_image)} alt={project.title} onError={(e) => { e.currentTarget.style.display = 'none' }} />
                ) : (
                  <div className="image-fallback">No image</div>
                )}
              </div>
              <div className="admin-item-body">
                <h4>{project.title}</h4>
                <div className="admin-item-meta">{project.service_name} {project.client ? `· ${project.client}` : ''}</div>
                <span className="status-pill is-active" style={{ textTransform: 'capitalize' }}>{project.status}</span>
                {project.team_members?.length > 0 && (
                  <div className="chip-row">
                    {project.team_members.slice(0, 3).map((m) => <span className="chip" key={m.id}>{m.full_name}</span>)}
                  </div>
                )}
                <div className="admin-item-actions">
                  <button type="button" className="icon-button" onClick={() => beginEdit(project)}>Edit</button>
                  <button type="button" className="danger-button" onClick={() => setPendingDelete(project)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete project?"
        message={pendingDelete ? `This will permanently delete "${pendingDelete.title}" and its team assignments. This cannot be undone.` : ''}
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </section>
  )
}
