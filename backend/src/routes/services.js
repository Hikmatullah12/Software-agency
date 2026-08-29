import fs from 'node:fs/promises'
import path from 'node:path'
import express from 'express'
import multer from 'multer'
import { pool } from '../config/db.js'
import { requireAuth } from '../middleware/auth.js'
import { serviceImageUpload, uploadDirectory, validateUploadedImage } from '../middleware/upload.js'

const router = express.Router()

const SELECT_COLUMNS =
  'id, name, slug, category, summary, description, technologies, features, price, delivery_time, image_path, icon, is_active, created_at, updated_at'

function parseServiceInput(body) {
  const name = body.name?.trim()
  const slug = body.slug?.trim().toLowerCase()
  const category = body.category?.trim() || null
  const summary = body.summary?.trim() || null
  const description = body.description?.trim() || null
  const technologies = body.technologies?.trim() || null
  const features = body.features?.trim() || null
  const deliveryTime = body.delivery_time?.trim() || null
  const icon = body.icon?.trim() || null
  const price = body.price === '' || body.price === undefined ? null : Number(body.price)
  const isActive = body.is_active === undefined ? 1 : Number(body.is_active)

  if (!name || name.length > 150) return { error: 'Name is required and must be 150 characters or fewer' }
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 150) {
    return { error: 'Slug is required and may contain lowercase letters, numbers, and hyphens only' }
  }
  if (category && category.length > 100) return { error: 'Category must be 100 characters or fewer' }
  if (summary && summary.length > 500) return { error: 'Summary must be 500 characters or fewer' }
  if (deliveryTime && deliveryTime.length > 100) return { error: 'Delivery time must be 100 characters or fewer' }
  if (icon && icon.length > 100) return { error: 'Icon must be 100 characters or fewer' }
  if (price !== null && (!Number.isFinite(price) || price < 0)) return { error: 'Price must be a non-negative number' }
  if (![0, 1].includes(isActive)) return { error: 'is_active must be 0 or 1' }

  return {
    values: [name, slug, category, summary, description, technologies, features, price, deliveryTime, icon, isActive],
  }
}

async function removeUploadedFile(file) {
  if (file?.filename) await fs.unlink(path.join(uploadDirectory, file.filename)).catch(() => {})
}

router.get('/', async (request, response) => {
  try {
    const [rows] = await pool.query(`SELECT ${SELECT_COLUMNS} FROM services ORDER BY created_at DESC`)
    response.json({ services: rows })
  } catch {
    response.status(500).json({ message: 'Unable to load services' })
  }
})

router.get('/:id', async (request, response) => {
  try {
    const [rows] = await pool.query(`SELECT ${SELECT_COLUMNS} FROM services WHERE id = ?`, [request.params.id])
    if (!rows[0]) return response.status(404).json({ message: 'Service not found' })
    response.json({ service: rows[0] })
  } catch {
    response.status(500).json({ message: 'Unable to load service' })
  }
})

router.use(requireAuth)

router.post('/', serviceImageUpload.single('image'), validateUploadedImage, async (request, response) => {
  const parsed = parseServiceInput(request.body)
  if (parsed.error) {
    await removeUploadedFile(request.file)
    return response.status(400).json({ message: parsed.error })
  }

  try {
    const imagePath = request.file ? `/uploads/services/${request.file.filename}` : null
    const [result] = await pool.query(
      `INSERT INTO services (name, slug, category, summary, description, technologies, features, price, delivery_time, icon, is_active, image_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [...parsed.values, imagePath],
    )
    const [rows] = await pool.query(`SELECT ${SELECT_COLUMNS} FROM services WHERE id = ?`, [result.insertId])
    response.status(201).json({ message: 'Service created successfully', service: rows[0] })
  } catch (error) {
    await removeUploadedFile(request.file)
    if (error.code === 'ER_DUP_ENTRY') return response.status(409).json({ message: 'A service with this name or slug already exists' })
    response.status(500).json({ message: 'Unable to create service' })
  }
})

router.put('/:id', serviceImageUpload.single('image'), validateUploadedImage, async (request, response) => {
  const parsed = parseServiceInput(request.body)
  if (parsed.error) {
    await removeUploadedFile(request.file)
    return response.status(400).json({ message: parsed.error })
  }

  try {
    const [existingRows] = await pool.query('SELECT image_path FROM services WHERE id = ?', [request.params.id])
    if (!existingRows[0]) {
      await removeUploadedFile(request.file)
      return response.status(404).json({ message: 'Service not found' })
    }

    const imagePath = request.file ? `/uploads/services/${request.file.filename}` : existingRows[0].image_path
    await pool.query(
      `UPDATE services SET name = ?, slug = ?, category = ?, summary = ?, description = ?, technologies = ?, features = ?,
              price = ?, delivery_time = ?, icon = ?, is_active = ?, image_path = ? WHERE id = ?`,
      [...parsed.values, imagePath, request.params.id],
    )
    if (request.file && existingRows[0].image_path) {
      await fs.unlink(path.join(uploadDirectory, path.basename(existingRows[0].image_path))).catch(() => {})
    }
    const [rows] = await pool.query(`SELECT ${SELECT_COLUMNS} FROM services WHERE id = ?`, [request.params.id])
    response.json({ message: 'Service updated successfully', service: rows[0] })
  } catch (error) {
    await removeUploadedFile(request.file)
    if (error.code === 'ER_DUP_ENTRY') return response.status(409).json({ message: 'A service with this name or slug already exists' })
    response.status(500).json({ message: 'Unable to update service' })
  }
})

router.delete('/:id', async (request, response) => {
  try {
    const [rows] = await pool.query('SELECT image_path FROM services WHERE id = ?', [request.params.id])
    if (!rows[0]) return response.status(404).json({ message: 'Service not found' })

    const [linkedProjects] = await pool.query(
      'SELECT id, title FROM projects WHERE service_id = ? LIMIT 5',
      [request.params.id],
    )
    if (linkedProjects.length > 0 && request.query.force !== '1') {
      return response.status(409).json({
        message: `This service is linked to ${linkedProjects.length === 5 ? '5+' : linkedProjects.length} project(s) (e.g. "${linkedProjects[0].title}"). Reassign or delete those projects first, or confirm to delete anyway.`,
        linkedProjects,
        requiresConfirmation: true,
      })
    }

    await pool.query('DELETE FROM services WHERE id = ?', [request.params.id])
    if (rows[0].image_path) await fs.unlink(path.join(uploadDirectory, path.basename(rows[0].image_path))).catch(() => {})
    response.json({ message: 'Service deleted successfully' })
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
      return response.status(409).json({ message: 'This service is still referenced by other records and cannot be deleted.' })
    }
    response.status(500).json({ message: 'Unable to delete service' })
  }
})

router.use((error, request, response, next) => {
  if (error instanceof multer.MulterError || error.message?.includes('images')) {
    return response.status(400).json({ message: error.message })
  }
  next(error)
})

export default router
