import { PHYSICS_CONFIG, PIN_POSITIONS } from '../config/constants'

/** Visual lane/approach mesh sits slightly above the physics top to avoid z-fighting. */
export const LANE_MESH_SURFACE_Y = 0.01

/** Cannon lane/approach box half-height; top surface sits at {@link LANE_SURFACE_Y}. */
export const LANE_PHYSICS_HALF_HEIGHT = 0.1

/** Shared play-surface height for lane, approach, and resting ball/pins. */
export const LANE_SURFACE_Y = 0

export const LANE_LENGTH = 32
export const LANE_CENTER_Z = -6

export const APPROACH_LENGTH = 8
export const APPROACH_CENTER_Z = 13.8

export const WALL_LENGTH = 37
export const WALL_CENTER_Z = -3.5

export const GUTTER_DEPTH = 0.14
export const GUTTER_FLOOR_Y = LANE_SURFACE_Y - GUTTER_DEPTH

export const PIN_DECK_CENTER_Z = -19.6
export const PIN_DECK_THICKNESS = 0.08

export const BACK_WALL_CENTER_Z = -23.2
export const BACK_WALL_THICKNESS = 0.6

export function lanePhysicsBodyY(): number {
  return LANE_SURFACE_Y - LANE_PHYSICS_HALF_HEIGHT
}

export function ballRestY(): number {
  return LANE_SURFACE_Y + PHYSICS_CONFIG.BALL_RADIUS
}

export function pinRestY(): number {
  return LANE_SURFACE_Y + PHYSICS_CONFIG.PIN_HEIGHT / 2
}

export function ballRestPosition(): [number, number, number] {
  return [0, ballRestY(), 10]
}

export function pinRestPosition(index: number): [number, number, number] {
  const [x, , z] = PIN_POSITIONS[index]
  return [x, pinRestY(), z]
}

export function wallCenterX(): number {
  return (
    PHYSICS_CONFIG.LANE_WIDTH / 2 +
    PHYSICS_CONFIG.GUTTER_WIDTH +
    PHYSICS_CONFIG.WALL_THICKNESS / 2
  )
}

export function gutterCenterX(): number {
  return PHYSICS_CONFIG.LANE_WIDTH / 2 + PHYSICS_CONFIG.GUTTER_WIDTH / 2
}

export function gutterFloorHalfHeight(): number {
  return GUTTER_DEPTH / 2
}

export function gutterFloorBodyY(): number {
  return GUTTER_FLOOR_Y - gutterFloorHalfHeight()
}

/** Mesh center Y for a gutter tray whose top aligns with the lane edge. */
export function gutterMeshCenterY(): number {
  return GUTTER_FLOOR_Y + gutterFloorHalfHeight()
}

export function pinDeckSurfaceY(): number {
  return LANE_MESH_SURFACE_Y + 0.02
}
