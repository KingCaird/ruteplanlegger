import { useMemo, useState } from 'react'
import { CaseDetailsPanel } from '../components/CaseDetailsPanel'
import { PageHeader } from '../components/PageHeader'
import { useHideCase, useUpdateCaseStatus } from '../hooks/useCaseMutations'
import { useCases, type CaseRow } from '../hooks/useCases'
import { formatCaseId, formatOptional, getStatusTone } from '../lib/caseUi'
import { openDrivingRoute, openMap } from '../lib/mapNavigation'
import { isSupabaseConfigured } from '../lib/supabaseConfig'
import type { CaseStatus } from '../types/database'

type CaseCardProps = {
  caseItem: CaseRow
  isHiding: boolean
  onDetails: (caseItem: CaseRow) => void
  onHide: (caseId: string) => void
}

function CaseCard({ caseItem, isHiding, onDetails, onHide }: CaseCardProps) {
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
    <article className="case-card">
      <div className="case-card-body">
        <div className={`case-status-pill ${tone.badge}`}>
          Status: {tone.label}
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
          <span className="case-icon">✉</span>
          <span>{formatOptional(caseItem.note, 'Ingen beskrivelse registrert.')}</span>
        </div>

        {routeError ? (
          <p className="my-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {routeError}
          </p>
        ) : null}
      </div>

      <div className="case-action-row">
        <button
          className={`case-action ${tone.action}`}
          disabled={isHiding}
          onClick={() => onHide(caseItem.id)}
          type="button"
        >
          Skjul
        </button>
        <button
          className={`case-action ${tone.action}`}
          onClick={() => openMap(caseItem)}
          type="button"
        >
          Naviger
        </button>
        <button
          className={`case-action ${tone.action}`}
          onClick={() => onDetails(caseItem)}
          type="button"
        >
          Detaljer
        </button>
        <button
          className={`case-action ${tone.action}`}
          onClick={handleStartRoute}
          type="button"
        >
          Start rute
        </button>
      </div>
    </article>
  )
}

export function CasesPage() {
  const { data: cases = [], error, isLoading } = useCases()
  const hideCase = useHideCase()
  const updateCaseStatus = useUpdateCaseStatus()
  const [selectedCase, setSelectedCase] = useState<CaseRow | null>(null)

  const visibleCases = useMemo(
    () => cases.filter((caseItem) => caseItem.visible),
    [cases],
  )

  const selectedVisibleCase = selectedCase
    ? visibleCases.find((caseItem) => caseItem.id === selectedCase.id) ?? null
    : null

  const handleStatusChange = (caseId: string, status: CaseStatus) => {
    updateCaseStatus.mutate({ caseId, status })
  }

  return (
    <section>
      <PageHeader
        description={`${visibleCases.length} aktive saker`}
        title="Saker"
      />

      {isLoading ? (
        <p className="case-card p-4 text-sm font-semibold text-slate-600">
          Laster saker...
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          Kunne ikke hente saker.
        </p>
      ) : null}
      {hideCase.error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          Kunne ikke skjule saken.
        </p>
      ) : null}
      {updateCaseStatus.error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          Kunne ikke endre status.
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {visibleCases.map((caseItem) => (
            <CaseCard
              caseItem={caseItem}
              isHiding={hideCase.isPending}
              key={caseItem.id}
              onDetails={setSelectedCase}
              onHide={(caseId) => hideCase.mutate(caseId)}
            />
          ))}
        </div>

        {selectedVisibleCase ? (
          <CaseDetailsPanel
            caseItem={selectedVisibleCase}
            isUpdating={updateCaseStatus.isPending}
            onBack={() => setSelectedCase(null)}
            onStatusChange={handleStatusChange}
          />
        ) : null}
      </div>

      {!isLoading && visibleCases.length === 0 ? (
        <p className="mt-4 case-card p-4 text-sm font-semibold text-slate-600">
          {isSupabaseConfigured
            ? 'Ingen aktive saker.'
            : 'Legg inn Supabase-konfigurasjon for å hente saker.'}
        </p>
      ) : null}
    </section>
  )
}
