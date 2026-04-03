import prisma from '../services/prismaClient.js'

// ─── Fetch flattened application data ─────────────

export async function fetchFlatApplications(params = {}) {
  let where = {}

  if (params.minCGPA) {
    where.cgpa = { gte: parseFloat(params.minCGPA) }
  }
  if (params.category) {
    where.category = params.category
  }
  if (params.nbhmEligible === 'true') {
    where.nbhm_eligible = true
  }
  if (params.nbhmEligible === 'false') {
    where.nbhm_eligible = false
  }

  // GATE score filtering requires a relational condition
  if (params.gateScore) {
    where.exam_scores = {
      some: {
        exam_type: 'GATE',
        score: { gte: parseFloat(params.gateScore) }
      }
    }
  }

  // Sorting
  let orderBy = {}
  const sortCol = params.sortBy || 'created_at'
  const direction = params.order || 'desc'
  const validSortCols = ['name', 'cgpa', 'created_at', 'category']
  if (validSortCols.includes(sortCol)) {
    orderBy[sortCol] = direction
  }

  const applications = await prisma.application.findMany({
    where,
    orderBy,
    include: {
      education: true,
      exam_scores: true
    }
  })

  // Flatten & map
  return applications.map(app => {
    const edu = app.education || []
    const exams = app.exam_scores || []

    const get = (level) => edu.find(e => e.level === level)
    const getExam = (type) => exams.find(e => e.exam_type === type)

    return {
      id: app.id,
      user_id: app.user_id,
      email: app.email || '',
      name: app.name,
      dob: app.dob,
      category: app.category,
      address: app.address,
      phone: app.phone,
      cgpa: app.cgpa,
      graduation_marks: app.graduation_marks,
      nbhm_eligible: app.nbhm_eligible,
      created_at: app.created_at,
      pct_10th: get('10th')?.percentage ?? null,
      pct_12th: get('12th')?.percentage ?? null,
      pct_grad: get('Graduation')?.percentage ?? null,
      pct_pg: get('Post Graduation')?.percentage ?? null,
      gate_score: getExam('GATE')?.score ?? null,
      gate_year: getExam('GATE')?.year ?? null,
      csir_score: getExam('CSIR')?.score ?? null,
      csir_year: getExam('CSIR')?.year ?? null,
      education: edu,
      exam_scores: exams,
    }
  })
}

// ─── Controllers ─────────────────────────────────────────────

/**
 * POST /api/application
 * Student: upsert own application using Prisma $transaction
 */
export async function submitApplication(req, res) {
  const userId = req.user.id
  const email = req.user.email
  const body = req.validatedBody

  try {
    const applicationId = await prisma.$transaction(async (tx) => {
      // 1. Upsert main application record
      const appData = {
        name: body.name,
        dob: body.dob ? new Date(body.dob) : null,
        category: body.category,
        address: body.address,
        phone: body.phone,
        cgpa: body.cgpa,
        graduation_marks: body.graduation_marks,
        nbhm_eligible: body.nbhm_eligible,
        updated_at: new Date()
      }

      const app = await tx.application.upsert({
        where: { user_id: userId },
        update: appData,
        create: {
          user_id: userId,
          email: email,         // Inherit email dynamically
          created_at: new Date(),
          ...appData
        }
      })

      const appId = app.id

      // 2. Clear old relations, add new education
      await tx.education.deleteMany({ where: { application_id: appId } })
      if (body.education?.length) {
        const eduRows = body.education
          .filter(e => e.discipline || e.institute || e.percentage || e.year)
          .map(e => ({
            application_id: appId,
            level: e.level,
            discipline: e.discipline,
            institute: e.institute,
            study_type: e.study_type || 'Regular',
            year: e.year,
            percentage: e.percentage,
            division: e.division,
          }))
        if (eduRows.length) await tx.education.createMany({ data: eduRows })
      }

      // 3. Clear old records, add new exam scores
      await tx.examScore.deleteMany({ where: { application_id: appId } })
      if (body.exam_scores?.length) {
        const scoreRows = body.exam_scores
          .filter(s => s.score != null && s.score !== '')
          .map(s => ({
            application_id: appId,
            exam_type: s.exam_type,
            score: s.score,
            year: s.year,
          }))
        if (scoreRows.length) await tx.examScore.createMany({ data: scoreRows })
      }

      return appId
    })

    return res.status(200).json({ message: 'Application saved.', id: applicationId })
  } catch (err) {
    console.error('submitApplication error:', err)
    return res.status(500).json({ error: err.message || 'Internal server error.' })
  }
}

/**
 * GET /api/application/me
 * Student: fetch own application
 */
export async function getMyApplication(req, res) {
  const userId = req.user.id

  try {
    const data = await prisma.application.findUnique({
      where: { user_id: userId },
      include: {
        education: true,
        exam_scores: true
      }
    })

    return res.status(200).json({ application: data || null })
  } catch (err) {
    console.error('getMyApplication error:', err)
    return res.status(500).json({ error: err.message })
  }
}

/**
 * GET /api/applications
 * Admin: get all applications with filters
 */
export async function getAllApplications(req, res) {
  try {
    const results = await fetchFlatApplications(req.query)
    return res.status(200).json({ applications: results, total: results.length })
  } catch (err) {
    console.error('getAllApplications error:', err)
    return res.status(500).json({ error: err.message })
  }
}
