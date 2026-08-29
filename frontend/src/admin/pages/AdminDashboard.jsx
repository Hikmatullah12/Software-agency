import { Link, useOutletContext } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getDashboardStats } from '../../auth/api'
import StatCard from '../components/StatCard'
import { useToast } from '../components/Toast'
import { API_URL } from '../../auth/api'

const statusLabels = {
  new: 'New',
  in_review: 'In Review',
  contacted: 'Contacted',
  proposal_sent: 'Proposal Sent',
  converted: 'Converted',
  archived: 'Archived',
}

export default function AdminDashboard() {
  const { admin } = useOutletContext()
  const { notify } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getDashboardStats()
      .then((result) => { if (active) setData(result) })
      .catch((err) => notify(err.message, 'error'))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stats = data?.stats

  return (
    <section>
      <div className="admin-page-header">
        <div>
          <p className="admin-kicker">Overview</p>
          <h1>Hello, {admin.fullName || admin.email}</h1>
          <p className="admin-intro">Here&apos;s what&apos;s happening across the agency right now.</p>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading-state">Loading dashboard...</div>
      ) : (
        <>
          <div className="stats-cards-grid">
            <StatCard
              label="Total Services"
              value={stats?.services.total ?? 0}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="m12 3 9 5-9 5-9-5 9-5ZM3 13l9 5 9-5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" /></svg>}
            />
            <StatCard
              label="Total Projects"
              value={stats?.projects.total ?? 0}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>}
            />
            <StatCard
              label="Total Team Members"
              value={stats?.team.total ?? 0}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            />
            <StatCard
              label="Active Team Members"
              value={stats?.team.active ?? 0}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="m9 12 2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            />
            <StatCard
              label="Total Client Inquiries"
              value={stats?.inquiries.total ?? 0}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 4h16v16H4zM4 6l8 7 8-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            />
            <StatCard
              label="New Inquiries"
              value={stats?.inquiries.new ?? 0}
              accent="warning"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            />
          </div>

          <div className="admin-form-card">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <Link to="/admin/services" className="secondary-button">+ New Service</Link>
              <Link to="/admin/projects" className="secondary-button">+ New Project</Link>
              <Link to="/admin/team" className="secondary-button">+ New Team Member</Link>
              <Link to="/admin/inquiries" className="secondary-button">View Inquiries</Link>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-panel">
              <h3>Recent Inquiries</h3>
              {data?.recentInquiries?.length ? (
                <ul className="panel-list">
                  {data.recentInquiries.map((inquiry) => (
                    <li key={inquiry.id}>
                      <div>
                        <span className="panel-list-title">{inquiry.name}</span>
                        <span className="panel-list-sub">{inquiry.service_name || 'Service removed'} &middot; {new Date(inquiry.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="chip">{statusLabels[inquiry.status] || inquiry.status}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="empty-panel">No inquiries yet.</p>}
            </div>

            <div className="dashboard-panel">
              <h3>Recent Projects</h3>
              {data?.recentProjects?.length ? (
                <ul className="panel-list">
                  {data.recentProjects.map((project) => (
                    <li key={project.id}>
                      <div>
                        <span className="panel-list-title">{project.title}</span>
                        <span className="panel-list-sub">{project.service_name} &middot; {new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="chip">{project.status}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="empty-panel">No projects yet.</p>}
            </div>

            <div className="dashboard-panel">
              <h3>Recent Team Members</h3>
              {data?.recentTeamMembers?.length ? (
                <ul className="panel-list">
                  {data.recentTeamMembers.map((member) => (
                    <li key={member.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {member.photo ? (
                          <img src={member.photo.startsWith('http') ? member.photo : `${API_URL}${member.photo}`} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--a-surface-2)' }} />
                        )}
                        <div>
                          <span className="panel-list-title">{member.full_name}</span>
                          <span className="panel-list-sub">{member.role}</span>
                        </div>
                      </div>
                      <span className={`status-pill ${member.is_active ? 'is-active' : 'is-inactive'}`}>{member.is_active ? 'Active' : 'Inactive'}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="empty-panel">No team members yet.</p>}
            </div>
          </div>
        </>
      )}
    </section>
  )
}
