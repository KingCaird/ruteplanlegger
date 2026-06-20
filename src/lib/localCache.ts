type CacheEnvelope<T> = {
  data: T
  savedAt: string
}

function getCacheKey(scope: string, userId: string) {
  return `trondelag-ruteplanlegger:${scope}:${userId}`
}

export function readLocalCache<T>(scope: string, userId: string): T | null {
  try {
    const rawValue = window.localStorage.getItem(getCacheKey(scope, userId))

    if (!rawValue) {
      return null
    }

    const parsedValue = JSON.parse(rawValue) as CacheEnvelope<T>
    return parsedValue.data
  } catch {
    return null
  }
}

export function writeLocalCache<T>(scope: string, userId: string, data: T) {
  const cacheValue: CacheEnvelope<T> = {
    data,
    savedAt: new Date().toISOString(),
  }

  window.localStorage.setItem(
    getCacheKey(scope, userId),
    JSON.stringify(cacheValue),
  )
}

export function clearUserLocalCache(userId: string) {
  window.localStorage.removeItem(getCacheKey('cases', userId))
  window.localStorage.removeItem(getCacheKey('history', userId))
}
