import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './header.css'
import logo from '../../../images/logo/logo.png'
import SafeImage from './SafeImage'
import { useTheme } from '../theme/ThemeProvider'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()

  const links = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/services', label: 'Services' },
    { to: '/projects', label: 'Projects' },
    { to: '/contact', label: 'Contact' },
  ]

  // Close on Escape and lock body scroll when menu is open
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && open) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="site-header-inner">
        <div className="site-brand">
          <NavLink to="/" className="brand-link" onClick={() => setOpen(false)}>
            <SafeImage src={logo} alt="Hikmat Tech Solutions logo" className="brand-logo" fallback="Logo unavailable" />
            <span className="brand-name">Hikmat Tech Solutions</span>
          </NavLink>
        </div>

        <button
          className={`nav-toggle ${open ? 'open' : ''}`}
          aria-expanded={open}
          aria-controls="primary-navigation"
          aria-label="Toggle navigation"
          onClick={() => setOpen((s) => !s)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setOpen((s) => !s)
            }
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>

        <nav id="primary-navigation" className={`site-nav ${open ? 'open' : ''}`}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          <label className="theme-control">
            <span className="sr-only">Theme</span>
            <select value={theme} onChange={(event) => setTheme(event.target.value)} onClick={(event) => event.stopPropagation()} aria-label="Choose theme">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </label>
          <NavLink to="/contact" className="btn primary nav-cta" onClick={() => setOpen(false)}>
            Get Started
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
