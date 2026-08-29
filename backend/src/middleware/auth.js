import jwt from 'jsonwebtoken'

function getCookie(request, name) {
  const cookies = request.headers.cookie?.split(';') || []
  const cookie = cookies.find((item) => item.trim().startsWith(`${name}=`))
  if (!cookie) return null
  try {
    return decodeURIComponent(cookie.trim().slice(name.length + 1))
  } catch {
    return null
  }
}

export function requireAuth(request, response, next) {
  const token = getCookie(request, 'admin_token') || request.headers.authorization?.replace('Bearer ', '')

  const jwtSecret = process.env.JWT_SECRET
  if (!token || !jwtSecret || jwtSecret.length < 32) {
    return response.status(401).json({ message: 'Authentication required' })
  }

  try {
    request.admin = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] })
    next()
  } catch {
    return response.status(401).json({ message: 'Invalid or expired session' })
  }
}
