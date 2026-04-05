import { z } from 'zod'

const numOrNull = z.preprocess(
  (value) => (value === '' || value === undefined ? null : value),
  z.coerce.number().nullable().optional()
)

const intOrNull = z.preprocess(
  (value) => (value === '' || value === undefined ? null : value),
  z.coerce.number().int().nullable().optional()
)

const educationSchema = z.object({
  level: z.enum(['10th', '12th', 'Graduation', 'Post Graduation']),
  board: z.string().optional().nullable(),
  degree_name: z.string().optional().nullable(),
  custom_degree_name: z.string().optional().nullable(),
  cfti_status: z.enum(['CFTI', 'Non-CFTI']).optional().nullable(),
  discipline: z.string().optional().nullable(),
  institute: z.string().optional().nullable(),
  study_type: z.enum(['Regular', 'Part-time', 'Online']).optional().nullable(),
  year: z.preprocess(
    (value) => (value === '' || value === undefined ? null : value),
    z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1).nullable().optional()
  ),
  year_of_passing: z.preprocess(
    (value) => (value === '' || value === undefined ? null : value),
    z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1).nullable().optional()
  ),
  score_type: z.enum(['percentage', 'cgpa']).optional().nullable(),
  score_value: z.preprocess(
    (value) => (value === '' || value === undefined ? null : value),
    z.coerce.number().min(0).max(100).nullable().optional()
  ),
  division: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (['10th', '12th'].includes(data.level) && !String(data.board || '').trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['board'], message: 'Board is required.' })
  }

  if (['Graduation', 'Post Graduation'].includes(data.level)) {
    if (!String(data.degree_name || '').trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['degree_name'], message: 'Degree is required.' })
    }
    if (data.degree_name === 'Other' && !String(data.custom_degree_name || '').trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['custom_degree_name'], message: 'Custom degree name is required.' })
    }

    if (data.level === 'Post Graduation' && data.degree_name === 'MSc' && !String(data.cfti_status || '').trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['cfti_status'], message: 'Select CFTI or Non-CFTI for MSc.' })
    }
  }
})

const examDetailSchema = z.object({
  exam_name: z.enum(['GATE', 'CSIR NET / JRF', 'UGC NET', 'Any Other']),
  custom_exam_name: z.string().optional().nullable(),
  branch: z.string().optional().nullable(),
  year: z.preprocess(
    (value) => (value === '' || value === undefined ? null : value),
    z.coerce.number().int().min(2000).max(new Date().getFullYear() + 1).nullable().optional()
  ),
  score: numOrNull,
  percentile: numOrNull,
  rank: intOrNull,
  air: intOrNull,
  valid_upto: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.exam_name === 'Any Other' && !String(data.custom_exam_name || '').trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['custom_exam_name'], message: 'Custom exam name is required.' })
  }

  if (data.score == null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['score'], message: 'Score is required.' })
  }

  if (data.percentile == null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['percentile'], message: 'Percentile is required.' })
  }

  if (data.air == null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['air'], message: 'All India Rank is required.' })
  }
})

export const applicationSchema = z.object({
  first_name: z.string().min(1, 'First name is required').optional().nullable(),
  last_name: z.string().min(1, 'Last name is required').optional().nullable(),
  name: z.string().optional().nullable(),
  gender: z.enum(['Male', 'Female', 'Other']).optional().nullable(),
  email: z.preprocess(
    (value) => (value === '' || value === undefined ? null : value),
    z.string().email('Invalid email').nullable().optional()
  ),
  dob: z.string().optional().nullable(),
  category: z.enum(['GEN', 'OBC', 'SC', 'ST']).optional(),
  marital_status: z.enum(['Single', 'Married', 'Divorced', 'Widowed']).optional().nullable(),
  nationality: z.string().optional().nullable(),
  research_area: z.string().optional().nullable(),
  research_pref_1: z.string().optional().nullable(),
  research_pref_2: z.string().optional().nullable(),
  study_mode: z.enum(['Regular', 'Part-time / Online']).optional().nullable(),
  address: z.string().optional(),
  phone: z.string().optional(),
  declaration_accepted: z.boolean().optional().default(false),
  nbhm_eligible: z.boolean().optional().default(false),
  education: z.array(educationSchema).optional().default([]),
  exam_details: z.array(examDetailSchema).optional().default([]),
  exam_scores: z.array(examDetailSchema).optional().default([]),
}).superRefine((data, ctx) => {
  if (!String(data.first_name || '').trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['first_name'], message: 'First name is required.' })
  }

  if (!String(data.last_name || '').trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['last_name'], message: 'Last name is required.' })
  }

  if (!String(data.gender || '').trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['gender'], message: 'Gender is required.' })
  }

  if (!String(data.research_pref_1 || '').trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['research_pref_1'], message: 'First research preference is required.' })
  }

  const examEntries = data.exam_details?.length ? data.exam_details : data.exam_scores || []
  if (!examEntries.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['exam_details'], message: 'At least one exam detail is required.' })
  }

  if (data.declaration_accepted !== true) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['declaration_accepted'], message: 'You must accept the declaration before submission.' })
  }
})

/**
 * Middleware factory: validate req.body against a Zod schema.
 */
export function validate(schema) {
  return (req, res, next) => {
    console.log('Incoming validation payload:', JSON.stringify(req.body, null, 2))
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      const formErrors = result.error.flatten().formErrors
      console.log('Validation errors:', JSON.stringify({ errors, formErrors }, null, 2))
      return res.status(400).json({ error: 'Validation failed', details: errors, formErrors })
    }
    req.validatedBody = result.data
    next()
  }
}
