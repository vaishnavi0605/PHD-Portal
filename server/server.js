import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import applicationRoutes from './routes/applicationRoutes.js'
import exportRoutes from './routes/exportRoutes.js'

const app  = express()
const PORT = process.env.PORT || 5000

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// ─── Routes ──────────────────────────────────────────────────
app.use('/api', applicationRoutes)   // covers /api/application, /api/applications, /api/auth
app.use('/api/export', exportRoutes)

// ─── Health Check ────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// ─── 404 ─────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }))

// ─── Global Error Handler ────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error.' })
})

// ─── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
})
