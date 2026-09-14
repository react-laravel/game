import type { ShootingSetupConfig } from '../types'
import { DEFAULT_LOOK_SENSITIVITY, normalizeLookSensitivity } from './lookSensitivity'
import { DEFAULT_SFX_VOLUME, normalizeSfxMuted, normalizeSfxVolume } from './sfxVolume'
import { DEFAULT_TARGET_SHAPE, normalizeTargetShape } from './targetShape'
import { DEFAULT_OUTDOOR_TIME_OF_DAY, normalizeOutdoorTimeOfDay } from './outdoorTimeOfDay'
import { normalizeRecoilEnabled } from './gunFeel'

export const LAST_CONFIG_KEY = 'shooting-range-last-config'
export const LAST_DRILL_KEY = 'shooting-range-last-drill'

function readStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

export function saveLastConfig(
  config: ShootingSetupConfig,
  drillId?: string,
  storage: Pick<Storage, 'setItem'> | null = readStorage()
) {
  if (!storage) return
  storage.setItem(LAST_CONFIG_KEY, JSON.stringify(config))
  if (drillId) storage.setItem(LAST_DRILL_KEY, drillId)
}

export function loadLastConfig(
  storage: Pick<Storage, 'getItem'> | null = readStorage()
): ShootingSetupConfig | null {
  if (!storage) return null
  try {
    const raw = storage.getItem(LAST_CONFIG_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ShootingSetupConfig>
    if (!parsed.difficulty || !parsed.mapId || !parsed.modeId) return null
    return {
      difficulty: parsed.difficulty,
      mapId: parsed.mapId,
      modeId: parsed.modeId,
      lookSensitivity: normalizeLookSensitivity(
        parsed.lookSensitivity ?? DEFAULT_LOOK_SENSITIVITY
      ),
      sfxVolume: normalizeSfxVolume(parsed.sfxVolume ?? DEFAULT_SFX_VOLUME),
      sfxMuted: normalizeSfxMuted(parsed.sfxMuted),
      targetShape: normalizeTargetShape(parsed.targetShape ?? DEFAULT_TARGET_SHAPE),
      outdoorTimeOfDay: normalizeOutdoorTimeOfDay(
        parsed.outdoorTimeOfDay ?? DEFAULT_OUTDOOR_TIME_OF_DAY
      ),
      recoilEnabled: normalizeRecoilEnabled(parsed.recoilEnabled),
    }
  } catch {
    return null
  }
}

export function loadLastDrillId(
  storage: Pick<Storage, 'getItem'> | null = readStorage()
): string | null {
  if (!storage) return null
  return storage.getItem(LAST_DRILL_KEY)
}
