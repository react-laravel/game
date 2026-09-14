import { describe, expect, it } from 'vitest'
import {
  INDOOR_CEILING_Y,
  INDOOR_FIRST_FIXTURE_Z,
  INDOOR_LANE_KEEP_CLEAR_X,
  INDOOR_TARGET_MAX_Y,
  indoorCeilingBeamXs,
  indoorTrofferSlots,
} from '../indoorCeiling'

describe('indoorCeiling', () => {
  it('keeps beams and lights out of the firing lane and away from the player', () => {
    for (const x of indoorCeilingBeamXs()) {
      expect(Math.abs(x)).toBeGreaterThanOrEqual(INDOOR_LANE_KEEP_CLEAR_X)
    }

    const slots = indoorTrofferSlots()
    expect(slots.length).toBeGreaterThan(0)
    for (const slot of slots) {
      expect(Math.abs(slot.x)).toBeGreaterThanOrEqual(INDOOR_LANE_KEEP_CLEAR_X)
      expect(slot.z).toBeLessThanOrEqual(INDOOR_FIRST_FIXTURE_Z)
    }
  })

  it('leaves clearance under the roof for targets', () => {
    expect(INDOOR_TARGET_MAX_Y).toBeLessThan(INDOOR_CEILING_Y)
  })
})
