import { useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthContext } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { isSupabaseConfigured } from '../lib/supabaseConfig'

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    let isMounted = true

    if (!isSupabaseConfigured) {
      return
    }

    // Auth-flow: hent aktiv session ved oppstart og lytt på inn/utlogging fra Supabase.
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) {
          return
        }

        setSession(data.session)
        setIsLoading(false)
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        setSession(null)
        setIsLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      isLoading,
      session,
    }),
    [isLoading, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
