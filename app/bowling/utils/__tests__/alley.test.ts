import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { PHYSICS_CONFIG } from '../../config/constants'
import { createAlleyInterior } from '../alley'

describe('createAlleyInterior', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fills the alley with a floor, walls, ceiling, and pinsetter', () => {
    const scene = new THREE.Scene()

    createAlleyInterior(scene)

    const floor = scene.getObjectByName('bowling-floor') as THREE.Mesh
    const ceiling = scene.getObjectByName('bowling-ceiling') as THREE.Mesh
    const pinsetter = scene.getObjectByName('bowling-pinsetter') as THREE.Mesh
    const backWall = scene.getObjectByName('bowling-back-wall') as THREE.Mesh

    expect(floor).toBeTruthy()
    expect(ceiling).toBeTruthy()
    expect(pinsetter).toBeTruthy()
    expect(backWall).toBeTruthy()
    expect(scene.getObjectByName('bowling-wall-left')).toBeTruthy()
    expect(scene.getObjectByName('bowling-wall-right')).toBeTruthy()

    expect(floor.position.y).toBeLessThan(0)
    expect(ceiling.position.y).toBeGreaterThan(6)
    expect(pinsetter.position.z).toBeLessThan(-22)
    expect(backWall.position.z).toBeLessThan(pinsetter.position.z)
  })

  it('leaves the carpet open above the recessed pit floor', () => {
    const scene = new THREE.Scene()
    createAlleyInterior(scene)
    scene.updateMatrixWorld(true)

    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(0, 0.2, -24),
      new THREE.Vector3(0, -1, 0),
      0,
      10
    )
    const [firstHit] = raycaster.intersectObjects(scene.children, true)

    expect(firstHit).toBeDefined()
    expect(firstHit.object.name).toBe('bowling-pin-pit-floor')
    expect(firstHit.point.y).toBeCloseTo(-2.4, 5)
  })

  it.each([0, -2.1, 2.1])('leaves a ball-sized entry clear at x=%s', x => {
    const scene = new THREE.Scene()
    createAlleyInterior(scene)
    scene.updateMatrixWorld(true)

    // Sample the ball's front cross-section, keeping its bottom just above
    // the tangent lane surface so the test measures entry clearance.
    const radius = PHYSICS_CONFIG.BALL_RADIUS
    const offsets: [number, number][] = [[0, 0]]
    for (let sample = 0; sample < 8; sample++) {
      const angle = (sample * Math.PI) / 4
      offsets.push([
        Math.cos(angle) * (radius - 0.01),
        Math.sin(angle) * (radius - 0.01),
      ])
    }

    offsets.forEach(([offsetX, offsetY]) => {
      const raycaster = new THREE.Raycaster(
        new THREE.Vector3(x + offsetX, radius + offsetY, -21),
        new THREE.Vector3(0, 0, -1),
        0,
        10
      )
      const [firstHit] = raycaster.intersectObjects(scene.children, true)

      expect(firstHit).toBeDefined()
      expect(firstHit.object.name).toBe('bowling-pin-pit-back')
      expect(firstHit.point.z).toBeLessThan(-25.9)
    })
  })
})
