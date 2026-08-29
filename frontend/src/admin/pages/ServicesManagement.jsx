import { useEffect, useMemo, useState } from 'react'
import { adminRequest, API_URL } from '../../auth/api'
import { useToast } from '../components/Toast'
import ConfirmModal from '../components/ConfirmModal'
import ImageDropzone from '../components/ImageDropzone'

const emptyForm = {
  name: '', slug: '', category: '', summary: '', description: '', technologies: '',
  features: '', price: '', delivery_time: '', icon: '', is_active: true,
}

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function resolveImage(src) {
  if (!src) return null
  return src.startsWith('http') ? src : `${API_URL}${src}`
}

export default function ServicesManagement() {
  const { notify } = useToast()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [slugTouched, setSlugTouched] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [image, setImage] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleteWarning, setDeleteWarning] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function loadServices() {
    setLoading(true)
    try {
      const data = await adminRequest('/api/services')
      setServices(data.services)
    } catch (requestError) {
      notify(requestError.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { loadServices() }, 0)
    return () => window.clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function updateField(event) {
    const { name, value, type, checked } = event.target
    setForm((current) => {
      const next = { ...current, [name]: type === 'checkbox' ? checked : value }
      if (name === 'name' && !slugTouched) next.slug = slugify(value)
      if (name === 'slug') setSlugTouched(true)
      return next
    })
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
    setSlugTouched(false)
    setImage(null)
    setError('')
  }

  function beginEdit(service) {
    setEditingId(service.id)
    setSlugTouched(true)
    setForm({
      name: service.name,
      slug: service.slug,
      category: service.category || '',
      summary: service.summary || '',
      description: service.description || '',
      technologies: service.technologies || '',
      features: service.features || '',
      price: service.price ?? '',
      delivery_time: service.delivery_time || '',
      icon: service.icon || '',
      is_active: Boolean(service.is_active),
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
      const data = await adminRequest(editingId ? `/api/services/${editingId}` : '/api/services', {
        method: editingId ? 'PUT' : 'POST',
        body,
      })
      notify(data.message, 'success')
      resetForm()
      await loadServices()
    } catch (requestError) {
      setError(requestError.message)
      notify(requestError.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function performDelete(force = false) {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      const data = await adminRequest(`/api/services/${pendingDelete.id}${force ? '?force=1' : ''}`, { method: 'DELETE' })
      notify(data.message, 'success')
      setPendingDelete(null)
      setDeleteWarning(null)
      await loadServices()
    } catch (requestError) {
      if (requestError.status === 409 && requestError.data?.requiresConfirmation) {
        setDeleteWarning(requestError.data)
      } else {
        notify(requestError.message, 'error')
        setPendingDelete(null)
      }
    } finally {
      setDeleting(false)
    }
  }

  const categories = useMemo(() => Array.from(new Set(services.map((s) => s.category).filter(Boolean))), [services])

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [services, search, categoryFilter])

  return (
    <section>
      <div className="admin-page-header">
        <div>
          <p className="admin-kicker">Offerings</p>
          <h1>Services</h1>
          <p className="admin-intro">Manage the services shown on your public Services page.</p>
        </div>
        {editingId && <button type="button" className="secondary-button" onClick={resetForm}>+ New service</button>}
      </div>

      <form className="admin-form-card" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit service' : 'Add service'}</h2>
        <div className="admin-form-grid">
          <label>Service Name
            <input name="name" value={form.name} onChange={updateField} maxLength="150" required />
          </label>
          <label>Slug
            <input name="slug" value={form.slug} onChange={updateField} maxLength="150" required />
          </label>
          <label>Category
            <input name="category" value={form.category} onChange={updateField} maxLength="100" placeholder="e.g. Development" />
          </label>
          <label>Starting Price (USD)
            <input type="number" name="price" min="0" step="0.01" value={form.price} onChange={updateField} />
          </label>
          <label>Delivery Time
            <input name="delivery_time" value={form.delivery_time} onChange={updateField} placeholder="e.g. 4-6 weeks" maxLength="100" />
          </label>
          <label>Icon <span className="field-hint">(optional identifier)</span>
            <input name="icon" value={form.icon} onChange={updateField} maxLength="100" placeholder="e.g. code, shield, database" />
          </label>
          <label className="wide-field">Short Summary
            <textarea name="summary" value={form.summary} onChange={updateField} rows="2" maxLength="500" />
          </label>
          <label className="wide-field">Full Description
            <textarea name="description" value={form.description} onChange={updateField} rows="4" />
          </label>
          <label className="wide-field">Technologies <span className="field-hint">(comma-separated)</span>
            <input name="technologies" value={form.technologies} onChange={updateField} placeholder="React, Node.js, MySQL" />
          </label>
          <label className="wide-field">Features <span className="field-hint">(comma-separated)</span>
            <input name="features" value={form.features} onChange={updateField} placeholder="Responsive design, API integration, Testing" />
          </label>
          <ImageDropzone label="Service Image" existingUrl={editingId ? resolveImage(services.find((s) => s.id === editingId)?.image_path) : null} onChange={setImage} />
          <label className="checkbox-field wide-field">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={updateField} />
            Active (visible on the public website)
          </label>
        </div>
        {error && <div className="error">{error}</div>}
        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save changes' : 'Create service'}</button>
          {editingId && <button type="button" className="secondary-button" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <div className="admin-toolbar">
        <div className="admin-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
          <input placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {categories.length > 0 && (
          <select className="admin-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div className="admin-loading-state">Loading services...</div>
      ) : filteredServices.length === 0 ? (
        <div className="admin-empty-state">No services match your filters.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Service</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.id}>
                  <td><strong>{service.name}</strong><small>{service.slug}</small></td>
                  <td>{service.category || '—'}</td>
                  <td>{service.price ? `$${Number(service.price).toLocaleString()}` : '—'}</td>
                  <td><span className={`status-pill ${service.is_active ? 'is-active' : 'is-inactive'}`}>{service.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="icon-button" onClick={() => beginEdit(service)}>Edit</button>
                      <button type="button" className="danger-button" onClick={() => { setPendingDelete(service); setDeleteWarning(null) }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title={deleteWarning ? 'Service has linked projects' : 'Delete service?'}
        message={
          deleteWarning
            ? `${deleteWarning.message} Deleting anyway will not delete those projects, but they will keep a reference to a removed service.`
            : pendingDelete
              ? `This will permanently delete "${pendingDelete.name}". This cannot be undone.`
              : ''
        }
        confirmLabel={deleteWarning ? 'Delete anyway' : 'Delete'}
        loading={deleting}
        onCancel={() => { setPendingDelete(null); setDeleteWarning(null) }}
        onConfirm={() => performDelete(Boolean(deleteWarning))}
      />
    </section>
  )
}
