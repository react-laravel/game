import { describe, expect, it } from 'vitest'
import { mapConfigs, mapOptions } from '../mapConfigs'

describe('mapConfigs', () => {
  it('provides three selectable environments', () => {
    expect(mapOptions).toHaveLength(3)
    expect(Object.keys(mapConfigs).sort()).toEqual(['indoor', 'outdoor', 'warehouse'])
  })

  it('keeps environment-specific lighting and fog values', () => {
    expect(mapConfigs.indoor.background).toBe('#07141e')
    expect(mapConfigs.outdoor.fog.far).toBeGreaterThan(mapConfigs.indoor.fog.far)
    expect(mapConfigs.warehouse.accent).toBe('#ff9f43')
  })
})
