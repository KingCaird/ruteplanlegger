import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { formatOptional } from '../lib/caseUi'

export function ProfilePage() {
  const { session } = useAuth()
  const { data: profile, isLoading } = useProfile()

  return (
    <section>
      <PageHeader
        description="Brukerinformasjon og rolle for innlogget tekniker."
        title="Profil"
      />

      <article className="case-card max-w-2xl">
        <div className="case-card-body pb-6">
          {isLoading ? (
            <p className="text-sm font-semibold text-slate-600">Laster profil...</p>
          ) : (
            <>
              <div className="case-status-pill case-status-blue">Profil</div>
              <div className="case-field mt-3">
                <span className="case-icon">✉</span>
                <span>{formatOptional(profile?.email ?? session?.user.email)}</span>
              </div>
              <div className="case-field">
                <span className="case-icon">♙</span>
                <span className="capitalize">{formatOptional(profile?.role)}</span>
              </div>
              <div className="case-field">
                <span className="case-icon">•</span>
                <span>{formatOptional(session?.user.id)}</span>
              </div>
            </>
          )}
        </div>
      </article>
    </section>
  )
}
