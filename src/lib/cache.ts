/**
 * Cache em memória com TTL para evitar chamadas repetidas ao Supabase
 * durante a mesma sessão. Os dados ficam válidos por 60 segundos.
 */

type CacheEntry<T> = {
  data: T
  expiresAt: number
}

const store = new Map<string, CacheEntry<unknown>>()

const DEFAULT_TTL = 60_000 // 60 segundos

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return null
  }
  return entry.data
}

export function cacheSet<T>(key: string, data: T, ttl = DEFAULT_TTL): void {
  store.set(key, { data, expiresAt: Date.now() + ttl })
}

export function cacheInvalidate(key: string): void {
  store.delete(key)
}
