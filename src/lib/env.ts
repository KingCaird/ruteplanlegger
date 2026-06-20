type AppEnv = {
  supabaseAnonKey: string
  supabaseUrl: string
}

export const appEnv: AppEnv = {
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
}
