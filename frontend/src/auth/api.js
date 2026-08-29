const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function parseJson(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Request failed')
  return data
}

export async function login(email, password) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })
  return parseJson(response)
}

export async function logout() {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}

export async function getCurrentAdmin() {
  const response = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' })
  if (!response.ok) return null
  const data = await response.json()
  return data.admin
}

export async function getDashboardStats() {
  const response = await fetch(`${API_URL}/api/admin/stats`, { credentials: 'include' })
  return parseJson(response)
}

export async function changePassword(currentPassword, newPassword) {
  const response = await fetch(`${API_URL}/api/admin/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  return parseJson(response)
}

export async function updateProfile(fullName) {
  const response = await fetch(`${API_URL}/api/admin/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ fullName }),
  })
  return parseJson(response)
}

// Generic authenticated JSON/FormData request helper for admin CRUD pages.
export async function adminRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, { ...options, credentials: 'include' })
  const data = await response.json().catch(() => ({}))
  if (response.status === 401) {
    const error = new Error(data.message || 'Session expired')
    error.unauthorized = true
    throw error
  }
  if (!response.ok) {
    const error = new Error(data.message || 'Request failed')
    error.data = data
    error.status = response.status
    throw error
  }
  return data
}

export { API_URL }
