import { NavLink, Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { logout } from '../auth/api'
import { ToastProvider } from './components/Toast'
import logo from '../../../images/logo/logo.png'
import './admin-layout.css'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'grid' },
  { to: '/admin/services', label: 'Services', icon: 'layers' },
  { to: '/admin/projects', label: 'Projects', icon: 'folder' },
  { to: '/admin/team', label: 'Team Members', icon: 'users' },
  { to: '/admin/inquiries', label: 'Client Inquiries', icon: 'mail' },
  { to: '/admin/settings', label: 'Settings', icon: 'settings' },
]

const icons = {
  grid: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" fill="none" />,
  layers: <path d="m12 3 9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 17l9 5 9-5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" fill="none" />,
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" fill="none" />,
  users: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
  mail: <path d="M4 4h16v16H4zM4 6l8 7 8-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
  settings: <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />,
}

const pageTitles = {
  dashboard: 'Dashboard',
  services: 'Services',
  projects: 'Projects',
  team: 'Team Members',
  inquiries: 'Client Inquiries',
  settings: 'Settings',
}

function AdminLayoutInner() {
  const { admin, refreshAdmin } = useOutletContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setSidebarOpen(false), 0)
    return () => window.clearTimeout(timer)
  }, [location.pathname])

  async function handleLogout() {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  const segment = location.pathname.split('/')[2] || 'dashboard'
  const pageTitle = pageTitles[segment] || 'Dashboard'
  const initials = (admin.fullName || admin.email || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className={`admin-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <img src={logo} alt="Hikmat Tech Solutions" />
          <span>Hikmat Admin</span>
        </div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>{icons[item.icon]}</svg>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="admin-nav-link admin-logout" onClick={handleLogout}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
          Logout
        </button>
      </aside>

      <div className="admin-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-menu-toggle"
            aria-label="Toggle sidebar"
            onClick={() => setSidebarOpen((s) => !s)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
          <div className="admin-breadcrumb">
            <span>Admin</span>
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
            <strong>{pageTitle}</strong>
          </div>
          <div className="admin-profile">
            <div className="admin-avatar">{initials}</div>
            <div className="admin-profile-info">
              <strong>{admin.fullName || admin.email}</strong>
              <small>{admin.role === 'superadmin' ? 'Super Admin' : 'Admin'}</small>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet context={{ admin, refreshAdmin }} />
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  return (
    <ToastProvider>
      <AdminLayoutInner />
    </ToastProvider>
  )
}
