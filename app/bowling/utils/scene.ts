import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { PHYSICS_CONFIG } from '../config/constants'
import type { PhysicsMaterials, SceneElements, BallObject, PinObject } from '../types/scene'
import { addStaticBox } from './colliders'
import { createLaneTextures } from './laneTextures'
import {
  APPROACH_CENTER_Z,
  APPROACH_LENGTH,
  BACK_WALL_CENTER_Z,
  BACK_WALL_THICKNESS,
  GUTTER_DEPTH,
  LANE_CENTER_Z,
  LANE_END_Z,
  LANE_LENGTH,
  LANE_MESH_SURFACE_Y,
  LANE_PHYSICS_HALF_HEIGHT,
  LANE_SURFACE_Y,
  PIN_DECK_CENTER_Z,
  PIN_DECK_LENGTH,
  PIN_DECK_THICKNESS,
  PIT_CENTER_Z,
  PIT_FLOOR_Y,
  PIT_LENGTH,
  PIT_OPENING_HEIGHT,
  PIT_WALL_THICKNESS,
  PIT_WIDTH,
  WALL_CENTER_Z,
  WALL_LENGTH,
  ballRestPosition,
  gutterCenterX,
  gutterFloorBodyY,
  gutterFloorHalfHeight,
  gutterMeshCenterY,
  lanePhysicsBodyY,
  pinDeckSurfaceY,
  pinRestPosition,
  wallCenterX,
} from './layout'

function createBallTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const gradient = ctx.createLinearGradient(0, 0, 256, 256)
  gradient.addColorStop(0, '#102445')
  gradient.addColorStop(0.45, '#1d4ed8')
  gradient.addColorStop(1, '#0f172a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 256)

  ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)'
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.ellipse(128, 128, 86, 36, 0.5, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(128, 128, 36, 90, -0.4, 0, Math.PI * 2)
  ctx.stroke()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function createPinTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.fillStyle = '#f6f3ea'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#dc2626'
  ctx.fillRect(0, canvas.height * 0.18, canvas.width, canvas.height * 0.035)
  ctx.fillRect(0, canvas.height * 0.25, canvas.width, canvas.height * 0.035)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

export function createAimGuide(scene: THREE.Scene): THREE.Line {
  const guideY = LANE_SURFACE_Y + 0.08
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, guideY, 10),
    new THREE.Vector3(0, guideY, -16),
  ])
  const material = new THREE.LineDashedMaterial({
    color: 0xfbbf24,
    dashSize: 0.55,
    gapSize: 0.32,
    transparent: true,
    opacity: 0.85,
  })
  const line = new THREE.Line(geometry, material)
  line.computeLineDistances()
  scene.add(line)
  return line
}

function createPinGeometry(): THREE.LatheGeometry {
  const pinHeight = PHYSICS_CONFIG.PIN_HEIGHT
  return new THREE.LatheGeometry(
    [
      new THREE.Vector2(0, -pinHeight / 2),
      new THREE.Vector2(PHYSICS_CONFIG.PIN_RADIUS_BOTTOM, -pinHeight / 2),
      new THREE.Vector2(PHYSICS_CONFIG.PIN_RADIUS_BOTTOM * 1.2, -pinHeight * 0.4),
      new THREE.Vector2(PHYSICS_CONFIG.PIN_RADIUS_BOTTOM * 1.3, -pinHeight * 0.1),
      new THREE.Vector2(PHYSICS_CONFIG.PIN_RADIUS_TOP * 0.9, pinHeight * 0.4),
      new THREE.Vector2(PHYSICS_CONFIG.PIN_RADIUS_TOP, pinHeight / 2),
      new THREE.Vector2(0, pinHeight / 2),
    ],
    24
  )
}

function createPinMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    map: createPinTexture(),
    roughness: 0.35,
    metalness: 0.05,
  })
}

export function createSceneElements(
  scene: THREE.Scene,
  world: CANNON.World,
  materials: PhysicsMaterials
): SceneElements {
  const { groundMaterial } = materials
  const wood = createLaneTextures(true)
  const plainWood = createLaneTextures(false)

  const laneWidth = PHYSICS_CONFIG.LANE_WIDTH
  const laneHalfExtents = new CANNON.Vec3(
    laneWidth / 2,
    LANE_PHYSICS_HALF_HEIGHT,
    LANE_LENGTH / 2
  )
  const laneMaterial = new THREE.MeshPhysicalMaterial({
    map: wood.colorMap,
    roughnessMap: wood.roughnessMap,
    bumpMap: wood.roughnessMap,
    bumpScale: 0.008,
    color: wood.colorMap ? 0xffffff : 0xcdb28b,
    roughness: 0.55,
    metalness: 0,
    clearcoat: 0.35,
    clearcoatRoughness: 0.28,
    envMapIntensity: 0.65,
  })
  const laneMesh = new THREE.Mesh(new THREE.PlaneGeometry(laneWidth, LANE_LENGTH), laneMaterial)
  laneMesh.name = 'bowling-lane'
  laneMesh.rotation.x = -Math.PI / 2
  laneMesh.position.set(0, LANE_MESH_SURFACE_Y, LANE_CENTER_Z)
  laneMesh.receiveShadow = true
  scene.add(laneMesh)

  const laneBody = addStaticBox(
    world,
    laneHalfExtents,
    new CANNON.Vec3(0, lanePhysicsBodyY(), LANE_CENTER_Z),
    groundMaterial
  )

  const plainWoodMaterial = laneMaterial.clone()
  plainWoodMaterial.map = plainWood.colorMap
  plainWoodMaterial.roughnessMap = plainWood.roughnessMap
  plainWoodMaterial.bumpMap = plainWood.roughnessMap
  const approach = new THREE.Mesh(new THREE.PlaneGeometry(laneWidth, APPROACH_LENGTH), plainWoodMaterial)
  approach.name = 'bowling-approach'
  approach.rotation.x = -Math.PI / 2
  approach.position.set(0, LANE_MESH_SURFACE_Y, APPROACH_CENTER_Z)
  approach.receiveShadow = true
  scene.add(approach)

  addStaticBox(
    world,
    new CANNON.Vec3(laneWidth / 2, LANE_PHYSICS_HALF_HEIGHT, APPROACH_LENGTH / 2),
    new CANNON.Vec3(0, lanePhysicsBodyY(), APPROACH_CENTER_Z),
    groundMaterial
  )

  const neighborMaterial = laneMaterial.clone()
  neighborMaterial.color.setHex(0xe8dbc8)
  neighborMaterial.roughness = 0.62
  const neighborGutterGeometry = new THREE.BoxGeometry(PHYSICS_CONFIG.GUTTER_WIDTH, GUTTER_DEPTH, LANE_LENGTH)
  const neighborGutterMaterial = new THREE.MeshStandardMaterial({ color: 0x263338, roughness: 0.5, metalness: 0.2 })
  const neighborPins = new THREE.InstancedMesh(createPinGeometry(), createPinMaterial(), 40)
  neighborPins.name = 'bowling-neighbor-pins'
  const transform = new THREE.Object3D()
  ;[-2, -1, 1, 2].forEach((side, index) => {
    const neighbor = new THREE.Mesh(new THREE.PlaneGeometry(laneWidth, LANE_LENGTH), neighborMaterial)
    neighbor.name = `bowling-neighbor-lane-${index}`
    neighbor.rotation.x = -Math.PI / 2
    const centerX = side * (laneWidth + 1.7)
    neighbor.position.set(centerX, LANE_MESH_SURFACE_Y - 0.05, LANE_CENTER_Z)
    neighbor.receiveShadow = true
    scene.add(neighbor)

    const neighborApproach = new THREE.Mesh(new THREE.PlaneGeometry(laneWidth, APPROACH_LENGTH), plainWoodMaterial)
    neighborApproach.rotation.x = -Math.PI / 2
    neighborApproach.position.set(centerX, LANE_MESH_SURFACE_Y - 0.05, APPROACH_CENTER_Z)
    neighborApproach.receiveShadow = true
    scene.add(neighborApproach)
    for (const edge of [-1, 1]) {
      const gutter = new THREE.Mesh(neighborGutterGeometry, neighborGutterMaterial)
      gutter.position.set(centerX + edge * gutterCenterX(), gutterMeshCenterY() - 0.05, LANE_CENTER_Z)
      scene.add(gutter)
    }
    for (let pinIndex = 0; pinIndex < 10; pinIndex++) {
      const [x, y, z] = pinRestPosition(pinIndex)
      transform.position.set(centerX + x, y - 0.05, z)
      transform.updateMatrix()
      neighborPins.setMatrixAt(index * 10 + pinIndex, transform.matrix)
    }
  })
  neighborPins.instanceMatrix.needsUpdate = true
  scene.add(neighborPins)

  const pinDeck = new THREE.Mesh(
    new THREE.BoxGeometry(laneWidth + 0.4, PIN_DECK_THICKNESS, PIN_DECK_LENGTH),
    plainWoodMaterial
  )
  pinDeck.name = 'bowling-pin-deck'
  pinDeck.position.set(0, pinDeckSurfaceY(), PIN_DECK_CENTER_Z)
  pinDeck.receiveShadow = true
  scene.add(pinDeck)

  return { laneMesh, laneBody }
}

export function createBall(
  scene: THREE.Scene,
  world: CANNON.World,
  ballMaterial: CANNON.Material
): BallObject {
  const ballTexture = createBallTexture()
  const ballMesh = new THREE.Mesh(
    new THREE.SphereGeometry(PHYSICS_CONFIG.BALL_RADIUS, 48, 48),
    new THREE.MeshPhysicalMaterial({
      map: ballTexture,
      color: ballTexture ? 0xffffff : 0x1d4ed8,
      roughness: 0.2,
      metalness: 0,
      clearcoat: 0.8,
      clearcoatRoughness: 0.12,
    })
  )
  const [ballX, ballY, ballZ] = ballRestPosition()
  ballMesh.position.set(ballX, ballY, ballZ)
  ballMesh.castShadow = true
  ballMesh.receiveShadow = true
  scene.add(ballMesh)

  const ballBody = new CANNON.Body({
    mass: PHYSICS_CONFIG.BALL_MASS,
    material: ballMaterial,
    linearDamping: 0.1,
    angularDamping: 0.05,
    type: CANNON.Body.DYNAMIC,
  })
  ballBody.addShape(new CANNON.Sphere(PHYSICS_CONFIG.BALL_RADIUS))
  ballBody.position.set(ballX, ballY, ballZ)
  world.addBody(ballBody)

  return { mesh: ballMesh, body: ballBody }
}

export function createPins(
  scene: THREE.Scene,
  world: CANNON.World,
  pinMaterial: CANNON.Material
): PinObject[] {
  const pinGeometry = createPinGeometry()
  const pinMaterial3D = createPinMaterial()

  return Array.from({ length: 10 }, (_, index) => {
    const [x, y, z] = pinRestPosition(index)
    const pinMesh = new THREE.Mesh(pinGeometry, pinMaterial3D)
    pinMesh.position.set(x, y, z)
    pinMesh.castShadow = true
    pinMesh.receiveShadow = true
    scene.add(pinMesh)

    const pinBody = new CANNON.Body({
      mass: PHYSICS_CONFIG.PIN_MASS,
      material: pinMaterial,
      linearDamping: 0.2,
      angularDamping: 0.3,
    })
    pinBody.addShape(
      new CANNON.Cylinder(
        PHYSICS_CONFIG.PIN_RADIUS_TOP,
        PHYSICS_CONFIG.PIN_RADIUS_BOTTOM,
        PHYSICS_CONFIG.PIN_HEIGHT,
        8
      )
    )
    pinBody.position.set(x, y, z)
    world.addBody(pinBody)

    return { mesh: pinMesh, body: pinBody }
  })
}

export function createWalls(scene: THREE.Scene, world: CANNON.World) {
  const sideWallX = wallCenterX()
  const gutterX = gutterCenterX()
  const wallHalfHeight = PHYSICS_CONFIG.WALL_HEIGHT / 2
  const wallHalfExtents = new CANNON.Vec3(
    PHYSICS_CONFIG.WALL_THICKNESS / 2,
    wallHalfHeight,
    WALL_LENGTH / 2
  )

  const createWall = (x: number) => {
    const wallMesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        PHYSICS_CONFIG.WALL_THICKNESS,
        PHYSICS_CONFIG.WALL_HEIGHT,
        WALL_LENGTH
      ),
      new THREE.MeshStandardMaterial({ color: 0x263638, roughness: 0.48, metalness: 0.18 })
    )
    wallMesh.position.set(x, wallHalfHeight, WALL_CENTER_Z)
    scene.add(wallMesh)

    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.035, WALL_LENGTH),
      new THREE.MeshStandardMaterial({
        color: 0xa99164,
        metalness: 0.65,
        roughness: 0.34,
      })
    )
    rail.position.set(x > 0 ? x - 0.2 : x + 0.2, PHYSICS_CONFIG.WALL_HEIGHT + 0.018, WALL_CENTER_Z)
    scene.add(rail)

    addStaticBox(world, wallHalfExtents, new CANNON.Vec3(x, wallHalfHeight, WALL_CENTER_Z))
  }

  createWall(-sideWallX)
  createWall(sideWallX)

  const gutterMaterial = new THREE.MeshStandardMaterial({
    color: 0x242c30,
    metalness: 0.25,
    roughness: 0.55,
  })
  const gutterGeometry = new THREE.BoxGeometry(
    PHYSICS_CONFIG.GUTTER_WIDTH,
    GUTTER_DEPTH,
    WALL_LENGTH
  )
  const gutterHalfExtents = new CANNON.Vec3(
    PHYSICS_CONFIG.GUTTER_WIDTH / 2,
    gutterFloorHalfHeight(),
    WALL_LENGTH / 2
  )
  const gutterBodyY = gutterFloorBodyY()

  const createGutter = (x: number) => {
    const gutter = new THREE.Mesh(gutterGeometry, gutterMaterial)
    gutter.position.set(x, gutterMeshCenterY(), WALL_CENTER_Z)
    scene.add(gutter)

    addStaticBox(world, gutterHalfExtents, new CANNON.Vec3(x, gutterBodyY, WALL_CENTER_Z))
  }

  createGutter(gutterX)
  createGutter(-gutterX)

  // The deck and gutters end at the pit entrance. Catch objects below the lane,
  // with the rear cushion far enough back that it cannot trap a ball on the lip.
  addStaticBox(
    world,
    new CANNON.Vec3(PIT_WIDTH / 2, PIT_WALL_THICKNESS / 2, PIT_LENGTH / 2),
    new CANNON.Vec3(0, PIT_FLOOR_Y - PIT_WALL_THICKNESS / 2, PIT_CENTER_Z)
  )
  addStaticBox(
    world,
    new CANNON.Vec3(PIT_WIDTH / 2, (LANE_SURFACE_Y - PIT_FLOOR_Y) / 2, PIT_WALL_THICKNESS / 2),
    new CANNON.Vec3(0, (LANE_SURFACE_Y + PIT_FLOOR_Y) / 2, LANE_END_Z + PIT_WALL_THICKNESS / 2)
  )

  const pitWallHeight = PIT_OPENING_HEIGHT - PIT_FLOOR_Y
  const pitWallY = PIT_FLOOR_Y + pitWallHeight / 2
  ;[-1, 1].forEach(side => {
    addStaticBox(
      world,
      new CANNON.Vec3(PIT_WALL_THICKNESS / 2, pitWallHeight / 2, PIT_LENGTH / 2),
      new CANNON.Vec3(side * (PIT_WIDTH + PIT_WALL_THICKNESS) / 2, pitWallY, PIT_CENTER_Z)
    )
  })

  addStaticBox(
    world,
    new CANNON.Vec3(
      PIT_WIDTH / 2,
      pitWallHeight / 2,
      BACK_WALL_THICKNESS / 2
    ),
    new CANNON.Vec3(0, pitWallY, BACK_WALL_CENTER_Z)
  )
}

export function createLighting(scene: THREE.Scene) {
  scene.add(new THREE.AmbientLight(0xf5ead9, 0.35))
  scene.add(new THREE.HemisphereLight(0xf4efe5, 0x424d51, 0.85))

  const mainLight = new THREE.DirectionalLight(0xfff0d9, 1.65)
  mainLight.position.set(-8, 14, 8)
  mainLight.target.position.set(0, 0, -12)
  mainLight.castShadow = true
  mainLight.shadow.mapSize.set(2048, 2048)
  mainLight.shadow.camera.near = 0.1
  mainLight.shadow.camera.far = 70
  mainLight.shadow.camera.left = -22
  mainLight.shadow.camera.right = 22
  mainLight.shadow.camera.top = 20
  mainLight.shadow.camera.bottom = -20
  mainLight.shadow.bias = -0.0004
  mainLight.shadow.normalBias = 0.025
  scene.add(mainLight)
  scene.add(mainLight.target)

  const pinSpot = new THREE.SpotLight(0xfff4e6, 95, 22, Math.PI / 4, 0.75, 2)
  pinSpot.position.set(0, 7.6, -17)
  pinSpot.target.position.set(0, 0.8, -20)
  scene.add(pinSpot)
  scene.add(pinSpot.target)

  // Practical pools of light separate the approach, lane, and pin deck.
  ;[10, -3, -17].forEach(z => {
    const light = new THREE.PointLight(0xffe7c2, 65, 24, 2)
    light.position.set(0, 6.7, z)
    scene.add(light)
  })

  const rearFill = new THREE.PointLight(0xf0d7b2, 48, 20, 2)
  rearFill.position.set(0, 5.7, -24.5)
  scene.add(rearFill)
}
