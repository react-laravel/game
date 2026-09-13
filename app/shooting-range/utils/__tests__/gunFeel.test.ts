import { describe, expect, it } from 'vitest'
import {
  HEADSHOT_FLASH_DURATION,
  MUZZLE_FLASH_DURATION,
  SHOT_COOLDOWN_MS,
  decayRecoil,
  hitFlashDurationForZone,
  muzzleFlashIntensity,
  randomRecoilYaw,
} from '../gunFeel'

describe('gunFeel', () => {
  it('peaks muzzle flash early then decays to zero', () => {
    expect(muzzleFlashIntensity(-1)).toBe(0)
    expect(muzzleFlashIntensity(0)).toBeGreaterThan(0.5)
    expect(muzzleFlashIntensity(0.01)).toBeGreaterThan(muzzleFlashIntensity(0.05))
    expect(muzzleFlashIntensity(MUZZLE_FLASH_DURATION)).toBe(0)
    expect(muzzleFlashIntensity(MUZZLE_FLASH_DURATION + 0.01)).toBe(0)
  })

  it('scales muzzle flash intensity for reduced motion', () => {
    expect(muzzleFlashIntensity(0.01, 0.3)).toBeLessThan(muzzleFlashIntensity(0.01, 1))
    expect(muzzleFlashIntensity(0.01, 0)).toBe(0)
  })

  it('decays recoil toward zero without allocations', () => {
    let kick = 0.02
    for (let i = 0; i < 30; i += 1) {
      kick = decayRecoil(kick, 1 / 60)
    }
    expect(kick).toBe(0)
  })

  it('returns bounded random yaw kick', () => {
    for (let i = 0; i < 20; i += 1) {
      const yaw = randomRecoilYaw()
      expect(yaw).toBeGreaterThanOrEqual(-0.0036)
      expect(yaw).toBeLessThanOrEqual(0.0036)
    }
  })

  it('exposes shared shot cadence and longer headshot flash timing', () => {
    expect(SHOT_COOLDOWN_MS).toBe(132)
    expect(hitFlashDurationForZone('head')).toBe(HEADSHOT_FLASH_DURATION)
    expect(hitFlashDurationForZone('body')).toBeLessThan(HEADSHOT_FLASH_DURATION)
  })
})
