import { createClient } from '@supabase/supabase-js'
import { appEnv } from './env'
import type { Database } from '../types/database'

const unconfiguredSupabaseUrl = 'https://not-configured.supabase.co'
const unconfiguredSupabaseAnonKey = 'not-configured-anon-key'
const rememberSessionKey = 'trondelag-ruteplanlegger:remember-session'

function getSessionStorage() {
  return window.localStorage.getItem(rememberSessionKey) === 'true'
    ? window.localStorage
    : window.sessionStorage
}

function shouldRememberSession() {
  return window.localStorage.getItem(rememberSessionKey) === 'true'
}

function removeSupabaseAuthTokens(storage: Storage) {
  Object.keys(storage)
    .filter((key) => key.startsWith('sb-') && key.endsWith('-auth-token'))
    .forEach((key) => storage.removeItem(key))
}

const authStorage = {
  getItem(key: string) {
    if (typeof window === 'undefined') {
      return null
    }

    if (shouldRememberSession()) {
      return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key)
    }

    return window.sessionStorage.getItem(key)
  },
  removeItem(key: string) {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.removeItem(key)
    window.sessionStorage.removeItem(key)
  },
  setItem(key: string, value: string) {
    if (typeof window === 'undefined') {
      return
    }

    getSessionStorage().setItem(key, value)
  },
}

export function setRememberSession(remember: boolean) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(rememberSessionKey, String(remember))

  if (remember) {
    removeSupabaseAuthTokens(window.sessionStorage)
  } else {
    removeSupabaseAuthTokens(window.localStorage)
  }
}

// Supabase-klienten samler auth, database og API-kall bak en typesikker inngang.
export const supabase = createClient<Database>(
  appEnv.supabaseUrl || unconfiguredSupabaseUrl,
  appEnv.supabaseAnonKey || unconfiguredSupabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
      storage: authStorage,
    },
  },
)
