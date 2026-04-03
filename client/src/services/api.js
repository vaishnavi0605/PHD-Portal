import axios from 'axios'
import { supabase } from './supabaseClient'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token from Supabase session on every request
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  if (data?.session?.access_token) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`
  }
  return config
})

// Application endpoints
export const submitApplication = (payload) =>
  api.post('/application', payload)

export const getMyApplication = () =>
  api.get('/application/me')

// Admin endpoints
export const checkIsAdmin = () =>
  api.get('/is-admin')

export const getAllApplications = (filters = {}) =>
  api.get('/applications', { params: filters })

export const exportApplications = async (filters = {}) => {
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token

  const response = await fetch(
    `${BASE_URL}/api/export?${new URLSearchParams(filters)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )

  if (!response.ok) throw new Error('Export failed')

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `phd_applications_${Date.now()}.xlsx`
  a.click()
  window.URL.revokeObjectURL(url)
}

export default api
