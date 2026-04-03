import { z } from 'zod'

const educationSchema = z.object({
  level:      z.enum(['10th', '12th', 'Graduation', 'Post Graduation']),
  discipline: z.string().optional(),
  institute:  z.string().optional(),
  study_type: z.enum(['Regular', 'Part-time']).optional(),
  year:       z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1).optional().nullable(),
  percentage: z.coerce.number().min(0).max(100).optional().nullable(),
  division:   z.string().optional(),
})

const examScoreSchema = z.object({
  exam_type: z.enum(['GATE', 'CSIR']),
  score:     z.coerce.number().min(0).optional().nullable(),
  year:      z.coerce.number().int().min(2000).max(new Date().getFullYear() + 1).optional().nullable(),
})

export const applicationSchema = z.object({
  name:             z.string().min(2, 'Name must be at least 2 characters'),
  dob:              z.string().optional().nullable(),
  category:         z.enum(['GEN', 'OBC', 'SC', 'ST']).optional(),
  address:          z.string().optional(),
  phone:            z.string().optional(),
  cgpa:             z.coerce.number().min(0).max(10).optional().nullable(),
  graduation_marks: z.coerce.number().min(0).max(100).optional().nullable(),
  nbhm_eligible:    z.boolean().optional().default(false),
  education:        z.array(educationSchema).optional().default([]),
  exam_scores:      z.array(examScoreSchema).optional().default([]),
})

/**
 * Middleware factory: validate req.body against a Zod schema.
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      return res.status(400).json({ error: 'Validation failed', details: errors })
    }
    req.validatedBody = result.data
    next()
  }
}
