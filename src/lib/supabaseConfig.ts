import { appEnv } from './env'

export const isSupabaseConfigured =
  appEnv.supabaseUrl.length > 0 && appEnv.supabaseAnonKey.length > 0

export function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error('Mangler Supabase-konfigurasjon i .env.')
  }
}
