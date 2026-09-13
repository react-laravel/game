import { describe, expect, it } from 'vitest'
import {
  IMPACT_PARTICLE_COUNT,
  IMPACT_SLOT_COUNT,
  createPackedBurst,
  impactColorForZone,
  nextImpactSlot,
  resetBurst,
  stepBurst,
} from '../impactFx'

describe('shooting-range impactFx', () => {
  it('creates a packed burst with one xyz triplet per particle', () => {
    const burst = createPackedBurst()

    expect(burst.positions).toHaveLength(IMPACT_PARTICLE_COUNT * 3)
    expect(burst.velocities).toHaveLength(IMPACT_PARTICLE_COUNT * 3)
    expect(burst.positions.every(value => value === 0)).toBe(true)
  })

  it('resets positions to the origin and gives every particle a velocity', () => {
    const burst = createPackedBurst()
    burst.positions[0] = 4
    resetBurst(burst)

    expect(burst.positions.every(value => value === 0)).toBe(true)
    expect(burst.velocities.some(value => value !== 0)).toBe(true)
  })

  it('advances particles and applies gravity without allocating', () => {
    const positions = new Float32Array([0, 0, 0])
    const velocities = new Float32Array([2, 3, 4])

    stepBurst(positions, velocities, 0.5, 4)

    expect(Array.from(positions)).toEqual([1, 1.5, 2])
    expect(Array.from(velocities)).toEqual([2, 1, 4])
  })

  it('maps hit zones to distinct matte impact colors', () => {
    expect(impactColorForZone('head')).toBe('#d85858')
    expect(impactColorForZone('limb')).toBe('#6898c0')
    expect(impactColorForZone('body')).toBe('#d8a050')
    expect(impactColorForZone()).toBe('#d8a050')
  })

  it('reuses a fixed number of impact slots', () => {
    expect(nextImpactSlot(0)).toBe(1)
    expect(nextImpactSlot(IMPACT_SLOT_COUNT - 1)).toBe(0)
    expect(IMPACT_SLOT_COUNT).toBeGreaterThan(1)
  })
})
