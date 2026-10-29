import * as THREE from 'three'
import {
  BACK_WALL_CENTER_Z, BACK_WALL_THICKNESS, LANE_END_Z, LANE_SURFACE_Y,
  PIT_BACK_Z, PIT_CENTER_Z, PIT_FLOOR_Y, PIT_LENGTH, PIT_OPENING_HEIGHT,
  PIT_WALL_THICKNESS, PIT_WIDTH,
} from './layout'
import {
  createClubMuralTexture, createLaneNumberTexture, createLoungeCarpetTexture, createWalnutTexture,
} from './alleyTextures'

type Placement = {
  position: [number, number, number]
  scale: [number, number, number]
  rotationY?: number
}

const LANE_CENTERS = [-13.4, -6.7, 0, 6.7, 13.4]
const ROOM = { width: 44, rearZ: -27.2, frontZ: 35, height: 8.3 }
const ROOM_DEPTH = ROOM.frontZ - ROOM.rearZ
const ROOM_CENTER_Z = (ROOM.frontZ + ROOM.rearZ) / 2

function addMesh(
  scene: THREE.Object3D, name: string, geometry: THREE.BufferGeometry,
  material: THREE.Material, position: [number, number, number], receiveShadow = true
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = name
  mesh.position.set(...position)
  mesh.receiveShadow = receiveShadow
  scene.add(mesh)
  return mesh
}

function addInstances(
  parent: THREE.Object3D, name: string, geometry: THREE.BufferGeometry,
  material: THREE.Material, placements: Placement[], receiveShadow = true
): THREE.InstancedMesh {
  const mesh = new THREE.InstancedMesh(geometry, material, placements.length)
  mesh.name = name
  const transform = new THREE.Object3D()
  placements.forEach((placement, index) => {
    transform.position.set(...placement.position)
    transform.scale.set(...placement.scale)
    transform.rotation.set(0, placement.rotationY ?? 0, 0)
    transform.updateMatrix()
    mesh.setMatrixAt(index, transform.matrix)
  })
  mesh.instanceMatrix.needsUpdate = true
  mesh.receiveShadow = receiveShadow
  parent.add(mesh)
  return mesh
}

/** Reserve the playable openings before placing architectural modules. */
function createRoomPlan() {
  const sidePanels: Placement[] = []
  const walnutTrim: Placement[] = []
  const ceilingBeams: Placement[] = []
  const lightHousings: Placement[] = []
  const lightDiffusers: Placement[] = []
  for (const side of [-1, 1]) {
    walnutTrim.push(
      { position: [side * 21.57, 0.52, ROOM_CENTER_Z], scale: [0.22, 1.04, ROOM_DEPTH] },
      { position: [side * 21.5, 6.15, ROOM_CENTER_Z], scale: [0.28, 0.15, ROOM_DEPTH] },
      { position: [side * 21.52, 7.88, ROOM_CENTER_Z], scale: [0.25, 0.18, ROOM_DEPTH] }
    )
    for (const z of [-22.5, -14.5, -6.5, 1.5, 9.5, 17.5, 25.5]) {
      sidePanels.push({ position: [side * 21.58, 3.65, z], scale: [0.18, 4.15, 6.85] })
      walnutTrim.push(
        { position: [side * 21.4, 1.59, z], scale: [0.22, 0.13, 7.0] },
        { position: [side * 21.4, 5.73, z], scale: [0.22, 0.13, 7.0] }
      )
      for (let rib = -6; rib <= 6; rib++) {
        walnutTrim.push({ position: [side * 21.37, 3.66, z + rib * 0.52], scale: [0.25, 4.04, 0.055] })
      }
    }
  }
  for (const z of [-20, -8, 4, 16, 28]) {
    ceilingBeams.push({ position: [0, 8.08, z], scale: [43.4, 0.26, 0.34] })
  }
  for (const x of LANE_CENTERS) {
    for (const z of [-14, -3, 8, 19]) {
      lightHousings.push({ position: [x, 8.12, z], scale: [0.75, 0.13, 3.3] })
      lightDiffusers.push({ position: [x, 8.035, z], scale: [0.34, 0.025, 2.94] })
    }
  }
  return { sidePanels, walnutTrim, ceilingBeams, lightHousings, lightDiffusers }
}

function createNumberPanels(): THREE.BufferGeometry {
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  LANE_CENTERS.forEach((x, index) => {
    const width = 5.9
    const height = 1.5
    const y = PIT_OPENING_HEIGHT + 0.95
    const z = LANE_END_Z + 0.015
    positions.push(
      x - width / 2, y - height / 2, z, x + width / 2, y - height / 2, z,
      x + width / 2, y + height / 2, z, x - width / 2, y + height / 2, z
    )
    normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1)
    const u0 = (index + 0.002) / 5
    const u1 = (index + 0.998) / 5
    uvs.push(u0, 0.002, u1, 0.002, u1, 0.998, u0, 0.998)
    const vertex = index * 4
    indices.push(vertex, vertex + 1, vertex + 2, vertex, vertex + 2, vertex + 3)
  })
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  return geometry
}

function addLounge(scene: THREE.Scene, box: THREE.BoxGeometry, walnut: THREE.MeshStandardMaterial, metal: THREE.MeshStandardMaterial) {
  const lounge = new THREE.Group()
  lounge.name = 'bowling-lounge'
  lounge.position.y = -0.16
  scene.add(lounge)
  const upholstery = new THREE.MeshStandardMaterial({ color: 0x9a654d, roughness: 0.82 })
  const seats: Placement[] = []
  const frames: Placement[] = []
  const legs: Placement[] = []
  const tableTops: Placement[] = []
  const tableBases: Placement[] = []
  for (const side of [-1, 1]) {
    const rotationY = -side * Math.PI / 2
    for (const z of [-2, 8]) {
      // This local sofa module owns its back, arms, cushions and raised legs.
      const place = (x: number, y: number, depth: number, scale: Placement['scale']): Placement => ({
        position: [side * 19 + Math.sin(rotationY) * depth, y, z - Math.sin(rotationY) * x],
        scale, rotationY,
      })
      frames.push(place(0, 0.46, 0, [3.45, 0.35, 1.3]))
      seats.push(
        place(0, 1.17, -0.52, [3.45, 1.07, 0.25]),
        place(-1.58, 0.92, 0, [0.3, 0.65, 1.25]),
        place(1.58, 0.92, 0, [0.3, 0.65, 1.25])
      )
      for (const x of [-0.98, 0, 0.98]) seats.push(place(x, 0.73, 0.09, [0.94, 0.24, 1.0]))
      for (const x of [-1.35, 1.35]) {
        for (const depth of [-0.4, 0.4]) legs.push(place(x, 0.2, depth, [0.095, 0.4, 0.095]))
      }
      tableTops.push({ position: [side * 17.8, 0.85, z + 2.2], scale: [0.73, 0.12, 0.73] })
      tableBases.push(
        { position: [side * 17.8, 0.42, z + 2.2], scale: [0.065, 0.8, 0.065] },
        { position: [side * 17.8, 0.04, z + 2.2], scale: [0.36, 0.08, 0.36] }
      )
    }
  }
  addInstances(lounge, 'bowling-lounge-sofas', box, upholstery, seats)
  addInstances(lounge, 'bowling-lounge-sofa-bases', box, walnut, frames)
  addInstances(lounge, 'bowling-lounge-sofa-legs', box, metal, legs)
  const cylinder = new THREE.CylinderGeometry(1, 1, 1, 24)
  addInstances(lounge, 'bowling-lounge-coffee-tables', cylinder, walnut, tableTops)
  addInstances(lounge, 'bowling-lounge-table-pedestals', cylinder, metal, tableBases)

  const returnShell = new THREE.MeshStandardMaterial({ color: 0x6d8380, roughness: 0.38, metalness: 0.2 })
  const bases: Placement[] = []
  const hoods: Placement[] = []
  const rails: Placement[] = []
  const mouths: Placement[] = []
  // Two active-lane returns remain behind the approach; side displays stay in the lounge corridor.
  const returns = [{ x: -3.35, z: 19.1 }, { x: 3.35, z: 19.1 }, { x: -18.1, z: 2.6 }, { x: 18.1, z: 2.6 }]
  for (const { x, z } of returns) {
    bases.push({ position: [x, 0.45, z], scale: [0.98, 0.78, 1.45] })
    hoods.push({ position: [x, 0.86, z], scale: [0.58, 0.46, 0.96] })
    mouths.push({ position: [x, 0.91, z + 0.95], scale: [0.29, 0.29, 1] })
    for (const side of [-1, 1]) {
      rails.push({ position: [x + side * 0.4, 0.77, z + 2.3], scale: [0.075, 0.1, 2.8] })
      for (const offset of [1.15, 3.45]) {
        rails.push({ position: [x + side * 0.4, 0.36, z + offset], scale: [0.1, 0.72, 0.1] })
      }
    }
  }
  addInstances(lounge, 'bowling-ball-return-bases', box, walnut, bases)
  addInstances(lounge, 'bowling-ball-return-hoods', new THREE.SphereGeometry(1, 20, 12), returnShell, hoods)
  addInstances(lounge, 'bowling-ball-return-racks', box, metal, rails)
  addInstances(lounge, 'bowling-ball-return-mouths', new THREE.CircleGeometry(1, 24), metal, mouths, false)
  const ballGeometry = new THREE.SphereGeometry(0.39, 20, 12)
  for (const [index, color] of [0x294f6f, 0xad7345, 0x758478].entries()) {
    addInstances(lounge, `bowling-rack-balls-${index}`, ballGeometry,
      new THREE.MeshStandardMaterial({ color, roughness: 0.24, metalness: 0.14 }),
      returns.map(({ x, z }) => ({ position: [x, 1.08, z + 1.4 + index * 0.89], scale: [1, 1, 1] })))
  }
}

/** A five-lane club interior; architectural modules never occupy the active pit opening. */
export function createAlleyInterior(scene: THREE.Scene): void {
  const box = new THREE.BoxGeometry(1, 1, 1)
  const plan = createRoomPlan()
  const walnutTexture = createWalnutTexture()
  const walnut = new THREE.MeshStandardMaterial({
    map: walnutTexture, color: walnutTexture ? 0xffffff : 0x75523a, roughness: 0.68, metalness: 0.02,
  })
  const metal = new THREE.MeshStandardMaterial({ color: 0x263033, roughness: 0.47, metalness: 0.36 })
  const carpetTexture = createLoungeCarpetTexture()
  const carpet = new THREE.MeshStandardMaterial({ map: carpetTexture, color: carpetTexture ? 0xffffff : 0x384345, roughness: 0.98 })

  const floorShape = new THREE.Shape()
  floorShape.moveTo(-22, -43)
  floorShape.lineTo(22, -43)
  floorShape.lineTo(22, -8 - ROOM.rearZ)
  floorShape.lineTo(-22, -8 - ROOM.rearZ)
  floorShape.closePath()
  // Local +Y maps to world -Z after rotating this plane; its center remains z=-8.
  for (const x of LANE_CENTERS) {
    const pitHole = new THREE.Path()
    pitHole.moveTo(x - PIT_WIDTH / 2, -8 - LANE_END_Z)
    pitHole.lineTo(x - PIT_WIDTH / 2, -8 - PIT_BACK_Z)
    pitHole.lineTo(x + PIT_WIDTH / 2, -8 - PIT_BACK_Z)
    pitHole.lineTo(x + PIT_WIDTH / 2, -8 - LANE_END_Z)
    pitHole.closePath()
    floorShape.holes.push(pitHole)
  }
  const floorGeometry = new THREE.ShapeGeometry(floorShape)
  const positions = floorGeometry.getAttribute('position')
  const uvs = floorGeometry.getAttribute('uv')
  for (let index = 0; index < positions.count; index++) {
    uvs.setXY(index, (positions.getX(index) + 22) / 44, (positions.getY(index) + 43) / ROOM_DEPTH)
  }
  const floor = addMesh(scene, 'bowling-floor', floorGeometry, carpet, [0, -0.16, -8])
  floor.rotation.x = -Math.PI / 2

  const walls = new THREE.MeshStandardMaterial({ color: 0x3b5152, roughness: 0.9 })
  for (const side of [-1, 1]) {
    addMesh(scene, side < 0 ? 'bowling-wall-left' : 'bowling-wall-right',
      new THREE.BoxGeometry(0.6, 8.4, ROOM_DEPTH), walls, [side * 22, 4.1, ROOM_CENTER_Z])
  }
  addMesh(scene, 'bowling-back-wall', new THREE.BoxGeometry(45, 8.4, 0.8), walls, [0, 4.1, ROOM.rearZ])
  const ceiling = addMesh(scene, 'bowling-ceiling', new THREE.PlaneGeometry(44, ROOM_DEPTH),
    new THREE.MeshStandardMaterial({ color: 0x465052, roughness: 0.95 }), [0, ROOM.height, ROOM_CENTER_Z])
  ceiling.rotation.x = Math.PI / 2

  const architecture = new THREE.Group()
  architecture.name = 'bowling-room-architecture'
  architecture.userData.plan = plan
  scene.add(architecture)
  addInstances(architecture, 'bowling-acoustic-wall-panels', box,
    new THREE.MeshStandardMaterial({ color: 0x273f42, roughness: 0.96 }), plan.sidePanels)
  addInstances(architecture, 'bowling-walnut-wall-ribs', box, walnut, plan.walnutTrim)
  addInstances(architecture, 'bowling-ceiling-crossbeams', box, metal, plan.ceilingBeams)
  addInstances(architecture, 'bowling-ceiling-light-housings', box, metal, plan.lightHousings)
  addInstances(architecture, 'bowling-ceiling-light-diffusers', box,
    new THREE.MeshStandardMaterial({ color: 0xffefd3, emissive: 0xffdaa0, emissiveIntensity: 0.58, roughness: 0.5 }), plan.lightDiffusers, false)

  const muralTexture = createClubMuralTexture()
  addMesh(scene, 'bowling-sign', new THREE.PlaneGeometry(41.5, 3.8),
    new THREE.MeshBasicMaterial({ map: muralTexture, color: muralTexture ? 0xffffff : 0xc6b997 }), [0, 6.18, -26.765], false)
  addInstances(architecture, 'bowling-rear-mural-frame', box, walnut, [
    { position: [0, 4.22, -26.62], scale: [42.3, 0.16, 0.28] },
    { position: [0, 8.12, -26.62], scale: [42.3, 0.16, 0.28] },
  ])

  const casingMaterial = new THREE.MeshStandardMaterial({ color: 0x34494a, roughness: 0.61, metalness: 0.1 })
  const casingGeometry = new THREE.BoxGeometry(6.3, 1.9, PIT_LENGTH + 0.2)
  addMesh(scene, 'bowling-pinsetter', casingGeometry, casingMaterial, [0, PIT_OPENING_HEIGHT + 0.95, PIT_CENTER_Z - 0.1])
  addInstances(scene, 'bowling-neighbor-pinsetters', casingGeometry, casingMaterial,
    LANE_CENTERS.filter(x => x !== 0).map(x => ({ position: [x, PIT_OPENING_HEIGHT + 0.95, PIT_CENTER_Z - 0.1], scale: [1, 1, 1] })))
  addMesh(scene, 'bowling-pinsetter-hood', new THREE.BoxGeometry(6.3, 0.2, PIT_LENGTH + 0.4), walnut,
    [0, PIT_OPENING_HEIGHT + 1.99, PIT_CENTER_Z - 0.1])
  const hoodTrim: Placement[] = []
  const fasciaAccents: Placement[] = []
  const portalSides: Placement[] = []
  LANE_CENTERS.forEach(x => {
    if (x !== 0) hoodTrim.push({ position: [x, PIT_OPENING_HEIGHT + 1.99, PIT_CENTER_Z - 0.1], scale: [6.3, 0.2, PIT_LENGTH + 0.4] })
    fasciaAccents.push({ position: [x, PIT_OPENING_HEIGHT + 0.07, LANE_END_Z + 0.022], scale: [6.08, 0.045, 0.045] })
    for (const side of [-1, 1]) portalSides.push({
      position: [x + side * 3.1, (PIT_OPENING_HEIGHT - 0.16) / 2, PIT_CENTER_Z - 0.1], scale: [0.12, PIT_OPENING_HEIGHT + 0.16, PIT_LENGTH + 0.2],
    })
  })
  addInstances(architecture, 'bowling-pinsetter-walnut-caps', box, walnut, hoodTrim)
  addInstances(architecture, 'bowling-pinsetter-portal-sides', box, casingMaterial, portalSides)
  addInstances(architecture, 'bowling-pinsetter-amber-inlays', box,
    new THREE.MeshStandardMaterial({ color: 0xc5a069, roughness: 0.44, metalness: 0.32 }), fasciaAccents)
  const numbersTexture = createLaneNumberTexture()
  addMesh(scene, 'bowling-lane-number-fascia', createNumberPanels(),
    new THREE.MeshBasicMaterial({ map: numbersTexture, color: numbersTexture ? 0xffffff : 0x486363 }), [0, 0, 0], false)

  // Preserve exact recessed surfaces and the clear entry established by the pit fix.
  const pit = new THREE.Group()
  pit.name = 'bowling-pin-pit'
  scene.add(pit)
  const pitMaterial = new THREE.MeshStandardMaterial({ color: 0x111a1d, roughness: 0.95 })
  const pitWallHeight = PIT_OPENING_HEIGHT - PIT_FLOOR_Y
  const pitWallY = PIT_FLOOR_Y + pitWallHeight / 2
  addMesh(pit, 'bowling-pin-pit-floor', new THREE.BoxGeometry(PIT_WIDTH, PIT_WALL_THICKNESS, PIT_LENGTH), pitMaterial,
    [0, PIT_FLOOR_Y - PIT_WALL_THICKNESS / 2, PIT_CENTER_Z])
  addMesh(pit, 'bowling-pin-pit-back', new THREE.BoxGeometry(PIT_WIDTH, pitWallHeight, BACK_WALL_THICKNESS), pitMaterial,
    [0, pitWallY, BACK_WALL_CENTER_Z])
  for (const side of [-1, 1]) {
    addMesh(pit, side < 0 ? 'bowling-pin-pit-left' : 'bowling-pin-pit-right', new THREE.BoxGeometry(PIT_WALL_THICKNESS, pitWallHeight, PIT_LENGTH), pitMaterial,
      [side * (PIT_WIDTH + PIT_WALL_THICKNESS) / 2, pitWallY, PIT_CENTER_Z])
  }
  addMesh(pit, 'bowling-pin-pit-front', new THREE.BoxGeometry(PIT_WIDTH, LANE_SURFACE_Y - PIT_FLOOR_Y, PIT_WALL_THICKNESS), pitMaterial,
    [0, (LANE_SURFACE_Y + PIT_FLOOR_Y) / 2, LANE_END_Z + PIT_WALL_THICKNESS / 2])

  // Decorative lanes receive the same architectural recess, without adding physics bodies.
  const neighborPitSurfaces: Placement[] = []
  for (const x of LANE_CENTERS.filter(x => x !== 0)) {
    neighborPitSurfaces.push(
      { position: [x, PIT_FLOOR_Y - PIT_WALL_THICKNESS / 2, PIT_CENTER_Z], scale: [PIT_WIDTH, PIT_WALL_THICKNESS, PIT_LENGTH] },
      { position: [x, pitWallY, BACK_WALL_CENTER_Z], scale: [PIT_WIDTH, pitWallHeight, BACK_WALL_THICKNESS] },
      { position: [x, (LANE_SURFACE_Y + PIT_FLOOR_Y) / 2, LANE_END_Z + PIT_WALL_THICKNESS / 2], scale: [PIT_WIDTH, LANE_SURFACE_Y - PIT_FLOOR_Y, PIT_WALL_THICKNESS] }
    )
    for (const side of [-1, 1]) {
      neighborPitSurfaces.push({
        position: [x + side * (PIT_WIDTH + PIT_WALL_THICKNESS) / 2, pitWallY, PIT_CENTER_Z],
        scale: [PIT_WALL_THICKNESS, pitWallHeight, PIT_LENGTH],
      })
    }
  }
  addInstances(scene, 'bowling-neighbor-pin-pit-surfaces', box, pitMaterial, neighborPitSurfaces)

  addLounge(scene, box, walnut, metal)
  scene.userData.alleyDesign = { room: ROOM, laneCenters: LANE_CENTERS, palette: 'walnut / maple / petrol / warm cream', pitOpeningHeight: PIT_OPENING_HEIGHT }
}
