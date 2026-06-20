export type Json =
  | boolean
  | null
  | number
  | string
  | { [key: string]: Json | undefined }
  | Json[]

export type CaseStatus = 'Normal' | 'Medium' | 'Haster' | 'Pågående' | 'Ferdig'
export type UserRole = 'admin' | 'tekniker'

export type Database = {
  public: {
    Tables: {
      cases: {
        Row: {
          address: string
          contact: string | null
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          note: string | null
          phone: string | null
          serial: string | null
          status: CaseStatus
          updated_at: string
          user_id: string
          visible: boolean
        }
        Insert: {
          address: string
          contact?: string | null
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          note?: string | null
          phone?: string | null
          serial?: string | null
          status?: CaseStatus
          updated_at?: string
          user_id: string
          visible?: boolean
        }
        Update: {
          address?: string
          contact?: string | null
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          note?: string | null
          phone?: string | null
          serial?: string | null
          status?: CaseStatus
          updated_at?: string
          user_id?: string
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'cases_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      history: {
        Row: {
          case_id: string
          id: string
          message: string
          timestamp: string
        }
        Insert: {
          case_id: string
          id?: string
          message: string
          timestamp?: string
        }
        Update: {
          case_id?: string
          id?: string
          message?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: 'history_case_id_fkey'
            columns: ['case_id']
            isOneToOne: false
            referencedRelation: 'cases'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          email: string
          id: string
          role: UserRole
        }
        Insert: {
          email: string
          id: string
          role?: UserRole
        }
        Update: {
          email?: string
          id?: string
          role?: UserRole
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      ensure_user_profile: {
        Args: Record<string, never>
        Returns: Database['public']['Tables']['users']['Row']
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
