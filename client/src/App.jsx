import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import ApplicationForm from './pages/ApplicationForm'
import AdminDashboard from './pages/AdminDashboard'
import LoadingScreen from './components/LoadingScreen'

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (requireAdmin && !isAdmin) return <Navigate to="/apply" replace />
  if (!requireAdmin && isAdmin) return <Navigate to="/admin" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to={isAdmin ? '/admin' : '/apply'} replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/apply" element={<ProtectedRoute><ApplicationForm /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
            },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
