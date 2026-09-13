import { describe, expect, it } from 'vitest'
import {
  clampSfxVolume,
  DEFAULT_SFX_VOLUME,
  normalizeSfxMuted,
  normalizeSfxVolume,
  sfxVolumePercent,
} from '../sfxVolume'

describe('sfxVolume', () => {
  it('clamps and steps volume into the supported range', () => {
    expect(clampSfxVolume(9)).toBe(1)
    expect(clampSfxVolume(-1)).toBe(0)
    expect(clampSfxVolume(0.83)).toBe(0.85)
  })

  it('normalizes invalid persisted values', () => {
    expect(normalizeSfxVolume(undefined)).toBe(DEFAULT_SFX_VOLUME)
    expect(normalizeSfxVolume('loud')).toBe(DEFAULT_SFX_VOLUME)
    expect(normalizeSfxMuted('yes')).toBe(false)
    expect(normalizeSfxMuted(true)).toBe(true)
  })

  it('reports volume as a whole-number percent', () => {
    expect(sfxVolumePercent(0.85)).toBe(85)
    expect(sfxVolumePercent(1)).toBe(100)
  })
})
