import React, { useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Mail, Lock, KeyRound, ArrowRight, GraduationCap, Loader2 } from 'lucide-react'

// ─── OTP Step Enum
const STEP = { EMAIL: 'email', OTP: 'otp' }

export default function Login() {
  const navigate = useNavigate()
  const [tab, setTab]       = useState('student') // 'student' | 'admin'

  // Student OTP state
  const [email, setEmail]   = useState('')
  const [otp, setOtp]       = useState('')
  const [step, setStep]     = useState(STEP.EMAIL)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)

  // Admin state
  const [adminEmail, setAdminEmail]     = useState('')
  const [adminPass, setAdminPass]       = useState('')
  const [adminLoading, setAdminLoading] = useState(false)

  // ── Student: send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email.trim()) return toast.error('Please enter your email.')
    setSending(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    })
    setSending(false)
    if (error) return toast.error(error.message)
    toast.success('OTP sent! Check your inbox.')
    setStep(STEP.OTP)
  }

  // ── Student: verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp.trim()) return toast.error('Enter the OTP from your email.')
    setVerifying(true)
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: 'email',
    })
    setVerifying(false)
    if (error) return toast.error(error.message)
    toast.success('Welcome!')
    navigate('/apply')
  }

  // ── Admin: email + password
  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setAdminLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: adminEmail.trim(),
      password: adminPass,
    })
    setAdminLoading(false)
    if (error) return toast.error(error.message)
    toast.success('Admin login successful!')
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      {/* Background decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-gradient shadow-glow mb-4">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold font-heading text-white">PhD Admission Portal</h1>
          <p className="text-white/50 mt-1 text-sm">Mathematics Department</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Tabs */}
          <div className="flex p-1 bg-white/5 rounded-xl mb-8" role="tablist">
            {[
              { key: 'student', label: 'Student Login' },
              { key: 'admin',   label: 'Admin Login'   },
            ].map(t => (
              <button
                key={t.key}
                role="tab"
                id={`tab-${t.key}`}
                aria-selected={tab === t.key}
                onClick={() => { setTab(t.key); setStep(STEP.EMAIL) }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  tab === t.key
                    ? 'bg-primary-gradient text-white shadow-glow-sm'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Student OTP Login ── */}
          {tab === 'student' && (
            <div className="animate-fade-in">
              {step === STEP.EMAIL ? (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div>
                    <label htmlFor="student-email" className="form-label">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        id="student-email"
                        type="email"
                        required
                        autoFocus
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="yourname@university.edu"
                        className="form-input pl-10"
                      />
                    </div>
                    <p className="text-xs text-white/40 mt-2">
                      A one-time password will be sent to this email.
                    </p>
                  </div>

                  <button
                    id="btn-send-otp"
                    type="submit"
                    disabled={sending}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {sending
                      ? <><Loader2 size={16} className="animate-spin" /> Sending OTP...</>
                      : <><span>Send OTP</span><ArrowRight size={16} /></>
                    }
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="bg-primary-600/10 border border-primary-500/20 rounded-xl p-3.5 text-sm text-white/70">
                    OTP sent to <span className="text-primary-300 font-medium">{email}</span>
                  </div>

                  <div>
                    <label htmlFor="otp-input" className="form-label">Enter OTP</label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        id="otp-input"
                        type="text"
                        required
                        autoFocus
                        maxLength={6}
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="6-digit code"
                        className="form-input pl-10 tracking-widest text-center text-xl font-mono"
                      />
                    </div>
                  </div>

                  <button
                    id="btn-verify-otp"
                    type="submit"
                    disabled={verifying}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {verifying
                      ? <><Loader2 size={16} className="animate-spin" /> Verifying...</>
                      : <><span>Verify & Sign In</span><ArrowRight size={16} /></>
                    }
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep(STEP.EMAIL); setOtp('') }}
                    className="w-full text-center text-sm text-white/40 hover:text-white/70 transition-colors"
                  >
                    ← Change email
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ── Admin Login ── */}
          {tab === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-5 animate-fade-in">
              <div>
                <label htmlFor="admin-email" className="form-label">Admin Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    id="admin-email"
                    type="email"
                    required
                    autoFocus
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    placeholder="admin@university.edu"
                    className="form-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-password" className="form-label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    id="admin-password"
                    type="password"
                    required
                    value={adminPass}
                    onChange={e => setAdminPass(e.target.value)}
                    placeholder="••••••••"
                    className="form-input pl-10"
                  />
                </div>
              </div>

              <button
                id="btn-admin-login"
                type="submit"
                disabled={adminLoading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {adminLoading
                  ? <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                  : <><span>Sign In</span><ArrowRight size={16} /></>
                }
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          © {new Date().getFullYear()} Mathematics Department · PhD Admission Portal
        </p>
      </div>
    </div>
  )
}
