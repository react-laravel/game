import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_CROSSHAIR_CONFIG } from '../crosshairConfig'
import { CROSSHAIR_STORAGE_KEY } from '../crosshairConfig'
import { loadCrosshairConfig, saveCrosshairConfig } from '../crosshairStorage'

describe('crosshairStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('persists and reloads crosshair settings', () => {
    const saved = saveCrosshairConfig({
      ...DEFAULT_CROSSHAIR_CONFIG,
      style: 't-shape',
      color: '#57ffb0',
      size: 20,
      gap: 8,
    })

    expect(saved.style).toBe('t-shape')
    expect(loadCrosshairConfig()).toEqual(saved)
    expect(localStorage.getItem(CROSSHAIR_STORAGE_KEY)).toContain('"style":"t-shape"')
  })

  it('falls back to defaults for invalid storage payloads', () => {
    localStorage.setItem(CROSSHAIR_STORAGE_KEY, '{not json')
    expect(loadCrosshairConfig()).toEqual(DEFAULT_CROSSHAIR_CONFIG)
  })
})
