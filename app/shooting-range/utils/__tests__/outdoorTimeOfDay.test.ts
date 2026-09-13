import { describe, expect, it } from 'vitest'
import { mapConfigs } from '../mapConfigs'
import {
  DEFAULT_OUTDOOR_TIME_OF_DAY,
  getOutdoorTimePreset,
  normalizeOutdoorTimeOfDay,
  outdoorTimeLabel,
  OUTDOOR_TIME_OPTIONS,
  resolveOutdoorEnvironment,
} from '../outdoorTimeOfDay'

describe('outdoorTimeOfDay', () => {
  it('exposes four Chinese-labelled presets', () => {
    expect(OUTDOOR_TIME_OPTIONS.map(option => option.label)).toEqual(['白天', '中午', '傍晚', '晚上'])
  })

  it('normalizes unknown values to day', () => {
    expect(normalizeOutdoorTimeOfDay(undefined)).toBe(DEFAULT_OUTDOOR_TIME_OF_DAY)
    expect(normalizeOutdoorTimeOfDay('invalid')).toBe('day')
    expect(normalizeOutdoorTimeOfDay('night')).toBe('night')
  })

  it('returns labels for each preset', () => {
    expect(outdoorTimeLabel('noon')).toBe('中午')
    expect(outdoorTimeLabel('dusk')).toBe('傍晚')
  })

  it('resolves distinct lighting for noon vs night', () => {
    const noon = resolveOutdoorEnvironment(mapConfigs.outdoor, 'noon')
    const night = resolveOutdoorEnvironment(mapConfigs.outdoor, 'night')

    expect(noon.toneMappingExposure).toBeGreaterThan(night.toneMappingExposure)
    expect(noon.config.directional.intensity).toBeGreaterThan(night.config.directional.intensity)
    expect(night.showRangeLights).toBe(true)
    expect(noon.showRangeLights).toBe(false)
    expect(night.config.background).not.toBe(noon.config.background)
  })

  it('keeps outdoor map id while overriding fog and floor tint', () => {
    const dusk = resolveOutdoorEnvironment(mapConfigs.outdoor, 'dusk')
    expect(dusk.config.id).toBe('outdoor')
    expect(dusk.config.fog.color).toBe(getOutdoorTimePreset('dusk').fog.color)
    expect(dusk.grassTint).toBe(getOutdoorTimePreset('dusk').grassTint)
  })
})
