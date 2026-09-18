import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { createSeededRandom } from '../../../utils/seededRandom'

export function RangeGround({
  outdoor = false,
  night = false,
}: {
  outdoor?: boolean
  night?: boolean
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const rand = createSeededRandom(1937)
      ctx.fillStyle = outdoor ? '#98a481' : '#b1b5b1'
      ctx.fillRect(0, 0, 256, 256)
      const data = ctx.getImageData(0, 0, 256, 256)
      for (let i = 0; i < data.data.length; i += 4) {
        const variation = (rand() - 0.5) * 16
        data.data[i] += variation
        data.data[i + 1] += variation
        data.data[i + 2] += variation
      }
      ctx.putImageData(data, 0, 0)
      if (outdoor) {
        for (let i = 0; i < 48; i++) {
          const x = rand() * 256,
            y = rand() * 256,
            radius = 8 + rand() * 20
          const g = ctx.createRadialGradient(x, y, 0, x, y, radius)
          g.addColorStop(0, 'rgba(60,80,37,.13)')
          g.addColorStop(1, 'rgba(60,80,37,0)')
          ctx.fillStyle = g
          ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
        }
      }
    }
    const result = new THREE.CanvasTexture(canvas)
    result.wrapS = result.wrapT = THREE.RepeatWrapping
    result.repeat.set(outdoor ? 34 : 8, outdoor ? 34 : 14)
    result.colorSpace = THREE.SRGBColorSpace
    result.anisotropy = 4
    return result
  }, [outdoor])
  useEffect(() => () => texture.dispose(), [texture])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.997, outdoor ? -38 : -20]}>
      <planeGeometry args={outdoor ? [240, 240] : [38, 66]} />
      <meshStandardMaterial
        map={texture}
        color={outdoor ? (night ? '#58664f' : '#899468') : '#7f8a83'}
        roughness={0.93}
      />
    </mesh>
  )
}

export function PineForest({ trees }: { trees: Array<{ x: number; z: number; h: number }> }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const transform = new THREE.Object3D(),
      color = new THREE.Color()
    trees.forEach((tree, index) => {
      for (let tier = 0; tier < 2; tier++) {
        transform.position.set(tree.x, tree.h * (tier ? 0.25 : 0.55) - 0.2, tree.z)
        transform.scale.set(tier ? 3.1 : 2.5, tree.h * (tier ? 0.7 : 1), tier ? 3.1 : 2.5)
        transform.updateMatrix()
        mesh.setMatrixAt(index * 2 + tier, transform.matrix)
        mesh.setColorAt(index * 2 + tier, color.set(index % 3 === 0 ? '#596f55' : '#395b4e'))
      }
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [trees])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, trees.length * 2]}>
      <coneGeometry args={[1, 1, 7]} />
      <meshStandardMaterial roughness={1} />
    </instancedMesh>
  )
}

export function RidgeLine({ night }: { night: boolean }) {
  const geometry = useMemo(() => {
    const rand = createSeededRandom(3901),
      vertices: number[] = []
    const samples = 20,
      heights = Array.from({ length: samples + 1 }, () => 10 + rand() * 14)
    for (let i = 0; i < samples; i++) {
      const x = -140 + i * 14,
        nx = x + 14,
        h = heights[i],
        nh = heights[i + 1]
      vertices.push(x, -3, 0, nx, -3, 0, x, h, -12, nx, -3, 0, nx, nh, -12, x, h, -12)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    g.computeVertexNormals()
    return g
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <mesh geometry={geometry} position={[0, 0, -102]}>
      <meshStandardMaterial
        color={night ? '#354e55' : '#8fa4a0'}
        side={THREE.DoubleSide}
        roughness={1}
      />
    </mesh>
  )
}

export function RangeSky({ color, night }: { color: string; night: boolean }) {
  const uniforms = useMemo(
    () => ({
      top: { value: new THREE.Color(color) },
      horizon: { value: new THREE.Color(night ? '#253b43' : '#dae0cc') },
    }),
    [color, night]
  )
  return (
    <mesh scale={170}>
      <sphereGeometry args={[1, 24, 12]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader="varying vec3 v; void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}"
        fragmentShader={
          'varying vec3 v; uniform vec3 top; uniform vec3 horizon; void main(){gl_FragColor=vec4(mix(horizon,top,smoothstep(0.0,0.65,normalize(v).y)),1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'
        }
      />
    </mesh>
  )
}
