import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  GraduationCap, LogOut, Download, Users, Filter,
  TrendingUp, Award, CheckSquare, Loader2, RefreshCw,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getAllApplications, exportApplications } from '../services/api'
import FilterBar from '../components/FilterBar'
import ApplicantsTable from '../components/Table'

const DEFAULT_FILTERS = { minCGPA: '', category: '', gateScore: '', nbhmEligible: '', sortBy: '', order: 'desc' }

export default function AdminDashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading]           = useState(true)
  const [exporting, setExporting]       = useState(false)
  const [filters, setFilters]           = useState(DEFAULT_FILTERS)
  const [stats, setStats]               = useState({ total: 0, nbhm: 0, avgCgpa: 0 })

  const fetchApplications = useCallback(async (f = filters) => {
    setLoading(true)
    try {
      const params = {}
      if (f.minCGPA)     params.minCGPA     = f.minCGPA
      if (f.category)    params.category    = f.category
      if (f.gateScore)   params.gateScore   = f.gateScore
      if (f.nbhmEligible !== '') params.nbhmEligible = f.nbhmEligible
      if (f.sortBy)      params.sortBy      = f.sortBy
      if (f.order)       params.order       = f.order

      const res = await getAllApplications(params)
      const data = res.data.applications || []
      setApplications(data)

      // Compute stats
      const nbhm = data.filter(a => a.nbhm_eligible).length
      const avgCgpa = data.length
        ? (data.reduce((s, a) => s + (a.cgpa || 0), 0) / data.length).toFixed(2)
        : 0
      setStats({ total: data.length, nbhm, avgCgpa })
    } catch {
      toast.error('Failed to load applications.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchApplications(filters) }, [])

  const handleFilterChange = (newFilters) => setFilters(newFilters)

  const handleApplyFilters = () => fetchApplications(filters)

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS)
    fetchApplications(DEFAULT_FILTERS)
  }

  const handleSort = (col) => {
    const newOrder = filters.sortBy === col && filters.order === 'desc' ? 'asc' : 'desc'
    const newFilters = { ...filters, sortBy: col, order: newOrder }
    setFilters(newFilters)
    fetchApplications(newFilters)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = {}
      if (filters.minCGPA)     params.minCGPA     = filters.minCGPA
      if (filters.category)    params.category    = filters.category
      if (filters.gateScore)   params.gateScore   = filters.gateScore
      if (filters.nbhmEligible !== '') params.nbhmEligible = filters.nbhmEligible
      if (filters.sortBy)      params.sortBy      = filters.sortBy
      if (filters.order)       params.order       = filters.order
      await exportApplications(params)
      toast.success('Excel file downloaded!')
    } catch {
      toast.error('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-hero-gradient">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Admin Dashboard</p>
              <p className="text-xs text-white/40">PhD Admissions · Mathematics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 hidden sm:block">{user?.email}</span>
            <button
              id="btn-admin-signout"
              onClick={handleSignOut}
              className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Page Title */}
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold font-heading text-white">Applicants Overview</h1>
          <p className="text-white/50 mt-1">Review, filter, and export PhD applicant data.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up">
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center">
                <Users size={16} className="text-primary-400" />
              </div>
              <span className="text-white/50 text-sm">Total Applicants</span>
            </div>
            <p className="text-3xl font-bold font-heading text-white">
              {loading ? '—' : stats.total}
            </p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-accent-500/20 flex items-center justify-center">
                <TrendingUp size={16} className="text-accent-400" />
              </div>
              <span className="text-white/50 text-sm">Average CGPA</span>
            </div>
            <p className="text-3xl font-bold font-heading text-white">
              {loading ? '—' : stats.avgCgpa}
            </p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-success-500/20 flex items-center justify-center">
                <CheckSquare size={16} className="text-success-500" />
              </div>
              <span className="text-white/50 text-sm">NBHM Eligible</span>
            </div>
            <p className="text-3xl font-bold font-heading text-white">
              {loading ? '—' : stats.nbhm}
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="animate-slide-up">
          <FilterBar
            filters={filters}
            onChange={(f) => { handleFilterChange(f) }}
            onReset={handleReset}
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-white/40">
              {!loading && `${applications.length} applicant${applications.length !== 1 ? 's' : ''} found`}
            </span>
            <div className="flex gap-2">
              <button
                id="btn-apply-filters"
                onClick={handleApplyFilters}
                className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
              >
                <Filter size={14} /> Apply Filters
              </button>
              <button
                id="btn-export-excel"
                onClick={handleExport}
                disabled={exporting || loading || applications.length === 0}
                className="btn-success flex items-center gap-2"
              >
                {exporting
                  ? <><Loader2 size={14} className="animate-spin" /> Exporting...</>
                  : <><Download size={14} /> Export Excel</>
                }
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="animate-slide-up">
          <ApplicantsTable
            data={applications}
            loading={loading}
            sortBy={filters.sortBy}
            order={filters.order}
            onSort={handleSort}
          />
        </div>
      </main>
    </div>
  )
}
