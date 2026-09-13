import { describe, expect, it } from 'vitest'
import { HIT_ZONE_MULTIPLIERS, resolveHitPoints } from '../hitZoneScoring'

describe('hitZoneScoring', () => {
  it('returns base score for circle targets regardless of zone', () => {
    expect(resolveHitPoints(10, 'head', 'circle')).toBe(10)
    expect(resolveHitPoints(10, 'limb', 'circle')).toBe(10)
  })

  it('applies head/body/limb multipliers for humanoid targets', () => {
    expect(resolveHitPoints(10, 'head', 'humanoid')).toBe(10 * HIT_ZONE_MULTIPLIERS.head)
    expect(resolveHitPoints(10, 'body', 'humanoid')).toBe(10)
    expect(resolveHitPoints(10, 'limb', 'humanoid')).toBe(5)
  })

  it('defaults humanoid body hits when zone is omitted', () => {
    expect(resolveHitPoints(12, undefined, 'humanoid')).toBe(12)
  })
})
