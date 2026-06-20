import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'
import {
  assertSupabaseConfigured,
  isSupabaseConfigured,
} from '../lib/supabaseConfig'

export function useProfile() {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    enabled: Boolean(userId) && isSupabaseConfigured,
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('Mangler innlogget bruker.')
      }

      assertSupabaseConfigured()

      const { data, error } = await supabase.rpc('ensure_user_profile')

      if (error) {
        throw error
      }

      return data
    },
  })
}
