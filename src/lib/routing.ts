import type { CaseRow } from '../hooks/useCases'

export type RouteStop = {
  address: string
  caseId: string
  lat: number
  lng: number
}

export type OptimizedRoute = {
  distanceMeters: number
  durationSeconds: number
  geometry: Array<[number, number]>
  mode: 'optimized' | 'prioritized'
  stops: RouteStop[]
}

type OsrmTripResponse = {
  code: string
  trips?: Array<{
    distance: number
    duration: number
    geometry: {
      coordinates: Array<[number, number]>
    }
  }>
  waypoints?: Array<{
    waypoint_index: number
  }>
}

type OsrmRouteResponse = {
  code: string
  routes?: Array<{
    distance: number
    duration: number
    geometry: {
      coordinates: Array<[number, number]>
    }
  }>
}

export function casePriority(status: CaseRow['status']) {
  if (status === 'Haster') {
    return 0
  }

  if (status === 'Pågående') {
    return 1
  }

  if (status === 'Medium') {
    return 2
  }

  return 3
}

// Ruteoptimalisering: OSRM Trip sorterer stoppene og returnerer geometri, tid og distanse.
export async function optimizeRoute(stops: RouteStop[]): Promise<OptimizedRoute> {
  if (stops.length < 2) {
    throw new Error('Minst to stopp med koordinater trengs for å beregne rute.')
  }

  const coordinates = stops
    .map((stop) => `${stop.lng},${stop.lat}`)
    .join(';')
  const params = new URLSearchParams({
    geometries: 'geojson',
    overview: 'full',
    roundtrip: 'false',
    source: 'first',
  })

  const response = await fetch(
    `https://router.project-osrm.org/trip/v1/driving/${coordinates}?${params.toString()}`,
  )

  if (!response.ok) {
    throw new Error('Kunne ikke beregne optimal rute akkurat nå.')
  }

  const result = (await response.json()) as OsrmTripResponse
  const trip = result.trips?.[0]

  if (result.code !== 'Ok' || !trip) {
    throw new Error('Rutetjenesten fant ingen kjørbar rute.')
  }

  const orderedStops =
    result.waypoints
      ?.map((waypoint, index) => ({
        stop: stops[index],
        waypointIndex: waypoint.waypoint_index,
      }))
      .sort((left, right) => left.waypointIndex - right.waypointIndex)
      .map((item) => item.stop) ?? stops

  return {
    distanceMeters: trip.distance,
    durationSeconds: trip.duration,
    geometry: trip.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    mode: 'optimized',
    stops: orderedStops,
  }
}

// Prioritert rute: beholder stopp-rekkefølgen appen har valgt, for eksempel etter hastegrad.
export async function buildOrderedRoute(
  stops: RouteStop[],
): Promise<OptimizedRoute> {
  if (stops.length < 2) {
    throw new Error('Minst to stopp med koordinater trengs for å beregne rute.')
  }

  const coordinates = stops
    .map((stop) => `${stop.lng},${stop.lat}`)
    .join(';')
  const params = new URLSearchParams({
    geometries: 'geojson',
    overview: 'full',
  })

  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${coordinates}?${params.toString()}`,
  )

  if (!response.ok) {
    throw new Error('Kunne ikke beregne prioritert rute akkurat nå.')
  }

  const result = (await response.json()) as OsrmRouteResponse
  const route = result.routes?.[0]

  if (result.code !== 'Ok' || !route) {
    throw new Error('Rutetjenesten fant ingen kjørbar prioritert rute.')
  }

  return {
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    geometry: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    mode: 'prioritized',
    stops,
  }
}
