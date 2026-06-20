import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { clearUserLocalCache } from '../lib/localCache'
import { supabase } from '../lib/supabase'

const navigationItems = [
  { label: 'Ny sak', to: '/ny-sak' },
  { label: 'Saker', to: '/saker' },
  { label: 'Kart', to: '/kart' },
  { label: 'Skjulte saker', to: '/skjulte-saker' },
  { label: 'Historikk', to: '/historikk' },
  { label: 'Profil', to: '/profil' },
]

export function Sidebar() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { data: profile, isLoading } = useProfile()

  const handleLogout = async () => {
    if (session?.user.id) {
      clearUserLocalCache(session.user.id)
    }

    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col justify-between bg-[#1f3a5f] p-6 text-white shadow-xl lg:flex">
      <div>
        <h1 className="mb-8 text-xl font-bold leading-tight">
          Trøndelag Ruteplanlegger
        </h1>

        <nav className="flex flex-col gap-2">
          {navigationItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `block rounded-md px-4 py-2 text-sm font-semibold ${
                  isActive
                    ? 'bg-[#2f527f] text-white'
                    : 'text-[#e9eef5] hover:bg-[#2f527f]'
                }`
              }
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-3">
        {profile ? (
          <p className="text-sm text-[#dbe7f4]">
            {profile.email}
            <span className="block font-bold capitalize text-white">
              {profile.role}
            </span>
          </p>
        ) : isLoading ? (
          <p className="text-sm text-[#dbe7f4]">Laster profil...</p>
        ) : null}

        <button
          className="rounded-md border border-[#c8d5e6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2f527f]"
          onClick={handleLogout}
          type="button"
        >
          Logg ut
        </button>
      </div>
    </aside>
  )
}
