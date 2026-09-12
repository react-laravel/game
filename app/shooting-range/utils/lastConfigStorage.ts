import type { ShootingSetupConfig } from '../types'

export const LAST_CONFIG_KEY = 'shooting-range-last-config'
export const LAST_DRILL_KEY = 'shooting-range-last-drill'

export function saveLastConfig(
  config: ShootingSetupConfig,
  drillId?: string,
  storage: Pick<Storage, 'setItem'> = localStorage
) {
  storage.setItem(LAST_CONFIG_KEY, JSON.stringify(config))
  if (drillId) storage.setItem(LAST_DRILL_KEY, drillId)
}

export function loadLastConfig(
  storage: Pick<Storage, 'getItem'> = localStorage
): ShootingSetupConfig | null {
  try {
    const raw = storage.getItem(LAST_CONFIG_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ShootingSetupConfig>
    if (!parsed.difficulty || !parsed.mapId || !parsed.modeId) return null
    return parsed as ShootingSetupConfig
  } catch {
    return null
  }
}

export function loadLastDrillId(storage: Pick<Storage, 'getItem'> = localStorage): string | null {
  return storage.getItem(LAST_DRILL_KEY)
}
