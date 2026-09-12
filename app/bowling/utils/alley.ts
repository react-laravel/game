import * as THREE from 'three'

function createCarpetTexture(): THREE.CanvasTexture | null {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.fillStyle = '#6b2b55'
  ctx.fillRect(0, 0, 256, 256)

  ctx.fillStyle = '#2f4d78'
  for (let y = 0; y < 256; y += 28) {
    for (let x = 0; x < 256; x += 28) {
      if (((x + y) / 28) % 2 === 0) {
        ctx.beginPath()
        ctx.moveTo(x + 14, y)
        ctx.lineTo(x + 28, y + 14)
        ctx.lineTo(x + 14, y + 28)
        ctx.lineTo(x, y + 14)
        ctx.closePath()
        ctx.fill()
      }
    }
  }

  ctx.strokeStyle = 'rgba(245, 196, 90, 0.18)'
  ctx.lineWidth = 2
  for (let i = -256; i < 512; i += 36) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + 256, 256)
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(16, 18)
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

function addMesh(
  scene: THREE.Scene,
  name: string,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: [number, number, number],
  receiveShadow = true
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = name
  mesh.position.set(...position)
  mesh.receiveShadow = receiveShadow
  mesh.castShadow = false
  scene.add(mesh)
  return mesh
}

/** 球馆地面、墙面、天花板和置瓶机，避免球道以外只剩黑洞。 */
export function createAlleyInterior(scene: THREE.Scene): void {
  const carpetTexture = createCarpetTexture()
  const carpetMaterial = new THREE.MeshStandardMaterial({
    map: carpetTexture,
    color: carpetTexture ? 0xffffff : 0x6b2b55,
    roughness: 0.9,
    metalness: 0,
  })

  const floor = addMesh(scene, 'bowling-floor', new THREE.PlaneGeometry(72, 86), carpetMaterial, [
    0, -0.16, -8,
  ])
  floor.rotation.x = -Math.PI / 2

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x5a4638,
    roughness: 0.82,
    metalness: 0.04,
  })
  const wainscotMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d2118,
    roughness: 0.7,
  })

  addMesh(scene, 'bowling-wall-left', new THREE.BoxGeometry(0.6, 8.4, 86), wallMaterial, [-22, 4.1, -8])
  addMesh(scene, 'bowling-wall-right', new THREE.BoxGeometry(0.6, 8.4, 86), wallMaterial, [22, 4.1, -8])
  addMesh(scene, 'bowling-wainscot-left', new THREE.BoxGeometry(0.2, 1.4, 86), wainscotMaterial, [
    -21.65, 0.7, -8,
  ])
  addMesh(scene, 'bowling-wainscot-right', new THREE.BoxGeometry(0.2, 1.4, 86), wainscotMaterial, [
    21.65, 0.7, -8,
  ])

  const backWall = addMesh(
    scene,
    'bowling-back-wall',
    new THREE.BoxGeometry(45, 8.4, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x3a2c24, roughness: 0.86 }),
    [0, 4.1, -27.2]
  )
  backWall.castShadow = true

  const ceiling = addMesh(
    scene,
    'bowling-ceiling',
    new THREE.PlaneGeometry(72, 86),
    new THREE.MeshStandardMaterial({ color: 0x4a4036, roughness: 0.88 }),
    [0, 8.3, -8]
  )
  ceiling.rotation.x = Math.PI / 2

  const lightMaterial = new THREE.MeshStandardMaterial({
    color: 0xfff4d6,
    emissive: 0xffe7b0,
    emissiveIntensity: 1.8,
    roughness: 0.35,
  })
  ;[-12, -4, 4, 10].forEach((z, index) => {
    addMesh(
      scene,
      `bowling-ceiling-light-${index}`,
      new THREE.BoxGeometry(2.4, 0.12, 6.5),
      lightMaterial,
      [0, 8.18, z],
      false
    )
  })

  const pinsetterMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a3340,
    roughness: 0.45,
    metalness: 0.28,
  })
  addMesh(scene, 'bowling-pinsetter', new THREE.BoxGeometry(8.6, 3.6, 3.4), pinsetterMaterial, [
    0, 2.55, -24.1,
  ])

  addMesh(
    scene,
    'bowling-pinsetter-hood',
    new THREE.BoxGeometry(8.8, 0.35, 3.8),
    new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5, metalness: 0.2 }),
    [0, 4.4, -24]
  )

  addMesh(
    scene,
    'bowling-pin-pit',
    new THREE.BoxGeometry(8.2, 1.8, 3),
    new THREE.MeshStandardMaterial({ color: 0x0f1115, roughness: 0.92 }),
    [0, 0.7, -23.6]
  )

  const stripe = addMesh(
    scene,
    'bowling-pinsetter-stripe',
    new THREE.BoxGeometry(8.2, 0.18, 0.12),
    new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 1.4,
    }),
    [0, 3.7, -22.35],
    false
  )
  stripe.castShadow = false

  const sign = addMesh(
    scene,
    'bowling-sign',
    new THREE.PlaneGeometry(7.2, 1.1),
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.35,
    }),
    [0, 6.4, -26.7],
    false
  )
  sign.castShadow = false

  const seatingMaterial = new THREE.MeshStandardMaterial({
    color: 0x7c2d12,
    roughness: 0.7,
  })
  ;[-1, 1].forEach(side => {
    addMesh(
      scene,
      side < 0 ? 'bowling-seating-left' : 'bowling-seating-right',
      new THREE.BoxGeometry(6.5, 0.55, 8),
      seatingMaterial,
      [side * 14.5, 0.28, 11]
    )
  })
}
