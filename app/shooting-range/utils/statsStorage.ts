import type { SessionRecord, ShootingSetupConfig, SessionStats } from '../types'

export const SHOOTING_HISTORY_KEY = 'shooting-range-history'
export const MAX_HISTORY_ENTRIES = 200

export function createSessionRecord(
  config: ShootingSetupConfig,
  stats: SessionStats,
  durationSeconds: number
): SessionRecord {
  const timestamp = Date.now()
  const date = new Date(timestamp).toISOString().slice(0, 10)

  return {
    id: `${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp,
    date,
    difficulty: config.difficulty,
    mapId: config.mapId,
    modeId: config.modeId,
    durationSeconds,
    ...stats,
  }
}

export function loadSessionHistory(storage: Pick<Storage, 'getItem'> = localStorage): SessionRecord[] {
  try {
    const raw = storage.getItem(SHOOTING_HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidSessionRecord)
  } catch {
    return []
  }
}

export function saveSessionRecord(
  record: SessionRecord,
  storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage
): SessionRecord[] {
  const history = loadSessionHistory(storage)
  const next = [record, ...history].slice(0, MAX_HISTORY_ENTRIES)
  storage.setItem(SHOOTING_HISTORY_KEY, JSON.stringify(next))
  return next
}

export function clearSessionHistory(storage: Pick<Storage, 'removeItem'> = localStorage) {
  storage.removeItem(SHOOTING_HISTORY_KEY)
}

function isValidSessionRecord(value: unknown): value is SessionRecord {
  if (!value || typeof value !== 'object') return false
  const record = value as Partial<SessionRecord>
  return (
    typeof record.id === 'string' &&
    typeof record.timestamp === 'number' &&
    typeof record.date === 'string' &&
    typeof record.score === 'number' &&
    typeof record.hits === 'number' &&
    typeof record.shots === 'number' &&
    typeof record.modeId === 'string' &&
    typeof record.mapId === 'string' &&
    typeof record.accuracy === 'number'
  )
}
