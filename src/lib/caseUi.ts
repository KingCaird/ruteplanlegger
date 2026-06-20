import type { CaseStatus } from '../types/database'

type StatusTone = {
  action: string
  badge: string
  dot: string
  label: string
  marker: string
  statusClass: string
}

export const statusTones: Record<CaseStatus, StatusTone> = {
  Normal: {
    action: 'case-action-blue',
    badge: 'case-status-blue',
    dot: 'bg-blue-500',
    label: 'Normal',
    marker: '#1d7bf2',
    statusClass: 'text-blue-700',
  },
  Medium: {
    action: 'case-action-amber',
    badge: 'case-status-amber',
    dot: 'bg-amber-500',
    label: 'Medium',
    marker: '#d97706',
    statusClass: 'text-amber-700',
  },
  Haster: {
    action: 'case-action-red',
    badge: 'case-status-red',
    dot: 'bg-pink-600',
    label: 'Haster',
    marker: '#e11d48',
    statusClass: 'text-rose-700',
  },
  Pågående: {
    action: 'case-action-purple',
    badge: 'case-status-purple',
    dot: 'bg-purple-500',
    label: 'Pågående',
    marker: '#a855f7',
    statusClass: 'text-purple-700',
  },
  Ferdig: {
    action: 'case-action-blue',
    badge: 'case-status-green',
    dot: 'bg-green-500',
    label: 'Fullført',
    marker: '#2fb344',
    statusClass: 'text-green-700',
  },
}

export function getStatusTone(status: CaseStatus) {
  return statusTones[status]
}

export function formatCaseId(id: string) {
  return `#${id.slice(0, 10).toUpperCase()}`
}

export function formatOptional(value: string | null | undefined, fallback = '-') {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : fallback
}
