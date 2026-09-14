import { beforeEach, describe, expect, it } from 'vitest'
import {
  LAST_CONFIG_KEY,
  LAST_DRILL_KEY,
  loadLastConfig,
  loadLastDrillId,
  saveLastConfig,
} from '../lastConfigStorage'

describe('lastConfigStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when storage is unavailable', () => {
    expect(loadLastConfig(null)).toBeNull()
    expect(loadLastDrillId(null)).toBeNull()
    expect(() =>
      saveLastConfig({ difficulty: 'easy', mapId: 'indoor', modeId: 'static' }, 'flick-reflex', null)
    ).not.toThrow()
  })

  it('returns null during SSR when window is undefined', () => {
    const windowBackup = globalThis.window
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: undefined,
    })

    try {
      expect(loadLastConfig()).toBeNull()
      expect(loadLastDrillId()).toBeNull()
    } finally {
      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: windowBackup,
      })
    }
  })

  it('normalizes look sensitivity when loading saved config', () => {
    localStorage.setItem(
      LAST_CONFIG_KEY,
      JSON.stringify({ difficulty: 'easy', mapId: 'indoor', modeId: 'static', lookSensitivity: 9 })
    )

    expect(loadLastConfig()?.lookSensitivity).toBe(2)
  })

  it('normalizes sfx volume and mute when loading saved config', () => {
    localStorage.setItem(
      LAST_CONFIG_KEY,
      JSON.stringify({
        difficulty: 'easy',
        mapId: 'indoor',
        modeId: 'static',
        sfxVolume: 9,
        sfxMuted: true,
      })
    )

    expect(loadLastConfig()).toEqual({
      difficulty: 'easy',
      mapId: 'indoor',
      modeId: 'static',
      lookSensitivity: 1,
      sfxVolume: 1,
      sfxMuted: true,
      targetShape: 'circle',
      outdoorTimeOfDay: 'day',
      recoilEnabled: false,
    })
  })

  it('normalizes target shape when loading saved config', () => {
    localStorage.setItem(
      LAST_CONFIG_KEY,
      JSON.stringify({
        difficulty: 'easy',
        mapId: 'indoor',
        modeId: 'moving',
        targetShape: 'humanoid',
      })
    )

    expect(loadLastConfig()?.targetShape).toBe('humanoid')
  })

  it('normalizes outdoor time of day when loading saved config', () => {
    localStorage.setItem(
      LAST_CONFIG_KEY,
      JSON.stringify({
        difficulty: 'easy',
        mapId: 'outdoor',
        modeId: 'moving',
        outdoorTimeOfDay: 'night',
      })
    )

    expect(loadLastConfig()?.outdoorTimeOfDay).toBe('night')
    expect(loadLastConfig()?.outdoorTimeOfDay).not.toBe('invalid')
  })

  it('persists and loads config plus drill id', () => {
    saveLastConfig(
      { difficulty: 'medium', mapId: 'outdoor', modeId: 'flick', targetShape: 'humanoid' },
      'flick-reflex'
    )

    expect(loadLastConfig()).toEqual({
      difficulty: 'medium',
      mapId: 'outdoor',
      modeId: 'flick',
      lookSensitivity: 1,
      sfxVolume: 0.85,
      sfxMuted: false,
      targetShape: 'humanoid',
      outdoorTimeOfDay: 'day',
      recoilEnabled: false,
    })
    expect(loadLastDrillId()).toBe('flick-reflex')
    expect(localStorage.getItem(LAST_CONFIG_KEY)).toContain('"mapId":"outdoor"')
    expect(localStorage.getItem(LAST_DRILL_KEY)).toBe('flick-reflex')
  })

  it('defaults recoil to off when missing and preserves on', () => {
    localStorage.setItem(
      LAST_CONFIG_KEY,
      JSON.stringify({ difficulty: 'easy', mapId: 'indoor', modeId: 'static' })
    )
    expect(loadLastConfig()?.recoilEnabled).toBe(false)

    localStorage.setItem(
      LAST_CONFIG_KEY,
      JSON.stringify({
        difficulty: 'easy',
        mapId: 'indoor',
        modeId: 'static',
        recoilEnabled: true,
      })
    )
    expect(loadLastConfig()?.recoilEnabled).toBe(true)
  })
})
