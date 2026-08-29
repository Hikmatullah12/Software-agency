import fs from 'node:fs/promises'
import path from 'node:path'
import express from 'express'
import multer from 'multer'
import { pool } from '../config/db.js'
import { requireAuth } from '../middleware/auth.js'
import { projectImageUpload, projectUploadDirectory, validateUploadedImage } from '../middleware/upload.js'

const router = express.Router()
const allowedStatuses = new Set(['planned', 'active', 'completed', 'archived'])

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 240) || 'project'
}

function parseTeamMemberIds(raw) {
  if (!raw) return []
  const list = Array.isArray(raw) ? raw : String(raw).split(',')
  return [...new Set(list.map((v) => Number(v)).filter((n) => Number.isInteger(n) && n > 0))]
}

function parseProjectInput(body) {
  const title = body.title?.trim()
  const category = body.category?.trim() || null
  const client = body.client?.trim() || null
  const shortDescription = body.short_description?.trim() || null
  const description = body.description?.trim()
  const technologies = body.technologies?.trim()
  const challenge = body.challenge?.trim() || null
  const solution = body.solution?.trim() || null
  const impactMetrics = body.impact_metrics?.trim() || null
  const liveDemoUrl = body.live_demo_url?.trim() || null
  const githubUrl = body.github_url?.trim() || null
  const startDate = body.start_date?.trim() || null
  const endDate = body.end_date?.trim() || null
  const status = body.status?.trim() || 'active'
  const serviceId = Number(body.service_id)
  const teamMemberIds = parseTeamMemberIds(body.team_member_ids)

  if (!title || title.length > 255) return { error: 'Title is required and must be 255 characters or fewer' }
  if (!description) return { error: 'Description is required' }
  if (!technologies) return { error: 'Technologies are required' }
  if (!Number.isInteger(serviceId) || serviceId < 1) return { error: 'A valid service is required' }
  if (!allowedStatuses.has(status)) return { error: 'Invalid project status' }
  if (shortDescription && shortDescription.length > 500) return { error: 'Short description must be 500 characters or fewer' }
  const urlPattern = /^https?:\/\/.+/i
  if (liveDemoUrl && !urlPattern.test(liveDemoUrl)) return { error: 'Live demo URL must start with http:// or https://' }
  if (githubUrl && !urlPattern.test(githubUrl)) return { error: 'GitHub URL must start with http:// or https://' }

  return {
    title, category, client, shortDescription, description, technologies, challenge, solution,
    impactMetrics, liveDemoUrl, githubUrl, startDate, endDate, status, serviceId, teamMemberIds,
  }
}

async function removeUploadedFile(file) {
  if (file?.filename) await fs.unlink(path.join(projectUploadDirectory, file.filename)).catch(() => {})
}

async function attachTeamAssignments(projects) {
  if (projects.length === 0) return projects
  const ids = projects.map((p) => p.id)
  const [rows] = await pool.query(
    `SELECT pta.project_id, tm.id, tm.full_name, tm.role, tm.photo
     FROM project_team_assignments pta
     INNER JOIN team_members tm ON tm.id = pta.team_member_id
     WHERE pta.project_id IN (?)`,
    [ids],
  )
  const byProject = new Map()
  for (const row of rows) {
    const list = byProject.get(row.project_id) || []
    list.push({ id: row.id, full_name: row.full_name, role: row.role, photo: row.photo })
    byProject.set(row.project_id, list)
  }
  return projects.map((p) => ({ ...p, team_members: byProject.get(p.id) || [] }))
}

async function syncTeamAssignments(projectId, teamMemberIds) {
  await pool.query('DELETE FROM project_team_assignments WHERE project_id = ?', [projectId])
  if (teamMemberIds.length === 0) return
  const values = teamMemberIds.map((memberId) => [projectId, memberId])
  await pool.query('INSERT IGNORE INTO project_team_assignments (project_id, team_member_id) VALUES ?', [values])
}

const SELECT_COLUMNS = `p.id, p.title, p.slug, p.category, p.description, p.short_description, p.technologies,
       p.challenge, p.solution, p.impact_metrics, p.live_demo_url, p.github_url, p.client,
       p.start_date, p.end_date, p.status, p.cover_image, p.created_at, p.updated_at,
       p.service_id, s.name AS service_name`

router.get('/', async (request, response) => {
  try {
    const [rows] = await pool.query(
      `SELECT ${SELECT_COLUMNS} FROM projects p INNER JOIN services s ON s.id = p.service_id ORDER BY p.created_at DESC`,
    )
    response.json({ projects: await attachTeamAssignments(rows) })
  } catch {
    response.status(500).json({ message: 'Unable to load projects' })
  }
})

router.get('/:id', async (request, response) => {
  try {
    const [rows] = await pool.query(
      `SELECT ${SELECT_COLUMNS} FROM projects p INNER JOIN services s ON s.id = p.service_id WHERE p.id = ?`,
      [request.params.id],
    )
    if (!rows[0]) return response.status(404).json({ message: 'Project not found' })
    const [withTeam] = await attachTeamAssignments(rows)
    response.json({ project: withTeam })
  } catch {
    response.status(500).json({ message: 'Unable to load project' })
  }
})

router.use(requireAuth)

router.post('/', projectImageUpload.single('image'), validateUploadedImage, async (request, response) => {
  const parsed = parseProjectInput(request.body)
  if (parsed.error) {
    await removeUploadedFile(request.file)
    return response.status(400).json({ message: parsed.error })
  }

  try {
    const [serviceRows] = await pool.query('SELECT id FROM services WHERE id = ?', [parsed.serviceId])
    if (!serviceRows[0]) {
      await removeUploadedFile(request.file)
      return response.status(400).json({ message: 'Selected service does not exist' })
    }

    const imagePath = request.file ? `/uploads/projects/${request.file.filename}` : null
    const [result] = await pool.query(
      `INSERT INTO projects (service_id, title, slug, category, technologies, short_description, description,
              challenge, solution, impact_metrics, client, start_date, end_date, status, cover_image, live_demo_url, github_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parsed.serviceId, parsed.title, slugify(parsed.title), parsed.category, parsed.technologies,
        parsed.shortDescription, parsed.description, parsed.challenge, parsed.solution, parsed.impactMetrics,
        parsed.client, parsed.startDate, parsed.endDate, parsed.status, imagePath, parsed.liveDemoUrl, parsed.githubUrl,
      ],
    )
    await syncTeamAssignments(result.insertId, parsed.teamMemberIds)
    const [rows] = await pool.query(
      `SELECT ${SELECT_COLUMNS} FROM projects p INNER JOIN services s ON s.id = p.service_id WHERE p.id = ?`,
      [result.insertId],
    )
    const [withTeam] = await attachTeamAssignments(rows)
    response.status(201).json({ message: 'Project created successfully', project: withTeam })
  } catch (error) {
    await removeUploadedFile(request.file)
    if (error.code === 'ER_DUP_ENTRY') return response.status(409).json({ message: 'A project with this title already exists' })
    response.status(500).json({ message: 'Unable to create project' })
  }
})

router.put('/:id', projectImageUpload.single('image'), validateUploadedImage, async (request, response) => {
  const parsed = parseProjectInput(request.body)
  if (parsed.error) {
    await removeUploadedFile(request.file)
    return response.status(400).json({ message: parsed.error })
  }

  try {
    const [existingRows] = await pool.query('SELECT cover_image FROM projects WHERE id = ?', [request.params.id])
    if (!existingRows[0]) {
      await removeUploadedFile(request.file)
      return response.status(404).json({ message: 'Project not found' })
    }
    const [serviceRows] = await pool.query('SELECT id FROM services WHERE id = ?', [parsed.serviceId])
    if (!serviceRows[0]) {
      await removeUploadedFile(request.file)
      return response.status(400).json({ message: 'Selected service does not exist' })
    }

    const imagePath = request.file ? `/uploads/projects/${request.file.filename}` : existingRows[0].cover_image
    await pool.query(
      `UPDATE projects SET service_id = ?, title = ?, slug = ?, category = ?, technologies = ?, short_description = ?,
              description = ?, challenge = ?, solution = ?, impact_metrics = ?, client = ?, start_date = ?, end_date = ?,
              status = ?, cover_image = ?, live_demo_url = ?, github_url = ? WHERE id = ?`,
      [
        parsed.serviceId, parsed.title, slugify(parsed.title), parsed.category, parsed.technologies,
        parsed.shortDescription, parsed.description, parsed.challenge, parsed.solution, parsed.impactMetrics,
        parsed.client, parsed.startDate, parsed.endDate, parsed.status, imagePath, parsed.liveDemoUrl, parsed.githubUrl,
        request.params.id,
      ],
    )
    await syncTeamAssignments(request.params.id, parsed.teamMemberIds)
    if (request.file && existingRows[0].cover_image) {
      await fs.unlink(path.join(projectUploadDirectory, path.basename(existingRows[0].cover_image))).catch(() => {})
    }
    const [rows] = await pool.query(
      `SELECT ${SELECT_COLUMNS} FROM projects p INNER JOIN services s ON s.id = p.service_id WHERE p.id = ?`,
      [request.params.id],
    )
    const [withTeam] = await attachTeamAssignments(rows)
    response.json({ message: 'Project updated successfully', project: withTeam })
  } catch (error) {
    await removeUploadedFile(request.file)
    if (error.code === 'ER_DUP_ENTRY') return response.status(409).json({ message: 'A project with this title already exists' })
    response.status(500).json({ message: 'Unable to update project' })
  }
})

router.delete('/:id', async (request, response) => {
  try {
    const [rows] = await pool.query('SELECT cover_image FROM projects WHERE id = ?', [request.params.id])
    if (!rows[0]) return response.status(404).json({ message: 'Project not found' })
    await pool.query('DELETE FROM projects WHERE id = ?', [request.params.id])
    if (rows[0].cover_image) await fs.unlink(path.join(projectUploadDirectory, path.basename(rows[0].cover_image))).catch(() => {})
    response.json({ message: 'Project deleted successfully' })
  } catch {
    response.status(500).json({ message: 'Unable to delete project' })
  }
})

router.use((error, request, response, next) => {
  if (error instanceof multer.MulterError || error.message?.includes('images')) {
    return response.status(400).json({ message: error.message })
  }
  next(error)
})

export default router
