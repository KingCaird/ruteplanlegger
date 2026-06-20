import { useState } from 'react'
import { caseStatuses } from '../lib/caseStatus'
import { formatCaseId, formatOptional, getStatusTone } from '../lib/caseUi'
import { openDrivingRoute, openMap } from '../lib/mapNavigation'
import type { CaseRow } from '../hooks/useCases'
import type { CaseStatus } from '../types/database'

type CaseDetailsPanelProps = {
  caseItem: CaseRow
  isUpdating?: boolean
  onBack: () => void
  onStatusChange?: (caseId: string, status: CaseStatus) => void
}

export function CaseDetailsPanel({
  caseItem,
  isUpdating = false,
  onBack,
  onStatusChange,
}: CaseDetailsPanelProps) {
  const [routeError, setRouteError] = useState('')
  const tone = getStatusTone(caseItem.status)

  const handleStartRoute = async () => {
    setRouteError('')

    try {
      await openDrivingRoute(caseItem)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Kunne ikke starte kjøreruten.'
      setRouteError(message)
    }
  }

  return (
    <aside className="case-card">
      <div className="case-card-body pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className={`case-status-pill ${tone.badge}`}>
            Status: {tone.label}
          </div>
          <button className={`case-action ${tone.action} px-4`} onClick={onBack} type="button">
            Tilbake
          </button>
        </div>

        <div className="case-field mt-3">
          <span className={`mt-1 h-3 w-3 rounded-full ${tone.dot}`} />
          <span>{formatCaseId(caseItem.id)}</span>
        </div>
        <div className="case-field case-field-strong">
          <span className="case-icon">⌖</span>
          <span>{caseItem.address}</span>
        </div>
        <div className="case-field">
          <span className="case-icon">♙</span>
          <span>{formatOptional(caseItem.contact, 'Ingen kontaktperson')}</span>
        </div>
        <div className="case-field">
          <span className="case-icon">☎</span>
          <span>{formatOptional(caseItem.phone)}</span>
        </div>
        <div className="case-field">
          <span className="case-icon">#</span>
          <span>{formatOptional(caseItem.serial)}</span>
        </div>
        <div className="case-field">
          <span className="case-icon">✉</span>
          <span>{formatOptional(caseItem.note, 'Ingen beskrivelse registrert.')}</span>
        </div>

        {onStatusChange ? (
          <label className="mt-4 grid gap-2 text-sm font-bold text-[#1f2f55]">
            Endre status
            <select
              className="rounded-md border border-[#c8d6e2] bg-white px-3 py-2 font-semibold text-[#1f2f55] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              disabled={isUpdating}
              onChange={(event) =>
                onStatusChange(caseItem.id, event.target.value as CaseStatus)
              }
              value={caseItem.status}
            >
              {caseStatuses.map((status) => (
                <option key={status} value={status}>
                  {getStatusTone(status).label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {routeError ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {routeError}
          </p>
        ) : null}
      </div>

      <div className="case-action-row !grid-cols-3">
        <button className={`case-action ${tone.action}`} onClick={() => openMap(caseItem)} type="button">
          Naviger
        </button>
        <button className={`case-action ${tone.action}`} onClick={handleStartRoute} type="button">
          Start rute til denne saken
        </button>
        <button className={`case-action ${tone.action}`} onClick={onBack} type="button">
          Tilbake
        </button>
      </div>
    </aside>
  )
}
