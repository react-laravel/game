import {
  CROSSHAIR_STORAGE_KEY,
  DEFAULT_CROSSHAIR_CONFIG,
  normalizeCrosshairConfig,
  type CrosshairConfig,
} from './crosshairConfig'

export function loadCrosshairConfig(
  storage: Pick<Storage, 'getItem'> = localStorage
): CrosshairConfig {
  try {
    const raw = storage.getItem(CROSSHAIR_STORAGE_KEY)
    if (!raw) return DEFAULT_CROSSHAIR_CONFIG
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return DEFAULT_CROSSHAIR_CONFIG
    return normalizeCrosshairConfig(parsed as Partial<CrosshairConfig>)
  } catch {
    return DEFAULT_CROSSHAIR_CONFIG
  }
}

export function saveCrosshairConfig(
  config: CrosshairConfig,
  storage: Pick<Storage, 'setItem'> = localStorage
) {
  const normalized = normalizeCrosshairConfig(config)
  storage.setItem(CROSSHAIR_STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}

export function clearCrosshairConfig(storage: Pick<Storage, 'removeItem'> = localStorage) {
  storage.removeItem(CROSSHAIR_STORAGE_KEY)
}
