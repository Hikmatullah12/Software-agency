import express from 'express'
import { pool } from '../config/db.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()
const allowedStatuses = new Set(['new', 'in_review', 'contacted', 'proposal_sent', 'converted', 'archived'])

function parseInquiryInput(body) {
  const name = body.name?.trim()
  const email = body.email?.trim().toLowerCase()
  const phone = body.phone?.trim() || null
  const message = body.message?.trim()
  const budget = body.budget?.trim() || null
  const timeline = body.timeline?.trim() || null
  const serviceId = Number(body.service_id)

  if (!name || name.length > 255) return { error: 'Full name is required and must be 255 characters or fewer' }
  if (!email || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'A valid email is required' }
  if (phone && (phone.length > 50 || !/^\+?[0-9\s\-()]{7,}$/.test(phone))) return { error: 'Enter a valid phone number' }
  if (!Number.isInteger(serviceId) || serviceId < 1) return { error: 'A valid service is required' }
  if (!message || message.length > 5000) return { error: 'Message is required and must be 5000 characters or fewer' }
  if (budget && budget.length > 100) return { error: 'Budget must be 100 characters or fewer' }
  if (timeline && timeline.length > 100) return { error: 'Timeline must be 100 characters or fewer' }

  return { values: [name, email, phone, serviceId, message, budget, timeline] }
}

router.post('/', async (request, response) => {
  const parsed = parseInquiryInput(request.body)
  if (parsed.error) return response.status(400).json({ message: parsed.error })

  try {
    const [serviceRows] = await pool.query('SELECT id FROM services WHERE id = ? AND is_active = 1', [parsed.values[3]])
    if (!serviceRows[0]) return response.status(400).json({ message: 'Selected service does not exist or is inactive' })

    const [result] = await pool.query(
      `INSERT INTO inquiries (name, email, phone, service_id, message, budget, timeline, status, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [...parsed.values, 'new', 'Website Contact Form'],
    )
    response.status(201).json({ message: 'Your inquiry was submitted successfully', inquiryId: result.insertId })
  } catch {
    response.status(500).json({ message: 'Unable to submit inquiry' })
  }
})

router.use(requireAuth)

router.get('/', async (request, response) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.id, i.name, i.email, i.phone, i.service_id, i.message, i.budget, i.timeline, i.status,
              i.source, i.created_at, i.updated_at, s.name AS service_name
       FROM inquiries i LEFT JOIN services s ON s.id = i.service_id
       ORDER BY i.created_at DESC`,
    )
    response.json({ inquiries: rows })
  } catch {
    response.status(500).json({ message: 'Unable to load inquiries' })
  }
})

router.patch('/:id/status', async (request, response) => {
  const status = request.body?.status
  if (!allowedStatuses.has(status)) return response.status(400).json({ message: 'Invalid inquiry status' })

  try {
    const [result] = await pool.query('UPDATE inquiries SET status = ? WHERE id = ?', [status, request.params.id])
    if (!result.affectedRows) return response.status(404).json({ message: 'Inquiry not found' })
    response.json({ message: 'Inquiry status updated successfully', status })
  } catch {
    response.status(500).json({ message: 'Unable to update inquiry status' })
  }
})

router.delete('/:id', async (request, response) => {
  try {
    const [result] = await pool.query('DELETE FROM inquiries WHERE id = ?', [request.params.id])
    if (!result.affectedRows) return response.status(404).json({ message: 'Inquiry not found' })
    response.json({ message: 'Inquiry deleted successfully' })
  } catch {
    response.status(500).json({ message: 'Unable to delete inquiry' })
  }
})

export default router
