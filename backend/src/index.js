import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import healthRouter from './routes/health.js'
import authRouter from './routes/auth.js'
import adminRouter from './routes/admin.js'
import servicesRouter from './routes/services.js'
import projectsRouter from './routes/projects.js'
import teamRouter from './routes/team.js'
import inquiriesRouter from './routes/inquiries.js'
import { projectUploadDirectory, teamUploadDirectory, uploadDirectory } from './middleware/upload.js'
import { pool } from './config/db.js'

dotenv.config()

const app = express()

// Middlewares
app.use(express.json())
app.use('/uploads/services', express.static(uploadDirectory))
app.use('/uploads/projects', express.static(projectUploadDirectory))
app.use('/uploads/team', express.static(teamUploadDirectory))

// CORS - allow frontend origin from env
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
app.use(cors({ origin: FRONTEND_URL, credentials: true }))

// Test DB connection on startup (non-blocking)
pool.getConnection()
  .then((conn) => {
    conn.release()
    console.log('MySQL pool connected')
  })
  .catch((err) => {
    console.warn('MySQL pool connection failed:', err.message)
  })

// Routes
app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)
app.use('/api/services', servicesRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/team-members', teamRouter)
app.use('/api/inquiries', inquiriesRouter)

app.use((error, request, response, next) => {
  if (response.headersSent) return next(error)
  if (error instanceof SyntaxError && error.status === 400 && error.type === 'entity.parse.failed') {
    return response.status(400).json({ message: 'Request body contains invalid JSON' })
  }
  const statusCode = error.statusCode || 500
  response.status(statusCode).json({
    message: statusCode < 500 ? error.message || 'Request failed' : 'Internal server error',
  })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`)
})

export default app
