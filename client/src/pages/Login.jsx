import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Mail, KeyRound, ArrowRight, GraduationCap, Loader2, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { sendOtp as apiSendOtp, verifyOtp as apiVerifyOtp } from '../services/api'

// ─── OTP Step Enum
const STEP = { EMAIL: 'email', OTP: 'otp' }

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [tab, setTab]       = useState('student') // 'student' | 'admin'

  // Generic Auth state
  const [email, setEmail]   = useState('')
  const [otp, setOtp]       = useState('')
  const [step, setStep]     = useState(STEP.EMAIL)
  const [loading, setLoading] = useState(false)

  // ── Send OTP (Unified)
  const handleSendOtp = async (e) => {
    e.preventDefault()
    const targetEmail = email.trim()
    if (!targetEmail) return toast.error('Please enter your email.')
    
    setLoading(true)
    try {
      await apiSendOtp(targetEmail)
      toast.success('Login code sent! Check your inbox.')
      setStep(STEP.OTP)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Verify OTP (Unified)
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp.trim()) return toast.error('Enter the 6-digit code.')
    
    setLoading(true)
    try {
      const res = await apiVerifyOtp(email.trim(), otp.trim())
      const { token, user } = res.data
      
      // Store session
      login(token, user)
      
      toast.success(user.isAdmin ? 'Welcome, Administrator' : 'Login successful!')
      
      // Redirect based on role
      if (user.isAdmin) {
        navigate('/admin')
      } else if (tab === 'admin' && !user.isAdmin) {
        toast.error('This account does not have admin privileges.')
        navigate('/apply')
      } else {
        navigate('/apply')
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid or expired code.')
    } finally {
      setLoading(false)
    }
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
          <p className="text-white/50 mt-1 text-sm text-balance">Mathematics Department · IIT Ropar</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Tabs */}
          <div className="flex p-1 bg-white/5 rounded-xl mb-8" role="tablist">
            {[
              { key: 'student', label: 'Applicant Login', icon: GraduationCap },
              { key: 'admin',   label: 'Admin Login', icon: ShieldCheck },
            ].map(t => (
              <button
                key={t.key}
                role="tab"
                id={`tab-${t.key}`}
                aria-selected={tab === t.key}
                onClick={() => { 
                  if (step === STEP.EMAIL) {
                    setTab(t.key)
                  } else {
                    // If they already requested an OTP, don't let them swap tabs unless they reset
                    toast('Resetting login flow...')
                    setStep(STEP.EMAIL)
                    setTab(t.key)
                    setOtp('')
                  }
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  tab === t.key
                    ? 'bg-primary-gradient text-white shadow-glow-sm'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>

          <div className="animate-fade-in">
            {step === STEP.EMAIL ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label htmlFor="login-email" className="form-label">
                    {tab === 'admin' ? 'Admin Email Address' : 'Applicant Email Address'}
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      id="login-email"
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={tab === 'admin' ? 'admin@iitrpr.ac.in' : 'applicant@iitrpr.ac.in'}
                      className="form-input pl-10"
                    />
                  </div>
                  <p className="text-xs text-white/40 mt-2">
                    A secure login code will be sent to your {tab === 'admin' ? 'official email' : 'inbox'}.
                  </p>
                </div>

                <button
                  id="btn-send-otp"
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Sending Code...</>
                    : <><span>Send Code</span><ArrowRight size={16} /></>
                  }
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="bg-primary-600/10 border border-primary-500/20 rounded-xl p-3.5 text-sm text-white/70">
                  Code sent to <span className="text-primary-300 font-medium">{email}</span>
                </div>

                <div>
                  <label htmlFor="otp-input" className="form-label">Verification Code</label>
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
                      className="form-input pl-10 tracking-[0.5em] text-center text-xl font-mono"
                    />
                  </div>
                </div>

                <button
                  id="btn-verify-otp"
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Verifying...</>
                    : <><span>Verify & Sign In</span><ArrowRight size={16} /></>
                  }
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(STEP.EMAIL); setOtp('') }}
                  className="w-full text-center text-sm text-white/40 hover:text-white/70 transition-colors"
                >
                  ← Use a different email
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          © {new Date().getFullYear()} Mathematics Department · Indian Institute of Technology Ropar
        </p>
      </div>
    </div>
  )
}
