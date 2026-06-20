import { useNetworkStatus } from '../hooks/useNetworkStatus'

export function OfflineNotice() {
  const isOnline = useNetworkStatus()

  if (isOnline) {
    return null
  }

  return (
    <p className="mb-4 case-card px-4 py-3 text-sm font-bold text-[#1f2f55]">
      Du er offline. Appen kan åpnes, men nye endringer synkroniseres først når
      nettverket er tilbake.
    </p>
  )
}
