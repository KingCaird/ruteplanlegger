import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'

const CasesPage = lazy(() =>
  import('./pages/CasesPage').then((module) => ({ default: module.CasesPage })),
)
const HiddenCasesPage = lazy(() =>
  import('./pages/HiddenCasesPage').then((module) => ({
    default: module.HiddenCasesPage,
  })),
)
const HistoryPage = lazy(() =>
  import('./pages/HistoryPage').then((module) => ({ default: module.HistoryPage })),
)
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })),
)
const MapPage = lazy(() =>
  import('./pages/MapPage').then((module) => ({ default: module.MapPage })),
)
const NewCasePage = lazy(() =>
  import('./pages/NewCasePage').then((module) => ({ default: module.NewCasePage })),
)
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })),
)

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-[#f7f9fc] p-6">
          <div className="case-card px-5 py-4 text-sm font-bold text-[#1f2f55]">
            Laster inn...
          </div>
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/saker" replace />} />
            <Route path="/ny-sak" element={<NewCasePage />} />
            <Route path="/saker" element={<CasesPage />} />
            <Route path="/kart" element={<MapPage />} />
            <Route path="/skjulte-saker" element={<HiddenCasesPage />} />
            <Route path="/historikk" element={<HistoryPage />} />
            <Route path="/profil" element={<ProfilePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/saker" replace />} />
      </Routes>
    </Suspense>
  )
}
