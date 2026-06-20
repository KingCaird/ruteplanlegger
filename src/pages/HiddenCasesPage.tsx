import { useMemo } from 'react'
import { PageHeader } from '../components/PageHeader'
import { useRestoreCase } from '../hooks/useCaseMutations'
import { useCases } from '../hooks/useCases'
import { formatCaseId, formatOptional, getStatusTone } from '../lib/caseUi'
import { isSupabaseConfigured } from '../lib/supabaseConfig'

export function HiddenCasesPage() {
  const { data: cases = [], error, isLoading } = useCases()
  const restoreCase = useRestoreCase()
  const hiddenCases = useMemo(
    () => cases.filter((caseItem) => !caseItem.visible),
    [cases],
  )

  return (
    <section>
      <PageHeader
        description="Saker du har skjult fra hovedlisten og kartet."
        title="Skjulte saker"
      />
      {isLoading ? (
        <p className="case-card p-4 text-sm font-semibold text-slate-600">
          Laster skjulte saker...
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          Kunne ikke hente skjulte saker.
        </p>
      ) : null}
      {restoreCase.error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          Kunne ikke gjenopprette saken.
        </p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {hiddenCases.map((caseItem) => {
          const tone = getStatusTone(caseItem.status)

          return (
            <article className="case-card" key={caseItem.id}>
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
              </div>
              <div className="case-action-row !grid-cols-1">
                <button
                  className={`case-action ${tone.action}`}
                  disabled={restoreCase.isPending}
                  onClick={() => restoreCase.mutate(caseItem.id)}
                  type="button"
                >
                  Gjenopprett
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {!isLoading && hiddenCases.length === 0 ? (
        <p className="mt-4 case-card p-4 text-sm font-semibold text-slate-600">
          {isSupabaseConfigured
            ? 'Ingen skjulte saker.'
            : 'Legg inn Supabase-konfigurasjon for å hente skjulte saker.'}
        </p>
      ) : null}
    </section>
  )
}
