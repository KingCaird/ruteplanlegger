type NominatimPlace = {
  display_name: string
  lat: string
  lon: string
}

export type GeocodedAddress = {
  displayName: string
  lat: number
  lng: number
}

// Geokoding: Nominatim oversetter en tekstadresse til koordinater før saken lagres.
export async function geocodeAddress(address: string): Promise<GeocodedAddress> {
  const params = new URLSearchParams({
    addressdetails: '1',
    countrycodes: 'no',
    format: 'json',
    'accept-language': 'nb',
    limit: '1',
    q: address,
  })

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
  )

  if (!response.ok) {
    throw new Error('Kunne ikke geokode adressen akkurat nå.')
  }

  const places = (await response.json()) as NominatimPlace[]
  const firstPlace = places[0]

  if (!firstPlace) {
    throw new Error('Fant ingen koordinater for adressen.')
  }

  const lat = Number(firstPlace.lat)
  const lng = Number(firstPlace.lon)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error('Fant ikke gyldige koordinater for adressen.')
  }

  return {
    displayName: firstPlace.display_name,
    lat,
    lng,
  }
}
