import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { login } from '../auth/api'
import logo from '../../../images/logo/logo.png'
import '../admin/admin-auth.css'

const REMEMBER_KEY = 'admin-remember-email'

export default function AdminLogin() {
  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBER_KEY) || '')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem(REMEMBER_KEY)))
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      if (remember) localStorage.setItem(REMEMBER_KEY, email)
      else localStorage.removeItem(REMEMBER_KEY)
      navigate(location.state?.from || '/admin/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="admin-auth-page">
      <form className="admin-auth-card" onSubmit={handleSubmit} noValidate>
        <img src={logo} alt="" className="admin-auth-logo" />
        <p className="admin-kicker">Admin Portal</p>
        <h1>Welcome back</h1>
        <p className="admin-intro">Sign in to manage Hikmat Tech Solutions.</p>

        <label htmlFor="admin-email">Email address</label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="admin-password">Password</label>
        <div className="password-field">
          <input
            id="admin-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.9 5.1A10.4 10.4 0 0 1 12 5c5.5 0 9.5 4 11 7-.6 1.2-1.5 2.5-2.7 3.6M6.6 6.6C4.4 8 2.8 9.9 2 12c1.5 3 5.5 7 10 7 1.2 0 2.4-.2 3.5-.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" /></svg>
            )}
          </button>
        </div>

        <label className="remember-row" htmlFor="remember-me">
          <input id="remember-me" type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
          Remember my email on this device
        </label>

        {error && <p className="admin-error" role="alert">{error}</p>}

        <button type="submit" disabled={submitting}>{submitting ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </section>
  )
}
