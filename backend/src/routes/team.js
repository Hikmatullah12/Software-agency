import fs from 'node:fs/promises'
import path from 'node:path'
import express from 'express'
import multer from 'multer'
import { pool } from '../config/db.js'
import { requireAuth } from '../middleware/auth.js'
import { teamImageUpload, teamUploadDirectory, validateUploadedImage } from '../middleware/upload.js'

const router = express.Router()

const SELECT_COLUMNS =
  'id, full_name, role, bio, email, photo, skills, linkedin, github, is_active, created_at, updated_at'

function parseTeamMemberInput(body) {
  const name = body.name?.trim() || body.full_name?.trim()
  const role = body.role?.trim()
  const bio = body.bio?.trim()
  const email = body.email?.trim() || null
  const skills = body.skills?.trim() || null
  const linkedin = body.linkedin?.trim() || null
  const github = body.github?.trim() || null
  const isActive = body.is_active === undefined ? 1 : Number(body.is_active)

  if (!name || name.length > 255) return { error: 'Name is required and must be 255 characters or fewer' }
  if (!role || role.length > 150) return { error: 'Role is required and must be 150 characters or fewer' }
  if (!bio) return { error: 'Short biography is required' }
  if (bio.length > 5000) return { error: 'Biography must be 5000 characters or fewer' }
  if (email && (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return { error: 'Enter a valid email address' }
  const urlPattern = /^https?:\/\/.+/i
  if (linkedin && !urlPattern.test(linkedin)) return { error: 'LinkedIn URL must start with http:// or https://' }
  if (github && !urlPattern.test(github)) return { error: 'GitHub URL must start with http:// or https://' }
  if (![0, 1].includes(isActive)) return { error: 'is_active must be 0 or 1' }

  return { values: [name, role, bio, email, skills, linkedin, github, isActive] }
}

async function removeUploadedFile(file) {
  if (file?.filename) await fs.unlink(path.join(teamUploadDirectory, file.filename)).catch(() => {})
}

router.get('/', async (request, response) => {
  try {
    const activeOnly = request.query.active === '1'
    const query = activeOnly
      ? `SELECT ${SELECT_COLUMNS} FROM team_members WHERE is_active = 1 ORDER BY created_at DESC`
      : `SELECT ${SELECT_COLUMNS} FROM team_members ORDER BY created_at DESC`
    const [rows] = await pool.query(query)
    response.json({ teamMembers: rows })
  } catch {
    response.status(500).json({ message: 'Unable to load team members' })
  }
})

router.get('/:id', async (request, response) => {
  try {
    const [rows] = await pool.query(`SELECT ${SELECT_COLUMNS} FROM team_members WHERE id = ?`, [request.params.id])
    if (!rows[0]) return response.status(404).json({ message: 'Team member not found' })
    response.json({ teamMember: rows[0] })
  } catch {
    response.status(500).json({ message: 'Unable to load team member' })
  }
})

router.use(requireAuth)

router.post('/', teamImageUpload.single('image'), validateUploadedImage, async (request, response) => {
  const parsed = parseTeamMemberInput(request.body)
  if (parsed.error) {
    await removeUploadedFile(request.file)
    return response.status(400).json({ message: parsed.error })
  }

  try {
    const photo = request.file ? `/uploads/team/${request.file.filename}` : null
    const [result] = await pool.query(
      'INSERT INTO team_members (full_name, role, bio, email, skills, linkedin, github, is_active, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [...parsed.values, photo],
    )
    const [rows] = await pool.query(`SELECT ${SELECT_COLUMNS} FROM team_members WHERE id = ?`, [result.insertId])
    response.status(201).json({ message: 'Team member created successfully', teamMember: rows[0] })
  } catch (error) {
    await removeUploadedFile(request.file)
    if (error.code === 'ER_DUP_ENTRY') return response.status(409).json({ message: 'A team member with this email already exists' })
    response.status(500).json({ message: 'Unable to create team member' })
  }
})

router.put('/:id', teamImageUpload.single('image'), validateUploadedImage, async (request, response) => {
  const parsed = parseTeamMemberInput(request.body)
  if (parsed.error) {
    await removeUploadedFile(request.file)
    return response.status(400).json({ message: parsed.error })
  }

  try {
    const [existingRows] = await pool.query('SELECT photo FROM team_members WHERE id = ?', [request.params.id])
    if (!existingRows[0]) {
      await removeUploadedFile(request.file)
      return response.status(404).json({ message: 'Team member not found' })
    }

    const photo = request.file ? `/uploads/team/${request.file.filename}` : existingRows[0].photo
    await pool.query(
      'UPDATE team_members SET full_name = ?, role = ?, bio = ?, email = ?, skills = ?, linkedin = ?, github = ?, is_active = ?, photo = ? WHERE id = ?',
      [...parsed.values, photo, request.params.id],
    )
    if (request.file && existingRows[0].photo) {
      await fs.unlink(path.join(teamUploadDirectory, path.basename(existingRows[0].photo))).catch(() => {})
    }
    const [rows] = await pool.query(`SELECT ${SELECT_COLUMNS} FROM team_members WHERE id = ?`, [request.params.id])
    response.json({ message: 'Team member updated successfully', teamMember: rows[0] })
  } catch (error) {
    await removeUploadedFile(request.file)
    if (error.code === 'ER_DUP_ENTRY') return response.status(409).json({ message: 'A team member with this email already exists' })
    response.status(500).json({ message: 'Unable to update team member' })
  }
})

router.patch('/:id/status', async (request, response) => {
  const isActive = Number(request.body?.is_active)
  if (![0, 1].includes(isActive)) return response.status(400).json({ message: 'is_active must be 0 or 1' })
  try {
    const [result] = await pool.query('UPDATE team_members SET is_active = ? WHERE id = ?', [isActive, request.params.id])
    if (!result.affectedRows) return response.status(404).json({ message: 'Team member not found' })
    response.json({ message: isActive ? 'Team member activated' : 'Team member deactivated' })
  } catch {
    response.status(500).json({ message: 'Unable to update team member status' })
  }
})

router.delete('/:id', async (request, response) => {
  try {
    const [rows] = await pool.query('SELECT photo FROM team_members WHERE id = ?', [request.params.id])
    if (!rows[0]) return response.status(404).json({ message: 'Team member not found' })
    // project_team_assignments rows are removed automatically via ON DELETE CASCADE
    await pool.query('DELETE FROM team_members WHERE id = ?', [request.params.id])
    if (rows[0].photo) await fs.unlink(path.join(teamUploadDirectory, path.basename(rows[0].photo))).catch(() => {})
    response.json({ message: 'Team member deleted successfully' })
  } catch {
    response.status(500).json({ message: 'Unable to delete team member' })
  }
})

router.use((error, request, response, next) => {
  if (error instanceof multer.MulterError || error.message?.includes('images')) {
    return response.status(400).json({ message: error.message })
  }
  next(error)
})

export default router
