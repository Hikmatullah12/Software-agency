import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const uploadsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads')
const uploadDirectory = path.join(uploadsRoot, 'services')
const projectUploadDirectory = path.join(uploadsRoot, 'projects')
const teamUploadDirectory = path.join(uploadsRoot, 'team')
fs.mkdirSync(uploadDirectory, { recursive: true })
fs.mkdirSync(projectUploadDirectory, { recursive: true })
fs.mkdirSync(teamUploadDirectory, { recursive: true })

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

function createImageUpload(destination) {
  return multer({
    storage: multer.diskStorage({
      destination,
      filename: (request, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase()
        callback(null, `${Date.now()}-${randomUUID()}${extension}`)
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (request, file, callback) => {
      if (!allowedMimeTypes.has(file.mimetype)) {
        return callback(new Error('Only JPG, PNG, and WEBP images are allowed'))
      }
      callback(null, true)
    },
  })
}

export async function validateUploadedImage(request, response, next) {
  if (!request.file) return next()

  try {
    const fileHandle = await fsPromises.open(request.file.path, 'r')
    const header = Buffer.alloc(12)
    await fileHandle.read(header, 0, header.length, 0)
    await fileHandle.close()
    const isJpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff
    const isPng = header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    const isWebp = header.subarray(0, 4).toString() === 'RIFF' && header.subarray(8, 12).toString() === 'WEBP'

    if (!isJpeg && !isPng && !isWebp) {
      await fsPromises.unlink(request.file.path).catch(() => {})
      return response.status(400).json({ message: 'Uploaded file is not a valid JPG, PNG, or WEBP image' })
    }
    next()
  } catch {
    await fsPromises.unlink(request.file.path).catch(() => {})
    response.status(400).json({ message: 'Unable to validate uploaded image' })
  }
}

export const serviceImageUpload = createImageUpload(uploadDirectory)
export const projectImageUpload = createImageUpload(projectUploadDirectory)
export const teamImageUpload = createImageUpload(teamUploadDirectory)

export {
  uploadDirectory,
  projectUploadDirectory,
  teamUploadDirectory,
}
