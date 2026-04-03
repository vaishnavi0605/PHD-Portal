import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { checkIsAdmin } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null)
  const [isAdmin, setIsAdmin]   = useState(false)
  const [loading, setLoading]   = useState(true)

  const checkAdmin = async () => {
    try {
      const res = await checkIsAdmin()
      setIsAdmin(res.data.isAdmin === true)
    } catch {
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) checkAdmin().finally(() => setLoading(false))
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setLoading(true)
        setUser(session.user)
        checkAdmin().finally(() => setLoading(false))
      } else {
        setUser(null)
        setIsAdmin(false)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
