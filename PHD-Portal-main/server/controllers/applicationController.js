import prisma from '../services/prismaClient.js'
import { evaluateEligibility, validateExamDetails, formatExamLabel } from '../services/applicationRules.js'
import { sendSubmissionNotificationEmails } from '../services/emailService.js'

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function combineName(firstName, lastName, fallbackName = '') {
  const parts = [firstName, lastName].map((part) => String(part || '').trim()).filter(Boolean)
  if (parts.length) return parts.join(' ')
  return String(fallbackName || '').trim()
}

function normalizeEducationEntry(entry) {
  return {
    level: entry.level,
    board: entry.board || null,
    degree_name: entry.degree_name || null,
    custom_degree_name: entry.custom_degree_name || null,
    cfti_status: entry.cfti_status || null,
    discipline: entry.discipline || null,
    institute: entry.institute || null,
    study_type: entry.study_type || null,
    year: toNumber(entry.year),
    year_of_passing: toNumber(entry.year_of_passing ?? entry.year),
    score_type: entry.score_type || null,
    score_value: toNumber(entry.score_value),
    division: entry.division || null,
  }
}

function normalizeExamEntry(entry) {
  return {
    exam_type: entry.exam_name || entry.exam_type || null,
    exam_name: entry.exam_name || entry.exam_type || null,
    custom_exam_name: entry.custom_exam_name || null,
    branch: entry.branch || null,
    year: toNumber(entry.year),
    valid_upto: entry.valid_upto || null,
    percentile: toNumber(entry.percentile),
    rank: toNumber(entry.rank),
    score: toNumber(entry.score),
    air: toNumber(entry.air),
    duration: entry.duration || null,
  }
}

function formatEducationSummary(entries = [], level) {
  return entries
    .filter((entry) => entry.level === level)
    .map((entry) => ({
      board: entry.board || null,
      degree_name: entry.degree_name || null,
      custom_degree_name: entry.custom_degree_name || null,
      cfti_status: entry.cfti_status || null,
      discipline: entry.discipline || null,
      institute: entry.institute || null,
      study_type: entry.study_type || null,
      year_of_passing: entry.year_of_passing ?? entry.year ?? null,
      score_type: entry.score_type || null,
      score_value: entry.score_value ?? null,
      division: entry.division || null,
    }))
}

function formatExamSummary(entries = []) {
  return entries.map((entry) => ({
    exam_name: formatExamLabel(entry),
    custom_exam_name: entry.custom_exam_name || null,
    score: entry.score ?? null,
    percentile: entry.percentile ?? null,
    rank: entry.rank ?? null,
    air: entry.air ?? null,
    year: entry.year ?? null,
    branch: entry.branch || null,
    valid_upto: entry.valid_upto || null,
    duration: entry.duration || null,
  }))
}

function buildEligibilityResult(body) {
  const education = Array.isArray(body.education) ? body.education : []
  const eligibility = evaluateEligibility({
    category: body.category,
    education,
  })

  return eligibility
}

function normalizeApplicationPayload(body, userEmail) {
  const firstName = String(body.first_name || '').trim()
  const lastName = String(body.last_name || '').trim()
  const fullName = combineName(firstName, lastName, body.name || '')
  const researchPref1 = String(body.research_pref_1 || body.research_area || '').trim()
  const researchPref2 = String(body.research_pref_2 || '').trim() || null
  const email = String(body.email || '').trim() || null
  const examEntries = body.exam_details?.length ? body.exam_details : body.exam_scores || []

  return {
    first_name: firstName || null,
    last_name: lastName || null,
    gender: body.gender || null,
    email: email || userEmail,
    name: fullName,
    dob: body.dob ? new Date(body.dob) : null,
    category: body.category || null,
    marital_status: body.marital_status || null,
    nationality: body.nationality || 'Indian',
    research_area: researchPref1 || null,
    research_pref_1: researchPref1 || null,
    research_pref_2: researchPref2,
    study_mode: body.study_mode || null,
    address: body.address || null,
    phone: body.phone || null,
    declaration_accepted: !!body.declaration_accepted,
    nbhm_eligible: !!body.nbhm_eligible,
    eligibility_status: 'Eligible',
    eligibility_message: 'Meets configured eligibility criteria.',
    education: (body.education || []).map(normalizeEducationEntry),
    exam_details: examEntries.map(normalizeExamEntry),
  }
}

async function writeApplicationRelations(tx, applicationId, education = [], examDetails = []) {
  await tx.education.deleteMany({ where: { application_id: applicationId } })
  const educationRows = education
    .filter((entry) => entry.level)
    .map((entry) => ({
      application_id: applicationId,
      level: entry.level,
      board: entry.board,
      degree_name: entry.degree_name,
      custom_degree_name: entry.custom_degree_name,
      cfti_status: entry.cfti_status,
      discipline: entry.discipline,
      institute: entry.institute,
      study_type: entry.study_type || 'Regular',
      year: entry.year,
      year_of_passing: entry.year_of_passing,
      score_type: entry.score_type,
      score_value: entry.score_value,
      division: entry.division,
    }))

  if (educationRows.length) {
    await tx.education.createMany({ data: educationRows })
  }

  await tx.examScore.deleteMany({ where: { application_id: applicationId } })
  const examRows = examDetails
    .filter((entry) => entry.exam_name)
    .map((entry) => ({
      application_id: applicationId,
      exam_type: entry.exam_name,
      exam_name: entry.exam_name,
      custom_exam_name: entry.custom_exam_name,
      branch: entry.branch,
      year: entry.year,
      valid_upto: entry.valid_upto,
      percentile: entry.percentile,
      rank: entry.rank,
      score: entry.score,
      air: entry.air,
      duration: entry.duration,
    }))

  if (examRows.length) {
    await tx.examScore.createMany({ data: examRows })
  }
}

// ─── Fetch flattened application data ─────────────
export async function fetchFlatApplications(params = {}) {
  const where = {}

  if (params.category) {
    where.category = params.category
  }

  if (params.studyMode) {
    where.study_mode = params.studyMode
  }

  if (params.eligibilityStatus) {
    where.eligibility_status = params.eligibilityStatus
  }

  if (params.nbhmEligible === 'true') {
    where.nbhm_eligible = true
  }

  if (params.nbhmEligible === 'false') {
    where.nbhm_eligible = false
  }

  if (params.gateScore) {
    where.exam_scores = {
      some: {
        OR: [
          { exam_type: 'GATE' },
          { exam_name: 'GATE' },
          { exam_name: 'GATE', custom_exam_name: null },
        ],
        score: { gte: parseFloat(params.gateScore) },
      },
    }
  }

  const sortCol = params.sortBy || 'created_at'
  const direction = params.order || 'desc'
  const validSortCols = ['name', 'created_at', 'category']
  const orderBy = validSortCols.includes(sortCol) ? { [sortCol]: direction } : { created_at: 'desc' }

  const applications = await prisma.application.findMany({
    where,
    orderBy,
    include: {
      education: true,
      exam_scores: true,
    },
  })

  return applications.map((app) => {
    const education = app.education || []
    const exams = app.exam_scores || []
    const isNewApplication = Date.now() - new Date(app.created_at).getTime() < 24 * 60 * 60 * 1000

    return {
      id: app.id,
      user_id: app.user_id,
      first_name: app.first_name || '',
      last_name: app.last_name || '',
      full_name: combineName(app.first_name, app.last_name, app.name),
      gender: app.gender || '',
      email: app.email || '',
      name: app.name,
      dob: app.dob,
      category: app.category,
      marital_status: app.marital_status,
      nationality: app.nationality,
      research_area: app.research_area,
      research_pref_1: app.research_pref_1 || app.research_area || '',
      research_pref_2: app.research_pref_2 || '',
      study_mode: app.study_mode || '',
      address: app.address,
      phone: app.phone,
      declaration_accepted: app.declaration_accepted,
      nbhm_eligible: app.nbhm_eligible,
      eligibility_status: app.eligibility_status || 'Pending',
      eligibility_message: app.eligibility_message || '',
      is_new_application: isNewApplication,
      created_at: app.created_at,
      updated_at: app.updated_at,
      education,
      exam_details: formatExamSummary(exams),
      exam_scores: exams.map((entry) => ({
        ...entry,
        exam_name: formatExamLabel(entry),
      })),
      education_summary: {
        tenth: formatEducationSummary(education, '10th'),
        twelfth: formatEducationSummary(education, '12th'),
        graduation: formatEducationSummary(education, 'Graduation'),
        postGraduation: formatEducationSummary(education, 'Post Graduation'),
      },
      pct_10th: education.find((entry) => entry.level === '10th') || null,
      pct_12th: education.find((entry) => entry.level === '12th') || null,
      pct_grad: education.find((entry) => entry.level === 'Graduation') || null,
      pct_pg: education.filter((entry) => entry.level === 'Post Graduation'),
      gate_branch: exams.find((entry) => formatExamLabel(entry) === 'GATE')?.branch ?? null,
      gate_year: exams.find((entry) => formatExamLabel(entry) === 'GATE')?.year ?? null,
      gate_valid_upto: exams.find((entry) => formatExamLabel(entry) === 'GATE')?.valid_upto ?? null,
      gate_percentile: exams.find((entry) => formatExamLabel(entry) === 'GATE')?.percentile ?? null,
      gate_score: exams.find((entry) => formatExamLabel(entry) === 'GATE')?.score ?? null,
      gate_air: exams.find((entry) => formatExamLabel(entry) === 'GATE')?.air ?? null,
      csir_branch: exams.find((entry) => formatExamLabel(entry) === 'CSIR NET / JRF')?.branch ?? null,
      csir_year: exams.find((entry) => formatExamLabel(entry) === 'CSIR NET / JRF')?.year ?? null,
      csir_valid_upto: exams.find((entry) => formatExamLabel(entry) === 'CSIR NET / JRF')?.valid_upto ?? null,
      csir_percentile: exams.find((entry) => formatExamLabel(entry) === 'CSIR NET / JRF')?.percentile ?? null,
      csir_score: exams.find((entry) => formatExamLabel(entry) === 'CSIR NET / JRF')?.score ?? null,
      csir_duration: exams.find((entry) => formatExamLabel(entry) === 'CSIR NET / JRF')?.duration ?? null,
    }
  })
}

// ─── Controllers ─────────────────────────────────────────────

/**
 * POST /api/application
 */
export async function submitApplication(req, res) {
  const userId = req.user.id
  const userEmail = req.user.email
  const body = req.validatedBody

  try {
    console.log('submitApplication validated body:', JSON.stringify(body, null, 2))
    const examEntries = body.exam_details?.length ? body.exam_details : body.exam_scores || []
    const examValidation = validateExamDetails(examEntries)
    if (!examValidation.valid) {
      console.log('Exam validation issues:', JSON.stringify(examValidation.issues, null, 2))
      return res.status(400).json({
        error: 'Validation failed',
        details: { exam_details: examValidation.issues },
      })
    }

    const eligibility = buildEligibilityResult(body)
    if (!eligibility.eligible) {
      return res.status(400).json({
        error: 'Eligibility criteria not met.',
        details: { eligibility: eligibility.issues },
      })
    }

    const normalized = normalizeApplicationPayload(body, userEmail)
    console.log('Normalized application payload:', JSON.stringify(normalized, null, 2))
    const { education, exam_details, ...applicationData } = normalized

    const applicationId = await prisma.$transaction(async (tx) => {
      const app = await tx.application.upsert({
        where: { user_id: userId },
        update: {
          ...applicationData,
          updated_at: new Date(),
        },
        create: {
          user_id: userId,
          ...applicationData,
          created_at: new Date(),
          updated_at: new Date(),
        },
      })

      await writeApplicationRelations(tx, app.id, education, exam_details)

      return app.id
    })

    const adminUsers = await prisma.user.findMany({
      where: { isAdmin: true },
      select: { email: true },
    })

    const notifications = await sendSubmissionNotificationEmails({
      studentEmail: normalized.email,
      studentName: normalized.name,
      applicationId,
      researchPref1: normalized.research_pref_1,
      eligibilityStatus: 'Eligible',
      adminEmails: adminUsers.map((admin) => admin.email),
    })

    return res.status(200).json({
      message: 'Application saved.',
      id: applicationId,
      eligibilityStatus: 'Eligible',
      notificationMode: notifications.demoMailMode ? 'demo' : 'smtp',
    })
  } catch (err) {
    console.error('submitApplication error:', err)
    return res.status(500).json({ error: err.message || 'Internal server error.' })
  }
}

/**
 * GET /api/application/me
 */
export async function getMyApplication(req, res) {
  const userId = req.user.id

  try {
    const data = await prisma.application.findUnique({
      where: { user_id: userId },
      include: {
        education: true,
        exam_scores: true,
      },
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
