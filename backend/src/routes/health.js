import express from 'express'
import { pool } from '../config/db.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    await pool.query('SELECT 1 AS connected')

    res.status(200).json({
      status: 'ok',
      database: 'connected',
      databaseName: process.env.DB_NAME || 'software_agency_db',
      time: new Date().toISOString(),
    })
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      message: 'Database connection failed',
      time: new Date().toISOString(),
    })
  }
})

export default router
