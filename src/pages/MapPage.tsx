import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { CaseDetailsPanel } from '../components/CaseDetailsPanel'
import { PageHeader } from '../components/PageHeader'
import { useUpdateCaseStatus } from '../hooks/useCaseMutations'
import { useCases, type CaseRow } from '../hooks/useCases'
import { formatCaseId, formatOptional, getStatusTone } from '../lib/caseUi'
import { openDrivingRoute, openMap } from '../lib/mapNavigation'
import { buildOrderedRoute, casePriority, optimizeRoute } from '../lib/routing'
import { isSupabaseConfigured } from '../lib/supabaseConfig'
import type { OptimizedRoute, RouteStop } from '../lib/routing'
import type { CaseStatus } from '../types/database'

const trondheimCenter: [number, number] = [63.4305, 10.3951]
const userIcon = L.divIcon({
  className: 'user-map-marker',
  html: '<span></span>',
  iconAnchor: [12, 12],
  iconSize: [24, 24],
  popupAnchor: [0, -12],
})

function formatDistance(meters: number) {
  return `${(meters / 1000).toFixed(1)} km`
}

function formatDuration(seconds: number) {
  const minutes = Math.round(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) {
    return `${remainingMinutes} min`
  }

  return `${hours} t ${remainingMinutes} min`
}

function createCaseIcon(caseItem: CaseRow) {
  const tone = getStatusTone(caseItem.status)

  return L.divIcon({
    className: 'case-map-marker',
    html: `<span style="background:${tone.marker}"></span>`,
    iconAnchor: [14, 28],
    iconSize: [28, 28],
    popupAnchor: [0, -24],
  })
}

function MapViewportController({
  cases,
  position,
}: {
  cases: CaseRow[]
  position: RouteStop | null
}) {
  const map = useMap()
  const fittedCasesKey = useRef('')
  const positionKey = position ? `${position.lat}:${position.lng}` : ''
  const casesKey = cases
    .map((caseItem) => `${caseItem.id}:${caseItem.lat}:${caseItem.lng}`)
    .join('|')

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => map.invalidateSize())
    return () => window.cancelAnimationFrame(frame)
  }, [map])

  useEffect(() => {
    if (position || cases.length === 0 || fittedCasesKey.current === casesKey) {
      return
    }

    fittedCasesKey.current = casesKey
    const coordinates = cases.map(
      (caseItem) => [caseItem.lat ?? trondheimCenter[0], caseItem.lng ?? trondheimCenter[1]] as [
        number,
        number,
      ],
    )

    if (coordinates.length === 1) {
      map.setView(coordinates[0], 12, { animate: true })
      return
    }

    map.fitBounds(L.latLngBounds(coordinates), {
      animate: true,
      maxZoom: 13,
      padding: [48, 48],
    })
  }, [cases, casesKey, map, position])

  useEffect(() => {
    if (!position) {
      return
    }

    map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), 14), {
      duration: 0.8,
    })
  }, [map, position, positionKey])

  return null
}

export function MapPage() {
  const { data: cases = [], error, isLoading } = useCases()
  const updateCaseStatus = useUpdateCaseStatus()
  const [currentPosition, setCurrentPosition] = useState<RouteStop | null>(null)
  const [prioritizeUrgency, setPrioritizeUrgency] = useState(false)
  const [route, setRoute] = useState<OptimizedRoute | null>(null)
  const [showStops, setShowStops] = useState(false)
  const [routeError, setRouteError] = useState('')
  const [isRouting, setIsRouting] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [selectedCase, setSelectedCase] = useState<CaseRow | null>(null)

  const visibleCases = useMemo(
    () => cases.filter((caseItem) => caseItem.visible),
    [cases],
  )

  const mapCases = useMemo(
    () =>
      visibleCases.filter(
        (caseItem) =>
          typeof caseItem.lat === 'number' && typeof caseItem.lng === 'number',
      ),
    [visibleCases],
  )

  const casesWithoutCoordinates = visibleCases.length - mapCases.length

  const routeStops = useMemo(() => {
    const statusByCaseId = new Map(
      mapCases.map((caseItem) => [caseItem.id, caseItem.status]),
    )
    const caseStops: RouteStop[] = mapCases.map((caseItem) => ({
      address: caseItem.address,
      caseId: caseItem.id,
      lat: caseItem.lat ?? 0,
      lng: caseItem.lng ?? 0,
    }))
    const prioritizedStops = prioritizeUrgency
      ? [...caseStops].sort((left, right) => {
          const leftPriority = casePriority(statusByCaseId.get(left.caseId) ?? 'Normal')
          const rightPriority = casePriority(statusByCaseId.get(right.caseId) ?? 'Normal')
          return leftPriority - rightPriority
        })
      : caseStops

    return currentPosition ? [currentPosition, ...prioritizedStops] : prioritizedStops
  }, [currentPosition, mapCases, prioritizeUrgency])

  const handleUseCurrentPosition = () => {
    setRouteError('')

    if (!navigator.geolocation) {
      setRouteError('Nettleseren støtter ikke posisjonering.')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false)
        setCurrentPosition({
          address: 'Min posisjon',
          caseId: 'current-position',
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      () => {
        setIsLocating(false)
        setRouteError('Kunne ikke hente posisjonen din.')
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  const handleOptimizeRoute = async () => {
    setRouteError('')
    setIsRouting(true)

    try {
      const optimizedRoute = prioritizeUrgency
        ? await buildOrderedRoute(routeStops)
        : await optimizeRoute(routeStops)
      setRoute(optimizedRoute)
      setShowStops(false)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Kunne ikke beregne ruten.'
      setRouteError(message)
    } finally {
      setIsRouting(false)
    }
  }

  const handleStartCaseRoute = async (caseItem: CaseRow) => {
    setRouteError('')

    try {
      await openDrivingRoute(caseItem)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Kunne ikke starte kjøreruten.'
      setRouteError(message)
    }
  }

  const handleStatusChange = (caseId: string, status: CaseStatus) => {
    updateCaseStatus.mutate({ caseId, status })
  }

  return (
    <section>
      <PageHeader
        description={`${mapCases.length} saker på kartet`}
        title="Kart"
      />

      <div className="mb-5 flex flex-wrap items-center gap-3 case-card p-4">
        <button
          className="case-action case-action-blue px-4"
          disabled={isLocating}
          onClick={handleUseCurrentPosition}
          type="button"
        >
          {isLocating ? 'Henter posisjon...' : 'Bruk min posisjon'}
        </button>
        <label className="flex items-center gap-3 text-sm font-bold text-[#1f2f55]">
          <input
            checked={prioritizeUrgency}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            onChange={(event) => setPrioritizeUrgency(event.target.checked)}
            type="checkbox"
          />
          Prioriter etter hastegrad
        </label>
        <button
          className="case-action case-action-blue px-4"
          disabled={isRouting || routeStops.length < 2}
          onClick={handleOptimizeRoute}
          type="button"
        >
          {isRouting ? 'Beregner...' : 'Beregn optimal rute'}
        </button>
      </div>

      {isLoading ? (
        <p className="mb-4 case-card p-4 text-sm font-semibold text-slate-600">
          Laster kartdata...
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          Kunne ikke hente kartdata.
        </p>
      ) : null}
      {!isSupabaseConfigured ? (
        <p className="mb-4 case-card p-4 text-sm font-semibold text-slate-600">
          Legg inn Supabase-konfigurasjon for å hente saker på kartet.
        </p>
      ) : null}
      {casesWithoutCoordinates > 0 ? (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          {casesWithoutCoordinates} aktive saker mangler koordinater og kan ikke
          vises som markør ennå.
        </p>
      ) : null}
      {routeError ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {routeError}
        </p>
      ) : null}

      <div className="case-card">
        <MapContainer
          center={trondheimCenter}
          className="h-[640px] min-h-[420px] w-full"
          scrollWheelZoom
          zoom={8}
        >
          <MapViewportController cases={mapCases} position={currentPosition} />
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MarkerClusterGroup chunkedLoading showCoverageOnHover={false}>
            {currentPosition ? (
              <Marker icon={userIcon} position={[currentPosition.lat, currentPosition.lng]}>
                <Popup>Min posisjon</Popup>
              </Marker>
            ) : null}
            {mapCases.map((caseItem) => {
              const tone = getStatusTone(caseItem.status)

              return (
                <Marker
                  icon={createCaseIcon(caseItem)}
                  key={caseItem.id}
                  position={[caseItem.lat ?? 0, caseItem.lng ?? 0]}
                >
                  <Popup>
                    <div className="grid min-w-64 gap-2 text-sm text-[#1f2f55]">
                      <div className={`case-status-pill ${tone.badge} !min-w-0 !px-4 !text-sm`}>
                        Status: {tone.label}
                      </div>
                      <strong>{formatCaseId(caseItem.id)}</strong>
                      <span>Adresse: {caseItem.address}</span>
                      <span>
                        Kontakt:{' '}
                        {formatOptional(caseItem.contact, 'Ingen kontaktperson')}
                      </span>
                      <span>
                        Beskrivelse:{' '}
                        {formatOptional(
                          caseItem.note,
                          'Ingen beskrivelse registrert.',
                        )}
                      </span>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        <button
                          className={`case-action ${tone.action} !min-h-8 text-xs`}
                          onClick={() => openMap(caseItem)}
                          type="button"
                        >
                          Naviger
                        </button>
                        <button
                          className={`case-action ${tone.action} !min-h-8 text-xs`}
                          onClick={() => setSelectedCase(caseItem)}
                          type="button"
                        >
                          Detaljer
                        </button>
                        <button
                          className={`case-action ${tone.action} !min-h-8 text-xs`}
                          onClick={() => void handleStartCaseRoute(caseItem)}
                          type="button"
                        >
                          Velg rute
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MarkerClusterGroup>
          {route ? <Polyline color="#1f3a5f" positions={route.geometry} /> : null}
        </MapContainer>
      </div>

      {isSupabaseConfigured && !isLoading && mapCases.length === 0 ? (
        <p className="mt-4 case-card p-4 text-sm font-semibold text-slate-600">
          Ingen aktive saker med koordinater.
        </p>
      ) : null}

      {route ? (
        <div className="mt-4 case-card p-4">
          <p className="font-bold text-[#1f2f55]">
            Total tid: {formatDuration(route.durationSeconds)} · Distanse:{' '}
            {formatDistance(route.distanceMeters)}
          </p>
          <span className="mt-1 block text-sm font-medium text-slate-600">
            {route.mode === 'prioritized'
              ? 'Ruten er prioritert etter hastegrad.'
              : 'Ruten er optimalisert for kjøring.'}
          </span>
          <button
            className="case-action case-action-blue mt-4 px-4"
            onClick={() => setShowStops((current) => !current)}
            type="button"
          >
            {showStops ? 'Skjul stopp' : 'Vis stopp'}
          </button>
          {showStops ? (
            <ol className="mt-4 grid gap-2 text-sm text-[#1f2f55]">
              {route.stops.map((stop) => (
                <li key={stop.caseId}>{stop.address}</li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}

      {selectedCase ? (
        <div className="mt-6 max-w-2xl">
          <CaseDetailsPanel
            caseItem={selectedCase}
            isUpdating={updateCaseStatus.isPending}
            onBack={() => setSelectedCase(null)}
            onStatusChange={handleStatusChange}
          />
        </div>
      ) : null}
    </section>
  )
}
