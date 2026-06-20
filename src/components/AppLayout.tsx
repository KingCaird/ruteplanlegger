import { NavLink, Outlet } from 'react-router-dom'
import { ConfigNotice } from './ConfigNotice'
import { OfflineNotice } from './OfflineNotice'
import { PwaInstallBanner } from './PwaInstallBanner'
import { Sidebar } from './Sidebar'

const topNavigation = [
  { label: 'Ny sak', to: '/ny-sak' },
  { label: 'Saker', to: '/saker' },
  { label: 'Kart', to: '/kart' },
  { label: 'Skjulte saker', to: '/skjulte-saker' },
  { label: 'Historikk', to: '/historikk' },
  { label: 'Profil', to: '/profil' },
]

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <Sidebar />

      <main className="min-h-screen w-full px-5 py-6 lg:pl-[284px]">
        <nav className="mb-8 flex flex-wrap gap-2 text-sm font-bold text-[#1f2f55]">
          {topNavigation.map((item) => (
            <NavLink
              className={({ isActive }) =>
                isActive
                  ? 'case-action px-4 py-2'
                  : 'rounded-md px-4 py-2 hover:bg-white hover:text-blue-700'
              }
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <ConfigNotice />
        <OfflineNotice />
        <PwaInstallBanner />

        <Outlet />
      </main>
    </div>
  )
}
