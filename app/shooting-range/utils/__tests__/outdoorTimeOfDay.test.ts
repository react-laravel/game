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

  it('pushes night fog past the play space and boosts target readability', () => {
    const night = getOutdoorTimePreset('night')
    const resolved = resolveOutdoorEnvironment(mapConfigs.outdoor, 'night')

    expect(night.fog.near).toBeGreaterThan(100)
    expect(night.fog.far).toBeGreaterThan(180)
    expect(night.fog.color).toBe(night.background)
    expect(night.horizonWash).toBeUndefined()
    expect(night.targetReadabilityBoost).toBeGreaterThanOrEqual(0.6)
    expect(resolved.targetReadabilityBoost).toBe(night.targetReadabilityBoost)
    expect(night.toneMappingExposure).toBeGreaterThan(1.1)
    expect(night.hemisphere.intensity).toBeGreaterThan(1.2)
    expect(night.fillLight?.intensity).toBeGreaterThan(1.9)
    expect(night.grassTint).toBe('#5a7060')
  })
})
