import { usePwaInstallPrompt } from '../hooks/usePwaInstallPrompt'

export function PwaInstallBanner() {
  const { canInstall, install } = usePwaInstallPrompt()

  if (!canInstall) {
    return null
  }

  return (
    <div className="mb-4 case-card flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-[#1f2f55]">
      <span>Installer appen for rask tilgang på mobil og PC.</span>
      <button className="case-action case-action-blue px-4" onClick={install} type="button">
        Installer
      </button>
    </div>
  )
}
