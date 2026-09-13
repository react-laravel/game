import { describe, expect, it } from 'vitest'
import {
  MUZZLE_FLASH_DURATION,
  decayRecoil,
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
      expect(yaw).toBeGreaterThanOrEqual(-0.0032)
      expect(yaw).toBeLessThanOrEqual(0.0032)
    }
  })
})
