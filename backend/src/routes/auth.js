import bcrypt from 'bcrypt'
import express from 'express'
import jwt from 'jsonwebtoken'
import { pool } from '../config/db.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 8

function setAuthCookie(response, token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  response.setHeader(
    'Set-Cookie',
    `admin_token=${encodeURIComponent(token)}; Max-Age=${COOKIE_MAX_AGE / 1000}; Path=/; HttpOnly; SameSite=Lax${secure}`,
  )
}

router.post('/login', async (request, response) => {
  const email = request.body?.email?.trim().toLowerCase()
  const password = request.body?.password
  const jwtSecret = process.env.JWT_SECRET

  if (!email || !password) {
    return response.status(400).json({ message: 'Email and password are required' })
  }

  if (!jwtSecret || jwtSecret.length < 32) {
    return response.status(500).json({ message: 'Authentication is not configured' })
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, email, full_name, role, password_hash FROM admins WHERE email = ? AND is_active = 1 LIMIT 1',
      [email],
    )
    const admin = rows[0]
    const passwordMatches = admin ? await bcrypt.compare(password, admin.password_hash) : false

    if (!admin || !passwordMatches) {
      return response.status(401).json({ message: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, fullName: admin.full_name, role: admin.role },
      jwtSecret,
      { expiresIn: '8h', algorithm: 'HS256' },
    )

    await pool.query('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [admin.id])
    setAuthCookie(response, token)

    return response.json({
      message: 'Login successful',
      admin: { id: admin.id, email: admin.email, fullName: admin.full_name, role: admin.role },
    })
  } catch {
    return response.status(500).json({ message: 'Unable to process login' })
  }
})

router.post('/logout', (request, response) => {
  response.setHeader('Set-Cookie', 'admin_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax')
  response.json({ message: 'Logout successful' })
})

router.get('/me', requireAuth, (request, response) => {
  response.json({ admin: request.admin })
})

export default router
