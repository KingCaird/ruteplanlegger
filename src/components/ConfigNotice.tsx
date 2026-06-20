import { isSupabaseConfigured } from '../lib/supabaseConfig'

export function ConfigNotice() {
  if (isSupabaseConfigured) {
    return null
  }

  return (
    <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 shadow-sm">
      Mangler Supabase-konfigurasjon. Legg inn verdier i .env før innlogging og
      databasefunksjoner kan brukes.
    </p>
  )
}
