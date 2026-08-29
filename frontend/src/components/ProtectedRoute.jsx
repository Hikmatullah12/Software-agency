import { useCallback, useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getCurrentAdmin } from '../auth/api'

export default function ProtectedRoute() {
  const [admin, setAdmin] = useState(undefined)
  const location = useLocation()

  const refreshAdmin = useCallback(() => {
    getCurrentAdmin().then((currentAdmin) => setAdmin(currentAdmin))
  }, [])

  useEffect(() => {
    let active = true
    getCurrentAdmin().then((currentAdmin) => {
      if (active) setAdmin(currentAdmin)
    })
    return () => {
      active = false
    }
  }, [])

  if (admin === undefined) return <div className="auth-loading">Checking session...</div>
  if (!admin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />

  return <Outlet context={{ admin, refreshAdmin }} />
}
