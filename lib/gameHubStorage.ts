import { GAME_BY_ID } from '@/lib/gameCatalog'

export const FAVORITES_KEY = 'game-hub-favorites'
export const RECENT_GAMES_KEY = 'game-hub-recent'
const CHANGE_EVENT = 'game-hub-change'
// Keep navigation and favorites usable when browser storage is unavailable.
const memoryValues = new Map<string, string>()

export function getHubSnapshot(key: string): string {
  if (memoryValues.has(key)) return memoryValues.get(key)!
  try {
    return window.localStorage.getItem(key) ?? '[]'
  } catch {
    return memoryValues.get(key) ?? '[]'
  }
}

export function readGameIds(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw)
    if (!Array.isArray(value)) return []
    return [...new Set(value.filter((id): id is string => typeof id === 'string' && GAME_BY_ID.has(id)))]
  } catch {
    return []
  }
}

function writeGameIds(key: string, ids: readonly string[]) {
  const value = JSON.stringify(ids)
  try {
    window.localStorage.setItem(key, value)
    memoryValues.delete(key)
  } catch {
    // The in-memory copy lasts for the current tab when persistence is blocked.
    memoryValues.set(key, value)
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function toggleFavorite(id: string) {
  if (!GAME_BY_ID.has(id)) return
  const current = readGameIds(getHubSnapshot(FAVORITES_KEY))
  writeGameIds(FAVORITES_KEY, current.includes(id) ? current.filter(item => item !== id) : [...current, id])
}

export function recordRecentGame(id: string) {
  if (!GAME_BY_ID.has(id)) return
  const current = readGameIds(getHubSnapshot(RECENT_GAMES_KEY))
  if (current[0] === id) return
  writeGameIds(RECENT_GAMES_KEY, [id, ...current.filter(item => item !== id)].slice(0, 4))
}

export function subscribeToHub(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === FAVORITES_KEY || event.key === RECENT_GAMES_KEY) {
      if (event.key === null) memoryValues.clear()
      else memoryValues.delete(event.key)
      listener()
    }
  }
  window.addEventListener(CHANGE_EVENT, listener)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener)
    window.removeEventListener('storage', onStorage)
  }
}
