import { describe, expect, it } from 'vitest'
import { PHYSICS_CONFIG } from '../../config/constants'
import {
  APPROACH_CENTER_Z,
  APPROACH_LENGTH,
  LANE_CENTER_Z,
  LANE_LENGTH,
  LANE_SURFACE_Y,
  ballRestPosition,
  ballRestY,
  gutterFloorBodyY,
  gutterMeshCenterY,
  lanePhysicsBodyY,
  pinDeckSurfaceY,
  pinRestPosition,
  pinRestY,
} from '../layout'

describe('bowling layout', () => {
  it('keeps lane physics top aligned with the shared play surface', () => {
    expect(lanePhysicsBodyY()).toBe(-0.1)
    expect(lanePhysicsBodyY() + 0.1).toBe(LANE_SURFACE_Y)
  })

  it('rests the ball and pins on the lane surface without hovering', () => {
    expect(ballRestY()).toBe(LANE_SURFACE_Y + PHYSICS_CONFIG.BALL_RADIUS)
    expect(pinRestY()).toBe(LANE_SURFACE_Y + PHYSICS_CONFIG.PIN_HEIGHT / 2)

    const [ballX, ballY, ballZ] = ballRestPosition()
    expect(ballX).toBe(0)
    expect(ballZ).toBe(10)
    expect(ballY - PHYSICS_CONFIG.BALL_RADIUS).toBe(LANE_SURFACE_Y)

    const [pinX, pinY, pinZ] = pinRestPosition(0)
    expect(pinX).toBe(0)
    expect(pinZ).toBe(-18.3)
    expect(pinY - PHYSICS_CONFIG.PIN_HEIGHT / 2).toBe(LANE_SURFACE_Y)
  })

  it('places gutter trays below the lane and keeps the pin deck visual above the mesh', () => {
    expect(gutterMeshCenterY()).toBeLessThan(LANE_SURFACE_Y)
    expect(gutterFloorBodyY() + 0.07).toBeLessThanOrEqual(LANE_SURFACE_Y)
    expect(pinDeckSurfaceY()).toBeGreaterThan(LANE_SURFACE_Y)
  })

  it('covers the approach overlap with the main lane', () => {
    const laneEndZ = LANE_CENTER_Z + LANE_LENGTH / 2
    const approachStartZ = APPROACH_CENTER_Z - APPROACH_LENGTH / 2
    expect(laneEndZ).toBeGreaterThanOrEqual(approachStartZ)
  })
})
