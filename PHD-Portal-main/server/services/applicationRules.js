const RESERVED_CATEGORIES = new Set(['OBC', 'SC', 'ST'])

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizedText(value) {
  return String(value || '').trim().toLowerCase()
}

function isFirstClass(division) {
  const text = normalizedText(division)
  return text === 'first' || text === 'first class' || text === 'distinction'
}

function getPostGradThreshold(entry, baseThreshold) {
  const isMsc = normalizedText(entry.degree_name) === 'msc'
  const isCfti = normalizedText(entry.cfti_status) === 'cfti'

  if (isMsc && isCfti) {
    // CFTI MSc applicants get a 5% relaxation.
    return Math.max(baseThreshold - 5, 50)
  }

  return baseThreshold
}

export function getEligibilityThreshold(category) {
  return RESERVED_CATEGORIES.has(category) ? 55 : 60
}

export function validateExamDetails(examDetails = []) {
  const issues = []

  if (!examDetails.length) {
    issues.push('At least one exam detail entry is required.')
    return { valid: false, issues }
  }

  examDetails.forEach((exam, index) => {
    const label = `Exam ${index + 1}`
    const examName = String(exam.exam_name || '').trim()

    if (!examName) {
      issues.push(`${label}: exam name is required.`)
    }

    if (examName === 'Any Other' && !String(exam.custom_exam_name || '').trim()) {
      issues.push(`${label}: custom exam name is required when using Any Other.`)
    }

    const score = toNumber(exam.score)
    const percentile = toNumber(exam.percentile)
    const air = toNumber(exam.air)

    if (score === null) {
      issues.push(`${label}: score is required.`)
    }

    if (percentile === null) {
      issues.push(`${label}: percentile is required.`)
    }

    if (air === null) {
      issues.push(`${label}: All India Rank is required.`)
    } else if (air < 1) {
      issues.push(`${label}: All India Rank must be a positive number.`)
    }
  })

  return { valid: issues.length === 0, issues }
}

export function evaluateEligibility({ category, education = [] }) {
  const threshold = getEligibilityThreshold(category)
  const issues = []

  const twelfthEntries = education.filter((item) => item.level === '12th')
  if (!twelfthEntries.length) {
    issues.push('12th education details are required.')
  } else if (!twelfthEntries.some((entry) => {
    const score = toNumber(entry.score_value)
    return score !== null && score >= threshold
  })) {
    issues.push(`12th requires at least ${threshold}%.`)
  }

  const graduationEntries = education.filter((item) => item.level === 'Graduation')
  if (!graduationEntries.length) {
    issues.push('Graduation details are required.')
  } else if (!graduationEntries.some((entry) => {
    const score = toNumber(entry.score_value)
    return score !== null && score >= threshold
  })) {
    issues.push(`Graduation requires at least ${threshold}%.`)
  }

  const postGradEntries = education.filter((item) => item.level === 'Post Graduation')
  if (!postGradEntries.length) {
    issues.push('At least one Post Graduation entry is required.')
  } else if (!postGradEntries.some((entry) => {
    const score = toNumber(entry.score_value)
    const adjustedThreshold = getPostGradThreshold(entry, threshold)
    return (score !== null && score >= adjustedThreshold) || isFirstClass(entry.division)
  })) {
    issues.push(`Post Graduation requires at least ${threshold}% or First Class (MSc from CFTI gets 5% relaxation).`)
  }

  return {
    eligible: issues.length === 0,
    threshold,
    issues,
  }
}

export function formatExamLabel(exam) {
  const examName = String(exam.exam_name || '').trim()
  if (examName === 'Any Other') {
    return String(exam.custom_exam_name || '').trim() || 'Any Other'
  }
  return examName || '—'
}
