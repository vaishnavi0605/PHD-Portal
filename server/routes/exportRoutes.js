import express from 'express'
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js'
import { exportApplications } from '../controllers/exportController.js'

const router = express.Router()

router.get('/', authenticate, requireAdmin, exportApplications)

export default router
