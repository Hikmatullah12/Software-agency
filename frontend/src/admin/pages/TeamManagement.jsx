import { useEffect, useMemo, useState } from 'react'
import { adminRequest, API_URL } from '../../auth/api'
import { useToast } from '../components/Toast'
import ConfirmModal from '../components/ConfirmModal'
import ImageDropzone from '../components/ImageDropzone'

const emptyForm = { name: '', role: '', bio: '', email: '', skills: '', linkedin: '', github: '', is_active: true }

function resolvePhoto(photo) {
  if (!photo) return null
  return photo.startsWith('http') ? photo : `${API_URL}${photo}`
}

export default function TeamManagement() {
  const { notify } = useToast()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [image, setImage] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function loadMembers() {
    setLoading(true)
    try {
      const data = await adminRequest('/api/team-members')
      setMembers(data.teamMembers)
    } catch (requestError) {
      notify(requestError.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { loadMembers() }, 0)
    return () => window.clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function updateField(event) {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
    setImage(null)
    setError('')
  }

  function beginEdit(member) {
    setEditingId(member.id)
    setForm({
      name: member.full_name,
      role: member.role || '',
      bio: member.bio || '',
      email: member.email || '',
      skills: member.skills || '',
      linkedin: member.linkedin || '',
      github: member.github || '',
      is_active: Boolean(member.is_active),
    })
    setImage(null)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    const body = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'is_active') body.append(key, value ? '1' : '0')
      else body.append(key, value)
    })
    if (image) body.append('image', image)

    try {
      const data = await adminRequest(editingId ? `/api/team-members/${editingId}` : '/api/team-members', {
        method: editingId ? 'PUT' : 'POST',
        body,
      })
      notify(data.message, 'success')
      resetForm()
      await loadMembers()
    } catch (requestError) {
      setError(requestError.message)
      notify(requestError.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(member) {
    try {
      const data = await adminRequest(`/api/team-members/${member.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: member.is_active ? 0 : 1 }),
      })
      notify(data.message, 'success')
      await loadMembers()
    } catch (requestError) {
      notify(requestError.message, 'error')
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      const data = await adminRequest(`/api/team-members/${pendingDelete.id}`, { method: 'DELETE' })
      notify(data.message, 'success')
      setPendingDelete(null)
      await loadMembers()
    } catch (requestError) {
      notify(requestError.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch = !search || m.full_name.toLowerCase().includes(search.toLowerCase()) || (m.role || '').toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? m.is_active : !m.is_active)
      return matchesSearch && matchesStatus
    })
  }, [members, search, statusFilter])

  return (
    <section>
      <div className="admin-page-header">
        <div>
          <p className="admin-kicker">People Directory</p>
          <h1>Team Members</h1>
          <p className="admin-intro">Manage the people that appear on your public Team section.</p>
        </div>
        {editingId && <button type="button" className="secondary-button" onClick={resetForm}>+ New member</button>}
      </div>

      <form className="admin-form-card" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit team member' : 'Add team member'}</h2>
        <div className="admin-form-grid">
          <label>Full Name
            <input name="name" value={form.name} onChange={updateField} maxLength="255" required />
          </label>
          <label>Role
            <input name="role" value={form.role} onChange={updateField} maxLength="150" required />
          </label>
          <label>Email
            <input type="email" name="email" value={form.email} onChange={updateField} maxLength="255" />
          </label>
          <label>Skills <span className="field-hint">(comma-separated, e.g. React, Node.js, MySQL)</span>
            <input name="skills" value={form.skills} onChange={updateField} placeholder="React, Node.js, MySQL, JavaScript" />
          </label>
          <label>LinkedIn URL
            <input type="url" name="linkedin" value={form.linkedin} onChange={updateField} placeholder="https://linkedin.com/in/..." />
          </label>
          <label>GitHub URL
            <input type="url" name="github" value={form.github} onChange={updateField} placeholder="https://github.com/..." />
          </label>
          <label className="wide-field">Short Bio
            <textarea name="bio" value={form.bio} onChange={updateField} rows="4" maxLength="5000" required />
          </label>
          <ImageDropzone label="Profile Picture" existingUrl={editingId ? resolvePhoto(members.find((m) => m.id === editingId)?.photo) : null} onChange={setImage} />
          <label className="checkbox-field wide-field">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={updateField} />
            Active (visible on the public website)
          </label>
        </div>
        {error && <div className="error">{error}</div>}
        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save changes' : 'Create member'}</button>
          {editingId && <button type="button" className="secondary-button" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <div className="admin-toolbar">
        <div className="admin-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
          <input placeholder="Search by name or role..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-loading-state">Loading team members...</div>
      ) : filteredMembers.length === 0 ? (
        <div className="admin-empty-state">No team members match your filters.</div>
      ) : (
        <div className="admin-card-grid">
          {filteredMembers.map((member) => (
            <div className="admin-item-card" key={member.id}>
              <div className="admin-item-thumb">
                {member.photo ? (
                  <img
                    src={resolvePhoto(member.photo)}
                    alt={member.full_name}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ) : (
                  <div className="image-fallback">No photo</div>
                )}
              </div>
              <div className="admin-item-body">
                <h4>{member.full_name}</h4>
                <div className="admin-item-meta">{member.role}</div>
                <span className={`status-pill ${member.is_active ? 'is-active' : 'is-inactive'}`}>{member.is_active ? 'Active' : 'Inactive'}</span>
                {member.skills && (
                  <div className="chip-row">
                    {member.skills.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 4).map((skill) => (
                      <span className="chip" key={skill}>{skill}</span>
                    ))}
                  </div>
                )}
                <div className="admin-item-actions">
                  <button type="button" className="icon-button" onClick={() => beginEdit(member)}>Edit</button>
                  <button type="button" className="icon-button" onClick={() => toggleActive(member)}>{member.is_active ? 'Deactivate' : 'Activate'}</button>
                  <button type="button" className="danger-button" onClick={() => setPendingDelete(member)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete team member?"
        message={pendingDelete ? `This will permanently remove "${pendingDelete.full_name}" and unassign them from any projects. This cannot be undone.` : ''}
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </section>
  )
}
