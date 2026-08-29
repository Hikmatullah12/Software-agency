import bcrypt from 'bcrypt'
import express from 'express'
import { pool } from '../config/db.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.use(requireAuth)

router.get('/dashboard', (request, response) => {
  response.json({
    message: 'Protected dashboard access granted',
    admin: request.admin,
  })
})

router.get('/stats', async (request, response) => {
  try {
    const [[serviceCounts]] = await pool.query(
      'SELECT COUNT(*) AS total, SUM(is_active = 1) AS active FROM services',
    )
    const [[projectCounts]] = await pool.query('SELECT COUNT(*) AS total FROM projects')
    const [[teamCounts]] = await pool.query(
      'SELECT COUNT(*) AS total, SUM(is_active = 1) AS active FROM team_members',
    )
    const [[inquiryCounts]] = await pool.query(
      "SELECT COUNT(*) AS total, SUM(status = 'new') AS new_count FROM inquiries",
    )
    const [recentInquiries] = await pool.query(
      `SELECT i.id, i.name, i.email, i.status, i.created_at, s.name AS service_name
       FROM inquiries i LEFT JOIN services s ON s.id = i.service_id
       ORDER BY i.created_at DESC LIMIT 5`,
    )
    const [recentProjects] = await pool.query(
      `SELECT p.id, p.title, p.status, p.created_at, s.name AS service_name
       FROM projects p INNER JOIN services s ON s.id = p.service_id
       ORDER BY p.created_at DESC LIMIT 5`,
    )
    const [recentTeamMembers] = await pool.query(
      'SELECT id, full_name, role, photo, is_active, created_at FROM team_members ORDER BY created_at DESC LIMIT 5',
    )

    response.json({
      stats: {
        services: { total: serviceCounts.total || 0, active: Number(serviceCounts.active) || 0 },
        projects: { total: projectCounts.total || 0 },
        team: { total: teamCounts.total || 0, active: Number(teamCounts.active) || 0 },
        inquiries: { total: inquiryCounts.total || 0, new: Number(inquiryCounts.new_count) || 0 },
      },
      recentInquiries,
      recentProjects,
      recentTeamMembers,
    })
  } catch {
    response.status(500).json({ message: 'Unable to load dashboard statistics' })
  }
})

router.put('/password', async (request, response) => {
  const currentPassword = request.body?.currentPassword
  const newPassword = request.body?.newPassword

  if (!currentPassword || !newPassword) {
    return response.status(400).json({ message: 'Current and new password are required' })
  }
  if (newPassword.length < 8) {
    return response.status(400).json({ message: 'New password must be at least 8 characters long' })
  }

  try {
    const [rows] = await pool.query('SELECT id, password_hash FROM admins WHERE id = ?', [request.admin.id])
    const admin = rows[0]
    if (!admin) return response.status(404).json({ message: 'Admin account not found' })

    const matches = await bcrypt.compare(currentPassword, admin.password_hash)
    if (!matches) return response.status(401).json({ message: 'Current password is incorrect' })

    const nextHash = await bcrypt.hash(newPassword, 12)
    await pool.query('UPDATE admins SET password_hash = ? WHERE id = ?', [nextHash, admin.id])
    response.json({ message: 'Password updated successfully' })
  } catch {
    response.status(500).json({ message: 'Unable to update password' })
  }
})

router.put('/profile', async (request, response) => {
  const fullName = request.body?.fullName?.trim()
  if (!fullName || fullName.length > 255) {
    return response.status(400).json({ message: 'Full name is required and must be 255 characters or fewer' })
  }
  try {
    await pool.query('UPDATE admins SET full_name = ? WHERE id = ?', [fullName, request.admin.id])
    response.json({ message: 'Profile updated successfully', fullName })
  } catch {
    response.status(500).json({ message: 'Unable to update profile' })
  }
})

export default router
