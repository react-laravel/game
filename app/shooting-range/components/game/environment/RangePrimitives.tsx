import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

type Vec3 = [number, number, number]
export interface Block {
  position: Vec3
  size: Vec3
  rotation?: Vec3
}

/** Architectural modules sharing a surface use one draw call. */
export function Blocks({
  items,
  color,
  metalness = 0,
  roughness = 0.82,
  emissive = false,
}: {
  items: Block[]
  color: string
  metalness?: number
  roughness?: number
  emissive?: boolean
}) {
  const ref = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const transform = new THREE.Object3D()
    items.forEach((item, index) => {
      transform.position.set(...item.position)
      transform.rotation.set(...(item.rotation ?? [0, 0, 0]))
      transform.scale.set(...item.size)
      transform.updateMatrix()
      mesh.setMatrixAt(index, transform.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [items])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} receiveShadow>
      <boxGeometry />
      {emissive ? (
        <meshBasicMaterial color={color} />
      ) : (
        <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
      )}
    </instancedMesh>
  )
}

export function BlockMesh({ position, size, color, rotation }: Block & { color: string }) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  )
}

/** Locally rendered signage; no network font dependency. */
export function RangeSign({
  text,
  caption = 'PRECISION TRAINING',
  position,
  rotation,
  width = 6,
}: {
  text: string
  caption?: string
  position: Vec3
  rotation?: Vec3
  width?: number
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 768
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#202b2d'
      ctx.fillRect(0, 0, 768, 256)
      ctx.fillStyle = '#ef8d4b'
      ctx.fillRect(32, 36, 6, 176)
      ctx.fillStyle = '#f4f1e8'
      ctx.font = '600 92px sans-serif'
      ctx.fillText(text, 64, 137)
      ctx.fillStyle = '#9faeac'
      ctx.font = '21px monospace'
      ctx.fillText(caption, 67, 190)
    }
    const result = new THREE.CanvasTexture(canvas)
    result.colorSpace = THREE.SRGBColorSpace
    return result
  }, [text, caption])
  useEffect(() => () => texture.dispose(), [texture])
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, width / 3]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  )
}
