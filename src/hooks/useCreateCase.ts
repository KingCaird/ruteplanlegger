import { useMutation, useQueryClient } from '@tanstack/react-query'
import { historyMessages } from '../lib/historyMessages'
import { supabase } from '../lib/supabase'
import { assertSupabaseConfigured } from '../lib/supabaseConfig'
import type { CaseStatus, Database } from '../types/database'

type CaseInsert = Database['public']['Tables']['cases']['Insert']
type HistoryInsert = Database['public']['Tables']['history']['Insert']

export type CreateCaseInput = {
  address: string
  contact: string
  lat: number
  lng: number
  note: string
  phone: string
  serial: string
  status: CaseStatus
  userId: string
}

function emptyToNull(value: string) {
  const trimmedValue = value.trim()
  return trimmedValue.length > 0 ? trimmedValue : null
}

export function useCreateCase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateCaseInput) => {
      assertSupabaseConfigured()

      const casePayload: CaseInsert = {
        address: input.address.trim(),
        contact: emptyToNull(input.contact),
        lat: input.lat,
        lng: input.lng,
        note: emptyToNull(input.note),
        phone: emptyToNull(input.phone),
        serial: emptyToNull(input.serial),
        status: input.status,
        user_id: input.userId,
        visible: true,
      }

      const { data: createdCase, error: caseError } = await supabase
        .from('cases')
        .insert(casePayload)
        .select('id')
        .single()

      if (caseError) {
        throw caseError
      }

      const historyPayload: HistoryInsert = {
        case_id: createdCase.id,
        message: historyMessages.created,
      }

      const { error: historyError } = await supabase
        .from('history')
        .insert(historyPayload)

      if (historyError) {
        throw historyError
      }

      return createdCase
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cases'] })
      void queryClient.invalidateQueries({ queryKey: ['history'] })
    },
  })
}
