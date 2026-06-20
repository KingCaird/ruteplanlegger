import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { readLocalCache, writeLocalCache } from '../lib/localCache'
import { supabase } from '../lib/supabase'
import {
  assertSupabaseConfigured,
  isSupabaseConfigured,
} from '../lib/supabaseConfig'
import type { Database } from '../types/database'

type HistoryRow = Database['public']['Tables']['history']['Row']

export type HistoryEvent = HistoryRow & {
  cases: {
    address: string
  } | null
}

export function useHistory() {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    enabled: isSupabaseConfigured && Boolean(userId),
    queryKey: ['history', userId],
    queryFn: async () => {
      assertSupabaseConfigured()

      if (!userId) {
        throw new Error('Mangler innlogget bruker.')
      }

      const { data, error } = await supabase
        .from('history')
        .select('id, case_id, message, timestamp, cases(address)')
        .order('timestamp', { ascending: false })

      if (error) {
        const cachedHistory = readLocalCache<HistoryEvent[]>('history', userId)

        if (cachedHistory) {
          return cachedHistory
        }

        throw error
      }

      const historyEvents = data as HistoryEvent[]
      writeLocalCache('history', userId, historyEvents)
      return historyEvents
    },
  })
}
