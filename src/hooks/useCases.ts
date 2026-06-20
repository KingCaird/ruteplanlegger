import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { readLocalCache, writeLocalCache } from '../lib/localCache'
import { supabase } from '../lib/supabase'
import {
  assertSupabaseConfigured,
  isSupabaseConfigured,
} from '../lib/supabaseConfig'
import type { Database } from '../types/database'

export type CaseRow = Database['public']['Tables']['cases']['Row']

export function useCases() {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    enabled: isSupabaseConfigured && Boolean(userId),
    queryKey: ['cases', userId],
    queryFn: async () => {
      assertSupabaseConfigured()

      if (!userId) {
        throw new Error('Mangler innlogget bruker.')
      }

      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        const cachedCases = readLocalCache<CaseRow[]>('cases', userId)

        if (cachedCases) {
          return cachedCases
        }

        throw error
      }

      writeLocalCache('cases', userId, data)
      return data
    },
  })
}
