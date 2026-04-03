import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  User, Calendar, BookOpen, Award, CheckSquare,
  Save, LogOut, GraduationCap, Loader2, RefreshCw,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { submitApplication, getMyApplication } from '../services/api'
import FormSection, { FieldWrapper } from '../components/FormSection'

const CATEGORIES    = ['GEN', 'OBC', 'SC', 'ST']
const STUDY_TYPES   = ['Regular', 'Part-time']
const DIVISIONS     = ['First', 'Second', 'Third', 'Distinction']
const EDU_LEVELS    = ['10th', '12th', 'Graduation', 'Post Graduation']
const EXAM_TYPES    = ['GATE', 'CSIR']

const blankEdu = (level) => ({
  level, discipline: '', institute: '', study_type: 'Regular', year: '', percentage: '', division: 'First',
})

const blankScore = (exam_type) => ({
  exam_type, score: '', year: '',
})

const defaultForm = () => ({
  name: '', dob: '', category: 'GEN', address: '', phone: '',
  cgpa: '', graduation_marks: '', nbhm_eligible: false,
  education: EDU_LEVELS.map(blankEdu),
  exam_scores: EXAM_TYPES.map(blankScore),
})

export default function ApplicationForm() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]         = useState(defaultForm())
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [isEdit, setIsEdit]     = useState(false)

  // Load existing application
  useEffect(() => {
    getMyApplication()
      .then(res => {
        if (res.data?.application) {
          const app = res.data.application
          setIsEdit(true)
          setForm({
            name:              app.name || '',
            dob:               app.dob  || '',
            category:          app.category || 'GEN',
            address:           app.address  || '',
            phone:             app.phone    || '',
            cgpa:              app.cgpa ?? '',
            graduation_marks:  app.graduation_marks ?? '',
            nbhm_eligible:     app.nbhm_eligible ?? false,
            education: EDU_LEVELS.map(level => {
              const found = app.education?.find(e => e.level === level)
              return found ? { ...found } : blankEdu(level)
            }),
            exam_scores: EXAM_TYPES.map(type => {
              const found = app.exam_scores?.find(e => e.exam_type === type)
              return found ? { ...found } : blankScore(type)
            }),
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const setEdu = (idx, key, val) =>
    setForm(f => {
      const ed = [...f.education]
      ed[idx] = { ...ed[idx], [key]: val }
      return { ...f, education: ed }
    })

  const setScore = (idx, key, val) =>
    setForm(f => {
      const sc = [...f.exam_scores]
      sc[idx] = { ...sc[idx], [key]: val }
      return { ...f, exam_scores: sc }
    })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name is required.')
    if (!form.dob)         return toast.error('Date of birth is required.')
    setSaving(true)
    try {
      await submitApplication(form)
      toast.success(isEdit ? 'Application updated!' : 'Application submitted!')
      setIsEdit(true)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-3" />
          <p className="text-white/40">Loading your application...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hero-gradient">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">PhD Application</p>
              <p className="text-xs text-white/40">Mathematics Department</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 hidden sm:block">{user?.email}</span>
            <button
              id="btn-signout"
              onClick={handleSignOut}
              className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold font-heading text-white">
              {isEdit ? 'Edit Your Application' : 'PhD Application Form'}
            </h1>
            {isEdit && (
              <span className="badge bg-success-500/20 text-success-500 border border-success-500/30">
                Submitted
              </span>
            )}
          </div>
          <p className="text-white/50">
            {isEdit
              ? 'Your application has been submitted. You can update it below.'
              : 'Complete all sections and submit your application.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ── 1. Personal Details ── */}
          <FormSection icon={User} title="Personal Details" subtitle="Your basic information">
            <FieldWrapper label="Full Name" required>
              <input
                id="field-name"
                type="text"
                value={form.name}
                onChange={e => setField('name', e.target.value)}
                placeholder="As per official records"
                className="form-input"
                required
              />
            </FieldWrapper>

            <FieldWrapper label="Date of Birth" required>
              <input
                id="field-dob"
                type="date"
                value={form.dob}
                onChange={e => setField('dob', e.target.value)}
                className="form-input"
                required
              />
            </FieldWrapper>

            <FieldWrapper label="Category" required>
              <select
                id="field-category"
                value={form.category}
                onChange={e => setField('category', e.target.value)}
                className="form-input appearance-none"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c} className="bg-dark-800">{c}</option>
                ))}
              </select>
            </FieldWrapper>

            <FieldWrapper label="Phone Number">
              <input
                id="field-phone"
                type="tel"
                value={form.phone}
                onChange={e => setField('phone', e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="form-input"
              />
            </FieldWrapper>

            <FieldWrapper label="Address" className="md:col-span-2">
              <textarea
                id="field-address"
                rows={3}
                value={form.address}
                onChange={e => setField('address', e.target.value)}
                placeholder="Permanent address"
                className="form-input resize-none"
              />
            </FieldWrapper>
          </FormSection>

          {/* ── 2. Education Details ── */}
          {form.education.map((edu, idx) => (
            <FormSection
              key={edu.level}
              icon={BookOpen}
              title={`${edu.level} Education`}
              subtitle="Academic qualification details"
            >
              <FieldWrapper label="Discipline / Stream">
                <input
                  id={`edu-${idx}-discipline`}
                  type="text"
                  value={edu.discipline}
                  onChange={e => setEdu(idx, 'discipline', e.target.value)}
                  placeholder="e.g. Mathematics, Science"
                  className="form-input"
                />
              </FieldWrapper>

              <FieldWrapper label="Institute / School / University">
                <input
                  id={`edu-${idx}-institute`}
                  type="text"
                  value={edu.institute}
                  onChange={e => setEdu(idx, 'institute', e.target.value)}
                  placeholder="Name of institution"
                  className="form-input"
                />
              </FieldWrapper>

              <FieldWrapper label="Study Type">
                <select
                  id={`edu-${idx}-type`}
                  value={edu.study_type}
                  onChange={e => setEdu(idx, 'study_type', e.target.value)}
                  className="form-input appearance-none"
                >
                  {STUDY_TYPES.map(t => (
                    <option key={t} value={t} className="bg-dark-800">{t}</option>
                  ))}
                </select>
              </FieldWrapper>

              <FieldWrapper label="Year of Passing">
                <input
                  id={`edu-${idx}-year`}
                  type="number"
                  min="1990"
                  max={new Date().getFullYear()}
                  value={edu.year}
                  onChange={e => setEdu(idx, 'year', e.target.value)}
                  placeholder="e.g. 2020"
                  className="form-input"
                />
              </FieldWrapper>

              <FieldWrapper label="Percentage (%)">
                <input
                  id={`edu-${idx}-pct`}
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={edu.percentage}
                  onChange={e => setEdu(idx, 'percentage', e.target.value)}
                  placeholder="e.g. 85.5"
                  className="form-input"
                />
              </FieldWrapper>

              <FieldWrapper label="Division">
                <select
                  id={`edu-${idx}-div`}
                  value={edu.division}
                  onChange={e => setEdu(idx, 'division', e.target.value)}
                  className="form-input appearance-none"
                >
                  {DIVISIONS.map(d => (
                    <option key={d} value={d} className="bg-dark-800">{d}</option>
                  ))}
                </select>
              </FieldWrapper>
            </FormSection>
          ))}

          {/* ── 3. Academic Scores ── */}
          <FormSection icon={Award} title="Academic Score" subtitle="Post-graduation academic performance">
            <FieldWrapper label="CGPA (Post-Graduation)">
              <input
                id="field-cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={form.cgpa}
                onChange={e => setField('cgpa', e.target.value)}
                placeholder="e.g. 8.5"
                className="form-input"
              />
            </FieldWrapper>

            <FieldWrapper label="Graduation Marks (%)">
              <input
                id="field-grad-marks"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={form.graduation_marks}
                onChange={e => setField('graduation_marks', e.target.value)}
                placeholder="e.g. 78.0"
                className="form-input"
              />
            </FieldWrapper>
          </FormSection>

          {/* ── 4. Exam Scores ── */}
          <FormSection icon={Award} title="Entrance Exam Scores" subtitle="GATE / CSIR scores (if applicable)">
            {form.exam_scores.map((sc, idx) => (
              <React.Fragment key={sc.exam_type}>
                <FieldWrapper label={`${sc.exam_type} Score`}>
                  <input
                    id={`exam-${idx}-score`}
                    type="number"
                    step="0.01"
                    value={sc.score}
                    onChange={e => setScore(idx, 'score', e.target.value)}
                    placeholder={`${sc.exam_type} score`}
                    className="form-input"
                  />
                </FieldWrapper>
                <FieldWrapper label={`${sc.exam_type} Year`}>
                  <input
                    id={`exam-${idx}-year`}
                    type="number"
                    min="2000"
                    max={new Date().getFullYear()}
                    value={sc.year}
                    onChange={e => setScore(idx, 'year', e.target.value)}
                    placeholder="e.g. 2023"
                    className="form-input"
                  />
                </FieldWrapper>
              </React.Fragment>
            ))}
          </FormSection>

          {/* ── 5. NBHM Eligibility ── */}
          <FormSection icon={CheckSquare} title="NBHM Eligibility" subtitle="National Board for Higher Mathematics">
            <div className="md:col-span-2">
              <label
                htmlFor="field-nbhm"
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-primary-500/50 transition-all"
              >
                <div className="relative">
                  <input
                    id="field-nbhm"
                    type="checkbox"
                    checked={form.nbhm_eligible}
                    onChange={e => setField('nbhm_eligible', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                    form.nbhm_eligible ? 'bg-primary-600 border-primary-600' : 'border-white/30 bg-white/5'
                  }`}>
                    {form.nbhm_eligible && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-white font-medium">I am eligible for NBHM</p>
                  <p className="text-white/40 text-sm mt-0.5">National Board for Higher Mathematics scholarship eligibility</p>
                </div>
              </label>
            </div>
          </FormSection>

          {/* ── Submit Button ── */}
          <div className="flex justify-end gap-4 pt-2 pb-8">
            <button
              id="btn-submit-application"
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-8"
            >
              {saving ? (
                <><Loader2 size={16} className="animate-spin" /> Saving...</>
              ) : isEdit ? (
                <><RefreshCw size={16} /> Update Application</>
              ) : (
                <><Save size={16} /> Submit Application</>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
