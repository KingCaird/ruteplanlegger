import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute() {
  const { isLoading, session } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f9fc] p-6">
        <div className="case-card px-5 py-4 text-sm font-bold text-[#1f2f55]">
          Laster inn...
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return <Outlet />
}
