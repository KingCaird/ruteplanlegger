import { PageHeader } from '../components/PageHeader'
import { useHistory } from '../hooks/useHistory'
import { isSupabaseConfigured } from '../lib/supabaseConfig'

const dateFormatter = new Intl.DateTimeFormat('nb-NO', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function HistoryPage() {
  const { data: history = [], error, isLoading } = useHistory()

  return (
    <section>
      <PageHeader
        description="Alle hendelser sortert etter tidspunkt."
        title="Historikk"
      />
      {isLoading ? (
        <p className="case-card p-4 text-sm font-semibold text-slate-600">
          Laster historikk...
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          Kunne ikke hente historikk.
        </p>
      ) : null}

      <div className="grid gap-4">
        {history.map((event) => (
          <article className="case-card p-4" key={event.id}>
            <h3 className="font-bold text-[#1f2f55]">{event.message}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              {event.cases?.address ?? 'Ukjent adresse'}
            </p>
            <time
              className="mt-2 block text-xs font-bold uppercase text-slate-400"
              dateTime={event.timestamp}
            >
              {dateFormatter.format(new Date(event.timestamp))}
            </time>
          </article>
        ))}
      </div>

      {!isLoading && history.length === 0 ? (
        <p className="mt-4 case-card p-4 text-sm font-semibold text-slate-600">
          {isSupabaseConfigured
            ? 'Ingen historikk ennå.'
            : 'Legg inn Supabase-konfigurasjon for å hente historikk.'}
        </p>
      ) : null}
    </section>
  )
}
