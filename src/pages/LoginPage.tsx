import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ConfigNotice } from '../components/ConfigNotice'
import { OfflineNotice } from '../components/OfflineNotice'
import { PageHeader } from '../components/PageHeader'
import { PwaInstallBanner } from '../components/PwaInstallBanner'
import { useAuth } from '../hooks/useAuth'
import { setRememberSession, supabase } from '../lib/supabase'
import { isSupabaseConfigured } from '../lib/supabaseConfig'

type LoginLocationState = {
  from?: {
    pathname?: string
  }
}

const inputClass =
  'rounded-md border border-[#c8d6e2] bg-white px-3 py-2 font-semibold text-[#1f2f55] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

export function LoginPage() {
  const { session } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const locationState = location.state as LoginLocationState | null
  const redirectPath = locationState?.from?.pathname ?? '/saker'

  if (session) {
    return <Navigate replace to={redirectPath} />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    if (!isSupabaseConfigured) {
      setErrorMessage('Mangler Supabase-konfigurasjon i .env.')
      return
    }

    setIsSubmitting(true)
    setRememberSession(rememberMe)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    navigate(redirectPath, { replace: true })
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f9fc] p-6">
      <section className="case-card w-full max-w-md p-6">
        <PageHeader
          description="Logg inn med e-post og passord."
          title="Logg inn"
        />
        <ConfigNotice />
        <OfflineNotice />
        <PwaInstallBanner />

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-bold text-[#1f2f55]">
            E-post
            <input
              autoComplete="email"
              className={inputClass}
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-[#1f2f55]">
            Passord
            <input
              autoComplete="current-password"
              className={inputClass}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          <label className="flex items-center gap-3 text-sm font-bold text-[#1f2f55]">
            <input
              checked={rememberMe}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              onChange={(event) => setRememberMe(event.target.checked)}
              type="checkbox"
            />
            Husk meg
          </label>

          {errorMessage ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <button
            className="case-action case-action-blue"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Logger inn...' : 'Logg inn'}
          </button>
        </form>
      </section>
    </main>
  )
}
