import { useEffect, useMemo, useState } from 'react'
import { adminRequest } from '../../auth/api'
import { useToast } from '../components/Toast'
import ConfirmModal from '../components/ConfirmModal'

const statuses = [
  { value: 'new', label: 'New' },
  { value: 'in_review', label: 'In Review' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'converted', label: 'Converted' },
  { value: 'archived', label: 'Archived' },
]

export default function InquiriesManagement() {
  const { notify } = useToast()
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeInquiry, setActiveInquiry] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function loadInquiries() {
    setLoading(true)
    try {
      const data = await adminRequest('/api/inquiries')
      setInquiries(data.inquiries)
    } catch (requestError) {
      notify(requestError.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { loadInquiries() }, 0)
    return () => window.clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function updateStatus(id, status) {
    try {
      const data = await adminRequest(`/api/inquiries/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      notify(data.message, 'success')
      setInquiries((current) => current.map((i) => (i.id === id ? { ...i, status } : i)))
      setActiveInquiry((current) => (current && current.id === id ? { ...current, status } : current))
    } catch (requestError) {
      notify(requestError.message, 'error')
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      const data = await adminRequest(`/api/inquiries/${pendingDelete.id}`, { method: 'DELETE' })
      notify(data.message, 'success')
      setPendingDelete(null)
      setActiveInquiry(null)
      await loadInquiries()
    } catch (requestError) {
      notify(requestError.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((i) => {
      const matchesSearch = !search
        || i.name.toLowerCase().includes(search.toLowerCase())
        || i.email.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || i.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [inquiries, search, statusFilter])

  return (
    <section>
      <div className="admin-page-header">
        <div>
          <p className="admin-kicker">Client Messages</p>
          <h1>Client Inquiries</h1>
          <p className="admin-intro">Track and respond to inquiries submitted from your contact form.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
          <input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="admin-loading-state">Loading inquiries...</div>
      ) : filteredInquiries.length === 0 ? (
        <div className="admin-empty-state">No inquiries match your filters.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Client</th><th>Service</th><th>Budget / Timeline</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filteredInquiries.map((inquiry) => (
                <tr key={inquiry.id}>
                  <td><strong>{inquiry.name}</strong><small>{inquiry.email}{inquiry.phone ? ` · ${inquiry.phone}` : ''}</small></td>
                  <td>{inquiry.service_name || 'Service removed'}</td>
                  <td>{inquiry.budget || '—'}{inquiry.timeline ? ` / ${inquiry.timeline}` : ''}</td>
                  <td>
                    <select className="admin-select" value={inquiry.status} onChange={(e) => updateStatus(inquiry.id, e.target.value)}>
                      {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                  <td>{new Date(inquiry.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="icon-button" onClick={() => setActiveInquiry(inquiry)}>View</button>
                      <button type="button" className="danger-button" onClick={() => setPendingDelete(inquiry)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeInquiry && (
        <div className="modal-overlay" role="presentation" onClick={() => setActiveInquiry(null)}>
          <div className="modal-card" role="dialog" aria-modal="true" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <h3>{activeInquiry.name}</h3>
            <p className="muted">{activeInquiry.email}{activeInquiry.phone ? ` · ${activeInquiry.phone}` : ''}</p>
            <p><strong>Service:</strong> {activeInquiry.service_name || 'Service removed'}</p>
            {activeInquiry.budget && <p><strong>Budget:</strong> {activeInquiry.budget}</p>}
            {activeInquiry.timeline && <p><strong>Timeline:</strong> {activeInquiry.timeline}</p>}
            <p><strong>Message:</strong></p>
            <p className="muted">{activeInquiry.message}</p>
            <p className="muted" style={{ fontSize: 12 }}>Submitted {new Date(activeInquiry.created_at).toLocaleString()}</p>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setActiveInquiry(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete inquiry?"
        message={pendingDelete ? `This will permanently delete the inquiry from "${pendingDelete.name}". This cannot be undone.` : ''}
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </section>
  )
}
