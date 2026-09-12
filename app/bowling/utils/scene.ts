import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { PHYSICS_CONFIG } from '../config/constants'
import type { PhysicsMaterials, SceneElements, BallObject, PinObject } from '../types/scene'
import { addStaticBox } from './colliders'
import {
  APPROACH_CENTER_Z,
  APPROACH_LENGTH,
  BACK_WALL_CENTER_Z,
  BACK_WALL_THICKNESS,
  GUTTER_DEPTH,
  LANE_CENTER_Z,
  LANE_LENGTH,
  LANE_MESH_SURFACE_Y,
  LANE_PHYSICS_HALF_HEIGHT,
  LANE_SURFACE_Y,
  PIN_DECK_CENTER_Z,
  PIN_DECK_THICKNESS,
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

function createWoodTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 1024
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.fillStyle = '#c28a4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let y = 0; y < canvas.height; y++) {
    const shade = 0.88 + Math.sin(y * 0.09) * 0.06 + Math.sin(y * 0.31) * 0.03
    ctx.fillStyle = `rgba(90, 48, 18, ${0.08 + (1 - shade) * 0.12})`
    ctx.fillRect(0, y, canvas.width, 1)
  }

  ctx.strokeStyle = 'rgba(70, 36, 12, 0.22)'
  ctx.lineWidth = 2
  for (let x = 18; x < canvas.width; x += 36) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + 4, canvas.height)
    ctx.stroke()
  }

  ctx.fillStyle = '#1f140c'
  ctx.fillRect(0, canvas.height * 0.31, canvas.width, 5)

  ctx.fillStyle = '#111111'
  const arrowY = canvas.height * 0.42
  for (const x of [48, 88, 128, 168, 208]) {
    ctx.beginPath()
    ctx.moveTo(x, arrowY)
    ctx.lineTo(x - 8, arrowY + 18)
    ctx.lineTo(x + 8, arrowY + 18)
    ctx.closePath()
    ctx.fill()
  }

  ctx.fillStyle = '#2a1810'
  for (const y of [0.78, 0.84, 0.9]) {
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height * y, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

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
  ctx.fillRect(0, canvas.height * 0.58, canvas.width, canvas.height * 0.12)

  const texture = new THREE.CanvasTexture(canvas)
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

export function createSceneElements(
  scene: THREE.Scene,
  world: CANNON.World,
  materials: PhysicsMaterials
): SceneElements {
  const { groundMaterial } = materials
  const woodTexture = createWoodTexture()

  const laneWidth = PHYSICS_CONFIG.LANE_WIDTH
  const laneHalfExtents = new CANNON.Vec3(
    laneWidth / 2,
    LANE_PHYSICS_HALF_HEIGHT,
    LANE_LENGTH / 2
  )
  const laneMaterial = new THREE.MeshStandardMaterial({
    map: woodTexture,
    color: woodTexture ? 0xffffff : 0xc28a4b,
    roughness: 0.42,
    metalness: 0.04,
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

  const approach = new THREE.Mesh(new THREE.PlaneGeometry(laneWidth, APPROACH_LENGTH), laneMaterial)
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

  const neighborMaterial = new THREE.MeshStandardMaterial({
    map: woodTexture,
    color: woodTexture ? 0xd4a574 : 0x8a5a32,
    roughness: 0.55,
    metalness: 0.03,
  })
  ;[-2, -1, 1, 2].forEach((side, index) => {
    const neighbor = new THREE.Mesh(new THREE.PlaneGeometry(laneWidth, LANE_LENGTH), neighborMaterial)
    neighbor.name = `bowling-neighbor-lane-${index}`
    neighbor.rotation.x = -Math.PI / 2
    neighbor.position.set(side * (laneWidth + 1.7), LANE_MESH_SURFACE_Y - 0.05, LANE_CENTER_Z)
    neighbor.receiveShadow = true
    scene.add(neighbor)
  })

  const pinDeck = new THREE.Mesh(
    new THREE.BoxGeometry(laneWidth + 0.4, PIN_DECK_THICKNESS, 5),
    new THREE.MeshStandardMaterial({ color: 0xa56b34, roughness: 0.5 })
  )
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
    new THREE.MeshStandardMaterial({
      map: ballTexture,
      color: ballTexture ? 0xffffff : 0x1d4ed8,
      roughness: 0.28,
      metalness: 0.22,
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
  const pinHeight = PHYSICS_CONFIG.PIN_HEIGHT
  const pinGeometry = new THREE.LatheGeometry(
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

  const pinMaterial3D = new THREE.MeshStandardMaterial({
    map: createPinTexture(),
    roughness: 0.35,
    metalness: 0.05,
  })

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
      new THREE.MeshStandardMaterial({ color: 0x2a1c16, roughness: 0.8 })
    )
    wallMesh.position.set(x, wallHalfHeight, WALL_CENTER_Z)
    scene.add(wallMesh)

    const neon = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.08, WALL_LENGTH),
      new THREE.MeshStandardMaterial({
        color: 0x67e8f9,
        emissive: 0x22d3ee,
        emissiveIntensity: 2.4,
      })
    )
    neon.position.set(x > 0 ? x - 0.22 : x + 0.22, LANE_SURFACE_Y + 0.18, WALL_CENTER_Z)
    scene.add(neon)

    addStaticBox(world, wallHalfExtents, new CANNON.Vec3(x, wallHalfHeight, WALL_CENTER_Z))
  }

  createWall(-sideWallX)
  createWall(sideWallX)

  const gutterMaterial = new THREE.MeshStandardMaterial({
    color: 0x111827,
    metalness: 0.35,
    roughness: 0.45,
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

  addStaticBox(
    world,
    new CANNON.Vec3(
      PHYSICS_CONFIG.LANE_WIDTH / 2 + PHYSICS_CONFIG.GUTTER_WIDTH + 0.5,
      wallHalfHeight,
      BACK_WALL_THICKNESS / 2
    ),
    new CANNON.Vec3(0, wallHalfHeight, BACK_WALL_CENTER_Z)
  )
}

export function createLighting(scene: THREE.Scene) {
  scene.add(new THREE.AmbientLight(0xfff1de, 0.42))
  scene.add(new THREE.HemisphereLight(0xffe8c8, 0x3b2a38, 0.85))

  const mainLight = new THREE.DirectionalLight(0xfff4e5, 0.95)
  mainLight.position.set(3, 14, 10)
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
  scene.add(mainLight)
  scene.add(mainLight.target)

  const laneSpot = new THREE.SpotLight(0xfff7ed, 1.25, 42, Math.PI / 6, 0.5, 1.1)
  laneSpot.position.set(0, 10, 6)
  laneSpot.target.position.set(0, 0, -8)
  laneSpot.castShadow = true
  scene.add(laneSpot)
  scene.add(laneSpot.target)

  const pinSpot = new THREE.SpotLight(0xffffff, 1.8, 28, Math.PI / 8, 0.28, 1.1)
  pinSpot.position.set(0, 8.4, -10)
  pinSpot.target.position.set(0, 0.8, -20)
  pinSpot.castShadow = true
  scene.add(pinSpot)
  scene.add(pinSpot.target)

  const roomFill = new THREE.PointLight(0xffd7a8, 0.55, 48)
  roomFill.position.set(0, 5.5, 2)
  scene.add(roomFill)

  const rearFill = new THREE.PointLight(0xffc98a, 0.45, 22)
  rearFill.position.set(0, 4.8, -22)
  scene.add(rearFill)
}
