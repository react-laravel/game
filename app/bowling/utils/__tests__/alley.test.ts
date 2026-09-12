import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { createAlleyInterior } from '../alley'

describe('createAlleyInterior', () => {
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
})
