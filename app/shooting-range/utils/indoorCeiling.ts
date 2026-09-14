/** Stay outside the firing lane so fixtures never read as glass walls or poles. */
export const INDOOR_LANE_KEEP_CLEAR_X = 8
/** First ceiling light sits well past the player's upper FOV. */
export const INDOOR_FIRST_FIXTURE_Z = -16
/** Indoor roof plane height. */
export const INDOOR_CEILING_Y = 8.25
/** Target origin stays below hanging lights and plate radius. */
export const INDOOR_TARGET_MAX_Y = 6.8
/** Warehouse roof is higher; still keep plates under hanging fixtures. */
export const WAREHOUSE_TARGET_MAX_Y = 9.6

export function indoorCeilingBeamXs(): number[] {
  return [-10, 10]
}

export function indoorTrofferSlots(): Array<{ x: number; z: number }> {
  const slots: Array<{ x: number; z: number }> = []
  for (const z of [-16, -30, -42]) {
    for (const x of indoorCeilingBeamXs()) {
      slots.push({ x, z })
    }
  }
  return slots
}
