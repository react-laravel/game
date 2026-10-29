import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { PHYSICS_CONFIG } from '../../config/constants'
import {
  LANE_END_Z,
  LANE_SURFACE_Y,
  PIT_BACK_Z,
  PIT_FLOOR_Y,
  ballRestY,
  pinRestPosition,
} from '../layout'
import { createPhysicsMaterials } from '../physics'
import { createBall, createPins, createSceneElements, createWalls } from '../scene'

function createBowlingWorld() {
  const scene = new THREE.Scene()
  const world = new CANNON.World()
  world.gravity.set(0, PHYSICS_CONFIG.GRAVITY, 0)
  world.allowSleep = false
  world.defaultContactMaterial.friction = 0.1
  world.defaultContactMaterial.restitution = 0.02
  const materials = createPhysicsMaterials(world)
  createSceneElements(scene, world, materials)
  createWalls(scene, world)
  return { scene, world, materials }
}

describe('bowling rear pit physics', () => {
  beforeEach(() => {
    // Canvas textures do not affect the real Cannon colliders exercised here.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each(
    [0, -2.1, 2.1].flatMap(x => [-4, -10, -25].map(velocityZ => ({ x, velocityZ })))
  )('drops a ball at x=$x, vz=$velocityZ into the pit without trapping it on the lip', ({
    x,
    velocityZ,
  }) => {
    const { scene, world, materials } = createBowlingWorld()
    const { body } = createBall(scene, world, materials.ballMaterial)
    body.position.set(x, ballRestY(), LANE_END_Z + PHYSICS_CONFIG.BALL_RADIUS)
    body.velocity.set(0, 0, velocityZ)

    let enteredPit = false
    let reachedFloor = false
    let lowestY = body.position.y
    const floorRestY = PIT_FLOOR_Y + PHYSICS_CONFIG.BALL_RADIUS

    for (let step = 0; step < 360; step++) {
      world.step(PHYSICS_CONFIG.PHYSICS_STEP)
      lowestY = Math.min(lowestY, body.position.y)
      if (body.position.z < LANE_END_Z && body.position.y < LANE_SURFACE_Y) {
        enteredPit = true
      }
      if (
        body.position.z < LANE_END_Z &&
        body.position.z > PIT_BACK_Z &&
        Math.abs(body.position.y - floorRestY) < 0.05
      ) {
        reachedFloor = true
      }
    }

    expect(enteredPit).toBe(true)
    expect(reachedFloor).toBe(true)
    // The discrete solver can briefly compress a fast impact before correcting it.
    expect(lowestY).toBeGreaterThan(floorRestY - 0.15)
    expect(body.position.y).toBeCloseTo(floorRestY, 1)
    expect(body.position.z).toBeLessThan(LANE_END_Z)
    expect(body.position.z).toBeGreaterThan(PIT_BACK_Z)
  })

  it('keeps the undisturbed rack supported on the pin deck', () => {
    const { scene, world, materials } = createBowlingWorld()
    const pins = createPins(scene, world, materials.pinMaterial)

    for (let step = 0; step < 240; step++) {
      world.step(PHYSICS_CONFIG.PHYSICS_STEP)
    }

    pins.forEach(({ body }, index) => {
      const [x, y, z] = pinRestPosition(index)
      expect(body.position.x).toBeCloseTo(x, 2)
      expect(body.position.y).toBeCloseTo(y, 2)
      expect(body.position.z).toBeCloseTo(z, 2)
      const up = body.quaternion.vmult(new CANNON.Vec3(0, 1, 0))
      expect(up.y).toBeGreaterThan(0.99)
    })
  })
})
