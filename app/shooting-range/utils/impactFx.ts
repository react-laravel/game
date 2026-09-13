import type { HitZone } from '../types'

export const IMPACT_PARTICLE_COUNT = 22
export const IMPACT_SLOT_COUNT = 4
export const IMPACT_DURATION = 0.42

export interface PackedBurst {
  positions: Float32Array
  velocities: Float32Array
}

export function createPackedBurst(particleCount = IMPACT_PARTICLE_COUNT): PackedBurst {
  return {
    positions: new Float32Array(particleCount * 3),
    velocities: new Float32Array(particleCount * 3),
  }
}

export function randomizeBurstVelocities(velocities: Float32Array, hitZone?: HitZone) {
  for (let i = 0; i < velocities.length; i += 3) {
    const x = Math.random() - 0.5
    const yBias = hitZone === 'head' ? 0.18 : hitZone === 'limb' ? -0.08 : 0
    const y = Math.random() - 0.25 + yBias
    const z = Math.random() - 0.5
    const length = Math.hypot(x, y, z) || 1
    const speed = Math.random() * 5.2 + 4.2
    velocities[i] = (x / length) * speed
    velocities[i + 1] = (y / length) * speed
    velocities[i + 2] = (z / length) * speed
  }
}

export function resetBurst(burst: PackedBurst, hitZone?: HitZone) {
  burst.positions.fill(0)
  randomizeBurstVelocities(burst.velocities, hitZone)
}

export function stepBurst(
  positions: Float32Array,
  velocities: Float32Array,
  delta: number,
  gravity = 4.5
) {
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += velocities[i] * delta
    positions[i + 1] += velocities[i + 1] * delta
    positions[i + 2] += velocities[i + 2] * delta
    velocities[i + 1] -= gravity * delta
  }
}

export function nextImpactSlot(current: number, slotCount = IMPACT_SLOT_COUNT) {
  return (current + 1) % slotCount
}

export function impactColorForZone(hitZone?: HitZone): string {
  switch (hitZone) {
    case 'head':
      return '#d85858'
    case 'limb':
      return '#6898c0'
    default:
      return '#d8a050'
  }
}

export function impactParticleSizeForZone(hitZone?: HitZone): number {
  switch (hitZone) {
    case 'head':
      return 0.18
    case 'limb':
      return 0.14
    default:
      return 0.16
  }
}
