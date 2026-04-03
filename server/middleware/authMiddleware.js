import { createClient } from '@supabase/supabase-js'
import prisma from '../services/prismaClient.js'
import 'dotenv/config'

// Anon client for verifying student JWTs over the network
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

/**
 * Verifies the Bearer JWT from Supabase Auth.
 * Attaches req.user = { id, email } on success.
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token.' })
    }

    req.user = user
    req.token = token
    next()
  } catch (error) {
    console.error('Auth verification failed:', error.message)
    return res.status(401).json({ error: 'Internal Auth Error.' })
  }
}

/**
 * Middleware that requires the authenticated user to be an admin.
 * Must be used AFTER authenticate().
 */
export async function requireAdmin(req, res, next) {
  try {
    const adminUser = await prisma.admin.findUnique({
      where: { user_id: req.user.id }
    })

    if (!adminUser) {
      return res.status(403).json({ error: 'Forbidden: admin access required.' })
    }

    req.isAdmin = true
    next()
  } catch (err) {
    return res.status(500).json({ error: 'Failed to verify admin status.' })
  }
}
