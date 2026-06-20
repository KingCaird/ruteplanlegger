import { useMutation, useQueryClient } from '@tanstack/react-query'
import { historyMessages } from '../lib/historyMessages'
import { supabase } from '../lib/supabase'
import { assertSupabaseConfigured } from '../lib/supabaseConfig'
import type { CaseStatus } from '../types/database'

export function useUpdateCaseStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ caseId, status }: { caseId: string; status: CaseStatus }) => {
      assertSupabaseConfigured()

      const { error } = await supabase
        .from('cases')
        .update({ status })
        .eq('id', caseId)

      if (error) {
        throw error
      }

      const { error: historyError } = await supabase.from('history').insert({
        case_id: caseId,
        message: historyMessages.statusChanged(status),
      })

      if (historyError) {
        throw historyError
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cases'] })
      void queryClient.invalidateQueries({ queryKey: ['history'] })
    },
  })
}

export function useHideCase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (caseId: string) => {
      assertSupabaseConfigured()

      const { error: caseError } = await supabase
        .from('cases')
        .update({ visible: false })
        .eq('id', caseId)

      if (caseError) {
        throw caseError
      }

      const { error: historyError } = await supabase.from('history').insert({
        case_id: caseId,
        message: historyMessages.hidden,
      })

      if (historyError) {
        throw historyError
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cases'] })
      void queryClient.invalidateQueries({ queryKey: ['history'] })
    },
  })
}

export function useRestoreCase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (caseId: string) => {
      assertSupabaseConfigured()

      const { error: caseError } = await supabase
        .from('cases')
        .update({ visible: true })
        .eq('id', caseId)

      if (caseError) {
        throw caseError
      }

      const { error: historyError } = await supabase.from('history').insert({
        case_id: caseId,
        message: historyMessages.restored,
      })

      if (historyError) {
        throw historyError
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cases'] })
      void queryClient.invalidateQueries({ queryKey: ['history'] })
    },
  })
}
