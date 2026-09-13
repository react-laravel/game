import { describe, expect, it } from 'vitest'
import {
  motionFlashScale,
  motionParticleScale,
  normalizeMotionPreference,
  resolveReducedMotion,
} from '../motionPrefs'

describe('motionPrefs', () => {
  it('normalizes stored preference values', () => {
    expect(normalizeMotionPreference('auto')).toBe('auto')
    expect(normalizeMotionPreference('reduce')).toBe('reduce')
    expect(normalizeMotionPreference('full')).toBe('full')
    expect(normalizeMotionPreference('invalid')).toBe('auto')
  })

  it('resolves reduced motion from preference', () => {
    expect(resolveReducedMotion('reduce')).toBe(true)
    expect(resolveReducedMotion('full')).toBe(false)
  })

  it('scales flash and particle intensity when reduced', () => {
    expect(motionFlashScale(true)).toBeLessThan(1)
    expect(motionFlashScale(false)).toBe(1)
    expect(motionParticleScale(true)).toBeLessThan(1)
    expect(motionParticleScale(false)).toBe(1)
  })
})
