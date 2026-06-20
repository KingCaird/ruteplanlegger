export type RouteDestination = {
  address: string
  lat?: number | null
  lng?: number | null
}

type Coordinates = {
  lat: number
  lng: number
}

function isApplePlatform() {
  const userAgent = window.navigator.userAgent.toLowerCase()
  return (
    userAgent.includes('iphone') ||
    userAgent.includes('ipad') ||
    userAgent.includes('macintosh')
  )
}

function formatDestination(destination: RouteDestination) {
  if (typeof destination.lat === 'number' && typeof destination.lng === 'number') {
    return `${destination.lat},${destination.lng}`
  }

  return destination.address
}

function buildDirectionsUrl(destination: RouteDestination, origin?: Coordinates) {
  if (isApplePlatform()) {
    const params = new URLSearchParams({
      daddr: formatDestination(destination),
      dirflg: 'd',
    })

    if (origin) {
      params.set('saddr', `${origin.lat},${origin.lng}`)
    }

    return `https://maps.apple.com/?${params.toString()}`
  }

  const params = new URLSearchParams({
    api: '1',
    destination: formatDestination(destination),
    travelmode: 'driving',
  })

  if (origin) {
    params.set('origin', `${origin.lat},${origin.lng}`)
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`
}

function getCurrentCoordinates() {
  return new Promise<Coordinates>((resolve, reject) => {
    if (!window.navigator.geolocation) {
      reject(new Error('Nettleseren støtter ikke posisjonering.'))
      return
    }

    window.navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      () => reject(new Error('Kunne ikke hente posisjonen din.')),
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  })
}

export async function openDrivingRoute(destination: RouteDestination) {
  const routeWindow = window.open('about:blank', '_blank')

  try {
    const origin = await getCurrentCoordinates()
    const url = buildDirectionsUrl(destination, origin)

    if (routeWindow) {
      routeWindow.opener = null
      routeWindow.location.href = url
      return
    }

    window.open(url, '_blank', 'noopener,noreferrer')
  } catch (error) {
    routeWindow?.close()
    throw error
  }
}

export function openMap(destination: RouteDestination) {
  const url = buildDirectionsUrl(destination)
  window.open(url, '_blank', 'noopener,noreferrer')
}
