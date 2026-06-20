import type { CaseStatus } from '../types/database'

export const historyMessages = {
  created: 'Sak opprettet',
  hidden: 'Sak skjult',
  restored: 'Sak gjenopprettet',
  statusChanged: (status: CaseStatus) => `Status endret til ${status}`,
}
