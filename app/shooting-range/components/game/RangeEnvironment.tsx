import { useEffect, useMemo } from 'react'
import { Sky } from '@react-three/drei'
import * as THREE from 'three'
import type { MapConfig } from '../../utils/mapConfigs'
import type { OutdoorTimeOfDay } from '../../types'
import {
  resolveOutdoorEnvironment,
  type OutdoorSkyParams,
} from '../../utils/outdoorTimeOfDay'
import { createSeededRandom } from '../../utils/seededRandom'

interface RangeEnvironmentProps {
  config: MapConfig
  outdoorTimeOfDay?: OutdoorTimeOfDay
}

/** Lowered so troffer rows sit inside the FPS upper field of view (~8m room height). */
const INDOOR_CEILING_Y = 8.25

function createCanvasTexture(
  width: number,
  height: number,
  paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  repeat = 4
) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  paint(ctx, width, height)
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(repeat, repeat)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function useGrassTexture() {
  return useMemo(
    () =>
      createCanvasTexture(256, 256, (ctx, w, h) => {
        const rand = createSeededRandom(0x67a34c)
        ctx.fillStyle = '#4a7a48'
        ctx.fillRect(0, 0, w, h)
        for (let i = 0; i < 4200; i += 1) {
          const x = rand() * w
          const y = rand() * h
          const shade = rand()
          ctx.fillStyle =
            shade > 0.82
              ? 'rgba(90, 68, 42, 0.35)'
              : shade > 0.55
                ? `rgba(${58 + rand() * 28}, ${108 + rand() * 32}, ${58 + rand() * 22}, 0.55)`
                : `rgba(${42 + rand() * 18}, ${92 + rand() * 24}, ${48 + rand() * 16}, 0.45)`
          ctx.fillRect(x, y, 1 + rand() * 2, 1 + rand() * 3)
        }
      }, 6),
    []
  )
}

function useGravelTexture() {
  return useMemo(
    () =>
      createCanvasTexture(128, 128, (ctx, w, h) => {
        const rand = createSeededRandom(0x8a7a62)
        ctx.fillStyle = '#8a7a62'
        ctx.fillRect(0, 0, w, h)
        for (let i = 0; i < 900; i += 1) {
          const x = rand() * w
          const y = rand() * h
          const size = 1 + rand() * 2.5
          const tone = 110 + rand() * 50
          ctx.fillStyle = `rgb(${tone}, ${tone - 12}, ${tone - 28})`
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }
      }, 3),
    []
  )
}

function useEarthTexture() {
  return useMemo(
    () =>
      createCanvasTexture(128, 128, (ctx, w, h) => {
        const rand = createSeededRandom(0x6a5840)
        ctx.fillStyle = '#6a5840'
        ctx.fillRect(0, 0, w, h)
        for (let i = 0; i < 700; i += 1) {
          const x = rand() * w
          const y = rand() * h
          const tone = 80 + rand() * 45
          ctx.fillStyle = `rgba(${tone + 18}, ${tone}, ${tone - 22}, 0.65)`
          ctx.fillRect(x, y, 2 + rand() * 4, 1 + rand() * 3)
        }
      }, 2),
    []
  )
}

/** Recessed troffer — solid metal housing + emissive box face (no stacked planes). */
function CeilingTroffer({
  x,
  z,
  accent,
  intensity = 1.35,
}: {
  x: number
  z: number
  accent: string
  intensity?: number
}) {
  return (
    <group position={[x, INDOOR_CEILING_Y - 0.06, z]}>
      <mesh>
        <boxGeometry args={[3.2, 0.2, 1.65]} />
        <meshStandardMaterial color="#8a9aaa" metalness={0.48} roughness={0.38} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[2.75, 0.08, 1.3]} />
        <meshStandardMaterial
          color="#f6fcff"
          emissive={accent}
          emissiveIntensity={2.1}
          roughness={0.32}
          toneMapped={false}
        />
      </mesh>
      <pointLight intensity={intensity} distance={18} color="#eef8ff" decay={2} position={[0, -0.22, 0]} />
    </group>
  )
}

function CeilingSoffitRow({
  z,
  accent,
  width = 32,
}: {
  z: number
  accent: string
  width?: number
}) {
  return (
    <group position={[0, INDOOR_CEILING_Y - 0.87, z]}>
      <mesh>
        <boxGeometry args={[width, 0.32, 1.4]} />
        <meshStandardMaterial color="#8a9aaa" metalness={0.4} roughness={0.42} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[width - 1.5, 0.12, 1.1]} />
        <meshStandardMaterial
          color="#f8fcff"
          emissive={accent}
          emissiveIntensity={1.85}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, -0.16, 0]}>
        <boxGeometry args={[width - 3, 0.06, 0.85]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#e8f8ff"
          emissiveIntensity={1.35}
          toneMapped={false}
        />
      </mesh>
      <pointLight intensity={1.1} distance={16} color="#eef8ff" decay={2} position={[0, -0.3, 0]} />
    </group>
  )
}

function IndoorCeilingLighting({ accent }: { accent: string }) {
  const trofferSlots = useMemo(() => {
    const slots: Array<{ x: number; z: number }> = []
    for (const z of [-10, -24, -38]) {
      for (const x of [-12, 0, 12]) {
        slots.push({ x, z })
      }
    }
    return slots
  }, [])

  const stripZs = [-6, -20, -34, -48]
  const soffitZs = [-4, -18, -32, -46]

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, INDOOR_CEILING_Y + 0.06, -24]}>
        <planeGeometry args={[38, 56]} />
        <meshStandardMaterial color="#dce8ee" roughness={0.88} metalness={0.04} side={THREE.DoubleSide} />
      </mesh>

      {[-17.6, 17.6].map(x => (
        <mesh key={`crown-${x}`} position={[x, INDOOR_CEILING_Y - 0.37, -22]}>
          <boxGeometry args={[0.35, 0.65, 54]} />
          <meshStandardMaterial color="#c8dce8" roughness={0.55} metalness={0.2} />
        </mesh>
      ))}

      {[-10, 10].map(x => (
        <mesh key={`beam-${x}`} position={[x, INDOOR_CEILING_Y + 0.06, -22]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[56, 0.28, 0.42]} />
          <meshStandardMaterial color="#9aacb8" metalness={0.42} roughness={0.45} />
        </mesh>
      ))}

      {[-14, 0, 14].map(x => (
        <mesh key={`duct-${x}`} position={[x, INDOOR_CEILING_Y - 0.87, -24]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[54, 0.5, 0.5]} />
          <meshStandardMaterial color="#9aacb8" metalness={0.55} roughness={0.38} />
        </mesh>
      ))}

      {stripZs.map(z => (
        <CeilingLightStrip key={z} z={z} accent={accent} intensity={2.15} width={28} />
      ))}

      {trofferSlots.map(slot => (
        <CeilingTroffer key={`${slot.x}-${slot.z}`} x={slot.x} z={slot.z} accent={accent} intensity={1.45} />
      ))}

      {soffitZs.map(z => (
        <CeilingSoffitRow key={z} z={z} accent={accent} width={28} />
      ))}
    </>
  )
}

function CeilingLightStrip({
  z,
  accent,
  intensity,
  width = 16,
}: {
  z: number
  accent: string
  intensity: number
  width?: number
}) {
  return (
    <group position={[0, INDOOR_CEILING_Y - 0.17, z]}>
      <mesh>
        <boxGeometry args={[width, 0.14, 0.55]} />
        <meshStandardMaterial
          color="#e8f4fc"
          emissive={accent}
          emissiveIntensity={1.12}
          roughness={0.32}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[width + 0.6, 0.06, 0.72]} />
        <meshStandardMaterial color="#8a9aa8" metalness={0.35} roughness={0.55} />
      </mesh>
      <pointLight intensity={intensity} distance={20} color={accent} decay={2} position={[0, -0.2, 0]} />
    </group>
  )
}

function WallSconce({ x, z, color }: { x: number; z: number; color: string }) {
  return (
    <group position={[x, 4.2, z]}>
      <mesh>
        <boxGeometry args={[0.12, 0.35, 0.22]} />
        <meshStandardMaterial color="#8a9aaa" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[x > 0 ? -0.08 : 0.08, 0, 0]}>
        <boxGeometry args={[0.08, 0.22, 0.16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      <pointLight intensity={0.65} distance={11} color={color} decay={2} />
    </group>
  )
}

function AcousticFoamGrid({ x, z, facing }: { x: number; z: number; facing: 'left' | 'right' }) {
  const panels = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        y: 3.2 + (i % 6) * 1.35,
        zOff: -22 + Math.floor(i / 6) * 14,
      })),
    []
  )

  return (
    <group position={[x, 0, z]}>
      {panels.map((panel, i) => (
        <mesh
          key={i}
          position={[facing === 'left' ? 0.12 : -0.12, panel.y, panel.zOff]}
          rotation={[0, facing === 'left' ? Math.PI / 2 : -Math.PI / 2, 0]}
        >
          <boxGeometry args={[1.05, 1.05, 0.14]} />
          <meshStandardMaterial color="#6a8898" metalness={0.08} roughness={0.82} />
        </mesh>
      ))}
    </group>
  )
}

function TreeSilhouette({ height = 5.2, width = 1.6 }: { height?: number; width?: number }) {
  return (
    <mesh position={[0, height * 0.48, -0.35]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial color="#0a1410" transparent opacity={0.42} toneMapped={false} depthWrite={false} />
    </mesh>
  )
}

function EvergreenTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const foliage = useMemo(
    () => [
      { pos: [0, 2.4, 0] as [number, number, number], r: 1.05, color: '#1f4a28' },
      { pos: [0, 3.35, 0] as [number, number, number], r: 0.92, color: '#255430' },
      { pos: [0, 4.15, 0] as [number, number, number], r: 0.72, color: '#2c6034' },
      { pos: [-0.38, 3.0, 0.22] as [number, number, number], r: 0.62, color: '#22502c' },
      { pos: [0.35, 2.85, -0.18] as [number, number, number], r: 0.58, color: '#285832' },
      { pos: [0.12, 4.55, 0.08] as [number, number, number], r: 0.48, color: '#32683a' },
    ],
    []
  )

  return (
    <group position={position} scale={scale}>
      <TreeSilhouette height={5.4} width={1.45} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.55, 12]} />
        <meshBasicMaterial color="#1a2818" transparent opacity={0.35} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.24, 2.3, 8]} />
        <meshStandardMaterial color="#4a3828" roughness={0.96} />
      </mesh>
      {foliage.map((cluster, i) => (
        <mesh key={i} position={cluster.pos} castShadow>
          <icosahedronGeometry args={[cluster.r, 2]} />
          <meshStandardMaterial color={cluster.color} roughness={0.88} metalness={0.02} />
        </mesh>
      ))}
    </group>
  )
}

function DeciduousTree({
  position,
  scale = 1,
}: {
  position: [number, number, number]
  scale?: number
}) {
  const foliage = useMemo(
    () => [
      { pos: [0, 3.5, 0] as [number, number, number], r: 1.2, color: '#2e6434' },
      { pos: [-0.62, 3.05, 0.12] as [number, number, number], r: 0.88, color: '#34703a' },
      { pos: [0.58, 3.15, -0.18] as [number, number, number], r: 0.82, color: '#306838' },
      { pos: [0.18, 4.05, 0.28] as [number, number, number], r: 0.68, color: '#3a783e' },
      { pos: [-0.22, 3.75, -0.38] as [number, number, number], r: 0.6, color: '#285c2e' },
      { pos: [0.45, 3.45, 0.42] as [number, number, number], r: 0.55, color: '#327036' },
      { pos: [-0.15, 4.35, -0.12] as [number, number, number], r: 0.45, color: '#3e7c42' },
    ],
    []
  )

  return (
    <group position={position} scale={scale}>
      <TreeSilhouette height={5.8} width={1.75} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.65, 12]} />
        <meshBasicMaterial color="#1a2818" transparent opacity={0.32} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.18, 2.9, 8]} />
        <meshStandardMaterial color="#5a4532" roughness={0.95} />
      </mesh>
      {foliage.map((cluster, i) => (
        <mesh key={i} position={cluster.pos} castShadow>
          <icosahedronGeometry args={[cluster.r, 2]} />
          <meshStandardMaterial color={cluster.color} roughness={0.86} metalness={0.02} />
        </mesh>
      ))}
    </group>
  )
}

function UmbrellaTree({
  position,
  scale = 1,
}: {
  position: [number, number, number]
  scale?: number
}) {
  const canopyLayers = useMemo(
    () => [
      { pos: [0, 4.1, 0] as [number, number, number], r: 1.45, color: '#2f6836' },
      { pos: [0.28, 4.35, -0.18] as [number, number, number], r: 0.95, color: '#3a783e' },
      { pos: [-0.32, 3.95, 0.22] as [number, number, number], r: 0.82, color: '#286030' },
    ],
    []
  )

  return (
    <group position={position} scale={scale}>
      <TreeSilhouette height={5.6} width={2.1} />
      <mesh position={[0, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 2.7, 8]} />
        <meshStandardMaterial color="#5a4838" roughness={0.94} />
      </mesh>
      {canopyLayers.map((layer, i) => (
        <mesh key={i} position={layer.pos} scale={[1.15, 0.55, 1.05]} castShadow>
          <icosahedronGeometry args={[layer.r, 1]} />
          <meshStandardMaterial color={layer.color} roughness={0.84} metalness={0.02} />
        </mesh>
      ))}
    </group>
  )
}

function SparseTree({
  position,
  scale = 1,
}: {
  position: [number, number, number]
  scale?: number
}) {
  const foliage = useMemo(
    () => [
      { pos: [0.42, 3.2, 0.15] as [number, number, number], r: 0.78, color: '#3a743c' },
      { pos: [-0.55, 3.85, -0.22] as [number, number, number], r: 0.92, color: '#2e6434' },
      { pos: [0.08, 4.55, 0.35] as [number, number, number], r: 0.62, color: '#427a44' },
    ],
    []
  )

  return (
    <group position={position} scale={scale}>
      <TreeSilhouette height={5.2} width={1.35} />
      <mesh position={[0, 1.55, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.16, 3.1, 8]} />
        <meshStandardMaterial color="#6a5438" roughness={0.95} />
      </mesh>
      {foliage.map((cluster, i) => (
        <mesh key={i} position={cluster.pos} castShadow>
          <dodecahedronGeometry args={[cluster.r, 0]} />
          <meshStandardMaterial color={cluster.color} roughness={0.88} metalness={0.02} />
        </mesh>
      ))}
    </group>
  )
}

function BushClump({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const blobs = useMemo(
    () => [
      { pos: [0, 0.35, 0] as [number, number, number], r: 0.55 },
      { pos: [-0.35, 0.25, 0.2] as [number, number, number], r: 0.42 },
      { pos: [0.3, 0.28, -0.15] as [number, number, number], r: 0.38 },
    ],
    []
  )

  return (
    <group position={position} scale={scale}>
      {blobs.map((blob, i) => (
        <mesh key={i} position={blob.pos} castShadow>
          <icosahedronGeometry args={[blob.r, 1]} />
          <meshStandardMaterial color={['#3a6840', '#427048', '#366038'][i % 3]} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function OutdoorSky({
  sky,
  horizonWash,
  crispNight = false,
}: {
  sky: OutdoorSkyParams
  horizonWash?: { color: string; opacity: number }
  crispNight?: boolean
}) {
  const cloudBanks = useMemo(
    () => [
      { pos: [-24, 28, -82] as [number, number, number], scale: [14, 3.2, 5] as [number, number, number], opacity: 0.12 },
      { pos: [18, 30, -78] as [number, number, number], scale: [12, 2.8, 4.5] as [number, number, number], opacity: 0.1 },
      { pos: [-6, 32, -92] as [number, number, number], scale: [18, 3.5, 6] as [number, number, number], opacity: 0.11 },
      { pos: [32, 26, -68] as [number, number, number], scale: [10, 2.4, 4] as [number, number, number], opacity: 0.08 },
    ],
    []
  )
  const cloudOpacityScale = crispNight ? 0.28 : 1
  const sunGlowOpacity = crispNight ? 0.04 : 0.14

  return (
    <>
      <Sky
        distance={450000}
        sunPosition={sky.sunPosition}
        mieCoefficient={sky.mieCoefficient}
        mieDirectionalG={sky.mieDirectionalG}
        rayleigh={sky.rayleigh}
        turbidity={sky.turbidity}
      />
      {horizonWash ? (
        <mesh position={[0, 18, -55]} rotation={[0.12, 0, 0]}>
          <planeGeometry args={[180, 42]} />
          <meshBasicMaterial
            color={horizonWash.color}
            transparent
            opacity={horizonWash.opacity}
            toneMapped={false}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ) : null}
      <mesh position={[38, 34, -72]}>
        <sphereGeometry args={[2.0, 10, 10]} />
        <meshBasicMaterial
          color={crispNight ? '#c8d0d8' : '#fff4e8'}
          transparent
          opacity={sunGlowOpacity}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
      {cloudBanks.map((bank, i) => (
        <group key={i} position={bank.pos} rotation={[0.04, i * 0.7, 0.02]}>
          {[0, 0.35, -0.3].map((xOff, j) => (
            <mesh key={j} position={[xOff * bank.scale[0] * 0.25, 0, j * 0.8]}>
              <boxGeometry args={[bank.scale[0] * 0.42, bank.scale[1] * 0.55, bank.scale[2] * 0.35]} />
              <meshBasicMaterial
                color={crispNight ? '#8898a8' : '#eef4f8'}
                transparent
                opacity={bank.opacity * 0.55 * cloudOpacityScale}
                toneMapped={false}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      ))}
    </>
  )
}

/** Solid post-and-rail fence — no wire mesh planes that read as lane occluders. */
function ChainLinkFence({ x }: { x: number }) {
  const posts = [-6, -14, -20, -27, -34, -41, -48]
  const braceZs = [-10, -17, -24, -31, -38, -45]
  const outward = x > 0 ? 1 : -1

  return (
    <group>
      {posts.map(z => (
        <group key={z} position={[x, 0, z]}>
          <mesh position={[0, 0.08, 0]} receiveShadow>
            <cylinderGeometry args={[0.42, 0.46, 0.16, 8]} />
            <meshStandardMaterial color="#8a8478" roughness={0.92} metalness={0.04} />
          </mesh>
          <mesh position={[0, 0.18, 0]} castShadow>
            <boxGeometry args={[0.35, 0.36, 0.35]} />
            <meshStandardMaterial color="#6a6458" roughness={0.88} />
          </mesh>
          <mesh position={[0, 1.25, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.07, 2.35, 6]} />
            <meshStandardMaterial color="#7a7068" metalness={0.58} roughness={0.45} />
          </mesh>
          <mesh position={[0, 2.42, 0]}>
            <sphereGeometry args={[0.08, 6, 6]} />
            <meshStandardMaterial color="#8a8278" metalness={0.65} roughness={0.38} />
          </mesh>
        </group>
      ))}

      {[2.15, 1.28, 0.42].map((y, i) => (
        <mesh key={`rail-${i}`} position={[x, y, -27]}>
          <boxGeometry args={[0.1, 0.1, 44]} />
          <meshStandardMaterial
            color={i === 0 ? '#a8a098' : i === 1 ? '#9a9488' : '#8a8278'}
            metalness={0.65}
            roughness={0.36}
          />
        </mesh>
      ))}

      {braceZs.map(z => (
        <group key={z} position={[x, 1.25, z]}>
          {[-0.45, 0, 0.45].map(yOff => (
            <mesh key={yOff} position={[outward * 0.12, yOff, 0]}>
              <boxGeometry args={[0.16, 0.07, 0.07]} />
              <meshStandardMaterial color="#7a7468" metalness={0.7} roughness={0.35} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function IndoorRange({ config }: { config: MapConfig }) {
  const laneZs = [-12, -26, -40]

  return (
    <>
      <IndoorCeilingLighting accent={config.accent} />

      <ambientLight intensity={0.58} color="#eef6ff" />

      <mesh position={[-18, 6, -24]}>
        <boxGeometry args={[0.55, 12.2, 56]} />
        <meshStandardMaterial color="#5a7282" metalness={0.22} roughness={0.62} />
      </mesh>
      <mesh position={[18, 6, -24]}>
        <boxGeometry args={[0.55, 12.2, 56]} />
        <meshStandardMaterial color="#5a7282" metalness={0.22} roughness={0.62} />
      </mesh>
      <mesh position={[0, 6, -48.2]}>
        <boxGeometry args={[36.5, 12.2, 0.55]} />
        <meshStandardMaterial color="#3f5666" metalness={0.28} roughness={0.58} />
      </mesh>

      {[
        { x: -17.62, z: -14, w: 0.04, h: 2.4, color: '#d8f0ff', label: 'A-01' },
        { x: -17.62, z: -28, w: 0.04, h: 2.1, color: '#ffe8c8', label: 'B-02' },
        { x: -17.62, z: -40, w: 0.04, h: 2.6, color: '#d4f7e8', label: 'C-03' },
        { x: 17.62, z: -18, w: 0.04, h: 2.3, color: '#f0d8ff', label: 'A-02' },
        { x: 17.62, z: -34, w: 0.04, h: 2.5, color: '#fff0c8', label: 'B-03' },
      ].map(panel => (
        <group key={`poster-${panel.label}`} position={[panel.x, 5.2, panel.z]}>
          <mesh>
            <boxGeometry args={[panel.w, panel.h, 1.8]} />
            <meshBasicMaterial color={panel.color} toneMapped={false} />
          </mesh>
          <mesh position={[panel.x > 0 ? -0.05 : 0.05, -panel.h * 0.22, 0]}>
            <boxGeometry args={[0.7, 0.18, 0.02]} />
            <meshBasicMaterial color="#1a2838" toneMapped={false} />
          </mesh>
        </group>
      ))}

      <AcousticFoamGrid x={-17.75} z={-24} facing="left" />
      <AcousticFoamGrid x={17.75} z={-24} facing="right" />

      {[-17.7, 17.7].map(x => (
        <mesh key={`wainscot-${x}`} position={[x, 2.2, -24]}>
          <boxGeometry args={[0.08, 4.2, 54]} />
          <meshStandardMaterial color="#6a8898" metalness={0.3} roughness={0.55} />
        </mesh>
      ))}

      {[-17.65, 17.65].map(x => (
        <mesh key={`panel-${x}`} position={[x, 7.8, -24]}>
          <boxGeometry args={[0.06, 6, 50]} />
          <meshStandardMaterial color="#8aa8b8" metalness={0.12} roughness={0.72} />
        </mesh>
      ))}

      {/* Lane edge curbs — solid low posts and painted floor lines outside the bullet path */}
      {[-15.2, 15.2].map(x => (
        <group key={`lane-curb-${x}`}>
          {[-6, -18, -30, -42].map(z => (
            <mesh key={z} position={[x, 0.18, z]}>
              <boxGeometry args={[0.1, 0.36, 0.1]} />
              <meshStandardMaterial color="#5a7080" metalness={0.55} roughness={0.42} />
            </mesh>
          ))}
          <mesh position={[x, -1.971, -24]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.12, 48]} />
            <meshStandardMaterial color={config.accent} metalness={0.2} roughness={0.75} />
          </mesh>
        </group>
      ))}

      {laneZs.map(z => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.968, z]}>
          <planeGeometry args={[32, 1.8]} />
          <meshStandardMaterial color="#3a5260" metalness={0.2} roughness={0.78} />
        </mesh>
      ))}

      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={`trap-${i}`} position={[0, 1.35 + i * 1.05, -47.75]}>
          <boxGeometry args={[33.5, 0.75, 0.18]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#2a3844' : '#1e2c38'}
            metalness={0.15}
            roughness={0.88}
          />
        </mesh>
      ))}

      <mesh position={[0, 4.2, -47.6]}>
        <boxGeometry args={[34, 0.12, 0.35]} />
        <meshStandardMaterial
          color="#9de8ff"
          emissive="#6ec8e8"
          emissiveIntensity={0.55}
          toneMapped={false}
        />
      </mesh>

      {[-10, -24, -38].map(z => (
        <group key={z} position={[0, 0.02, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[32, 0.35]} />
            <meshStandardMaterial color="#8aa0b0" metalness={0.35} roughness={0.45} />
          </mesh>
          <mesh position={[-14, 0.6, 0]}>
            <boxGeometry args={[1.2, 0.5, 0.08]} />
            <meshStandardMaterial
              color="#dff6ff"
              emissive="#9de8ff"
              emissiveIntensity={0.55}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      <group position={[-16.5, 1.2, -8]}>
        <mesh>
          <boxGeometry args={[1.4, 0.9, 0.7]} />
          <meshStandardMaterial color="#4a5a68" metalness={0.35} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[1.2, 0.2, 0.55]} />
          <meshStandardMaterial color="#3a4858" metalness={0.4} roughness={0.5} />
        </mesh>
      </group>

      {/* Wall-mounted equipment panel — solid metal on side wall, outside lane */}
      <group position={[17.2, 3.5, -14]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[1.6, 2.2, 0.08]} />
          <meshStandardMaterial color="#5a7080" metalness={0.35} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.35, 0.05]}>
          <boxGeometry args={[1.2, 0.8, 0.02]} />
          <meshStandardMaterial color="#3a5060" metalness={0.25} roughness={0.65} />
        </mesh>
      </group>

      {[-16, 16].map(x => (
        <WallSconce key={x} x={x} z={-16} color={config.accent} />
      ))}

      {/* meshBasic depth pass — ceiling beams and solid wall distance plaques */}
      {[-10, 0, 10].map(x => (
        <mesh key={`beam-${x}`} position={[x, INDOOR_CEILING_Y - 0.42, -24]}>
          <boxGeometry args={[0.65, 0.22, 52]} />
          <meshBasicMaterial color="#1a2838" toneMapped={false} />
        </mesh>
      ))}

      {[
        { z: -12, label: '7M' },
        { z: -26, label: '15M' },
        { z: -40, label: '25M' },
      ].map(marker => (
        <mesh key={marker.label} position={[-15.2, 3.4, marker.z]}>
          <boxGeometry args={[0.06, 0.9, 1.4]} />
          <meshBasicMaterial color="#1e3040" toneMapped={false} />
        </mesh>
      ))}

      {[-14, 0, 14].map(x => (
        <mesh key={`conduit-${x}`} position={[x, INDOOR_CEILING_Y - 1.15, -20]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[38, 0.14, 0.14]} />
          <meshBasicMaterial color="#253848" toneMapped={false} />
        </mesh>
      ))}

      {[-18, -36].map(z => (
        <pointLight key={z} position={[0, INDOOR_CEILING_Y - 0.55, z]} intensity={0.72} color="#eef8ff" distance={24} decay={2} />
      ))}

      <pointLight position={[0, 5.5, -46]} intensity={0.75} color="#dff4ff" distance={18} decay={2} />
    </>
  )
}

/** Solid metal pole + box head — no glass housings in the lane. */
function OutdoorRangeLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.8, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 5.6, 6]} />
        <meshStandardMaterial color="#5a5848" metalness={0.55} roughness={0.42} />
      </mesh>
      <mesh position={[0, 5.65, 0.12]}>
        <boxGeometry args={[0.55, 0.18, 0.35]} />
        <meshStandardMaterial color="#3a3830" metalness={0.5} roughness={0.45} />
      </mesh>
      <mesh position={[0, 5.45, 0.12]}>
        <boxGeometry args={[0.38, 0.1, 0.28]} />
        <meshStandardMaterial
          color="#fff0d8"
          emissive="#ffd878"
          emissiveIntensity={0.62}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, 5.2, 0.2]} intensity={2.55} color="#ffd890" distance={28} decay={2} />
    </group>
  )
}

function OutdoorRange({
  grassTint,
  showRangeLights,
  sky,
  horizonWash,
}: {
  grassTint: string
  showRangeLights: boolean
  sky: OutdoorSkyParams
  horizonWash?: { color: string; opacity: number }
}) {
  const grassTexture = useGrassTexture()
  const earthTexture = useEarthTexture()

  useEffect(() => {
    return () => {
      grassTexture?.dispose()
      earthTexture?.dispose()
    }
  }, [grassTexture, earthTexture])

  /** Flat ground-color patches — rotation locked to horizontal, no tilted slabs. */
  const grassPatches = useMemo(
    () => [
      { x: -18, z: -14, w: 14, d: 10, color: '#3f6e3c', opacity: 0.35 },
      { x: 16, z: -18, w: 12, d: 11, color: '#528a4e', opacity: 0.28 },
      { x: -10, z: -32, w: 10, d: 14, color: '#3a6838', opacity: 0.32 },
      { x: 14, z: -36, w: 11, d: 12, color: '#467a44', opacity: 0.3 },
      { x: -22, z: -48, w: 16, d: 10, color: '#3d7040', opacity: 0.25 },
      { x: 8, z: -52, w: 13, d: 9, color: '#4a8248', opacity: 0.28 },
      { x: -6, z: -8, w: 8, d: 6, color: '#5a8a52', opacity: 0.22 },
      { x: 20, z: -10, w: 9, d: 7, color: '#3e7240', opacity: 0.26 },
    ],
    []
  )

  const treeLine = useMemo(
    () => [
      { pos: [-22, -22] as [number, number], type: 'evergreen' as const, scale: 1.15 },
      { pos: [-14, -30] as [number, number], type: 'umbrella' as const, scale: 1.0 },
      { pos: [10, -26] as [number, number], type: 'sparse' as const, scale: 1.05 },
      { pos: [20, -36] as [number, number], type: 'deciduous' as const, scale: 1.2 },
      { pos: [-26, -40] as [number, number], type: 'evergreen' as const, scale: 0.95 },
      { pos: [2, -44] as [number, number], type: 'umbrella' as const, scale: 1.08 },
      { pos: [-16, -52] as [number, number], type: 'sparse' as const, scale: 1.25 },
      { pos: [24, -48] as [number, number], type: 'deciduous' as const, scale: 0.92 },
      { pos: [-8, -58] as [number, number], type: 'evergreen' as const, scale: 1.1 },
      { pos: [14, -56] as [number, number], type: 'umbrella' as const, scale: 0.85 },
    ],
    []
  )

  const bushes = useMemo(
    () => [
      [-10, -14], [12, -16], [-6, -22], [8, -20], [16, -30], [-4, -34],
    ],
    []
  )

  const distanceMarkers = useMemo(
    () => [
      { z: -8, label: '8M' },
      { z: -16, label: '16M' },
      { z: -24, label: '24M' },
      { z: -32, label: '32M' },
      { z: -40, label: '40M' },
    ],
    []
  )

  const crispNight = showRangeLights
  const hillOpacityScale = crispNight ? 0.22 : 1

  return (
    <>
      <OutdoorSky sky={sky} horizonWash={horizonWash} crispNight={crispNight} />

      {[-38, -58, -78, -98].map((z, index) => (
        <mesh key={z} position={[0, 0.6 + index * 0.55, z]} scale={[1.5 - index * 0.1, 1, 1]}>
          <boxGeometry args={[52 - index * 5, 2.2 + index * 0.7, 3.5]} />
          <meshStandardMaterial
            color={['#6a8498', '#7a94a8', '#8aa4b8', '#9ab4c8'][index]}
            roughness={0.98}
            metalness={0.01}
            transparent
            opacity={(0.52 - index * 0.04) * hillOpacityScale}
            flatShading
          />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -10]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial
          map={grassTexture}
          color={grassTint}
          roughness={0.96}
          metalness={0.02}
        />
      </mesh>

      {grassPatches.map((patch, i) => (
        <mesh
          key={`grass-patch-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[patch.x, -1.985, patch.z]}
        >
          <planeGeometry args={[patch.w, patch.d]} />
          <meshStandardMaterial
            color={patch.color}
            roughness={0.95}
            transparent
            opacity={patch.opacity}
            depthWrite={false}
          />
        </mesh>
      ))}

      {[0, 1, 2].map(layer => (
        <mesh key={`berm-tier-${layer}`} position={[0, 0.55 + layer * 0.48, -44.35 - layer * 0.14]}>
          <boxGeometry args={[42 - layer * 3.5, 1.15 - layer * 0.12, 2.9 - layer * 0.35]} />
          <meshStandardMaterial map={earthTexture} color={['#6a5840', '#5a4838', '#4a3828'][layer]} roughness={0.96} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.62, -44.8]}>
        <planeGeometry args={[40, 2.8]} />
        <meshStandardMaterial map={grassTexture} color="#4a8a48" roughness={0.93} side={THREE.DoubleSide} />
      </mesh>
      {[-18, -12, -6, 0, 6, 12, 18].map(x => (
        <mesh key={`berm-timber-${x}`} position={[x, 0.18, -43.75]}>
          <boxGeometry args={[5.4, 0.24, 0.14]} />
          <meshStandardMaterial color="#5a4838" roughness={0.92} />
        </mesh>
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <mesh
          key={`sandbag-${i}`}
          position={[-19.25 + i * 3, -1.55, -43.15]}
          rotation={[0, (i % 2) * 0.08, 0]}
        >
          <boxGeometry args={[2.35, 0.34, 0.52]} />
          <meshStandardMaterial color="#6a5a48" roughness={0.94} />
        </mesh>
      ))}
      {[-14, -7, 0, 7, 14].map(x => (
        <mesh key={x} position={[x, 1.48, -45.2]}>
          <boxGeometry args={[0.35, 0.22, 0.35]} />
          <meshStandardMaterial color="#6a6458" roughness={0.92} />
        </mesh>
      ))}

      {/* Berm target frames — wooden posts + paper silhouette for backstop depth */}
      {[-7, 0, 7].map(x => (
        <group key={`berm-frame-${x}`} position={[x, -1.15, -45.75]}>
          {[-0.5, 0.5].map(postX => (
            <mesh key={postX} position={[postX, 1.05, 0]}>
              <boxGeometry args={[0.1, 2.1, 0.1]} />
              <meshStandardMaterial color="#6a5848" roughness={0.9} />
            </mesh>
          ))}
          <mesh position={[0, 2.0, 0]}>
            <boxGeometry args={[1.15, 0.08, 0.08]} />
            <meshStandardMaterial color="#7a6858" roughness={0.86} />
          </mesh>
          <mesh position={[0, 1.35, 0.03]}>
            <boxGeometry args={[0.82, 0.62, 0.02]} />
            <meshStandardMaterial color="#e8e4dc" roughness={0.92} />
          </mesh>
        </group>
      ))}

      <group position={[-20, 0, -10]}>
        <mesh position={[0, 2.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 5, 8]} />
          <meshStandardMaterial color="#7a6a58" roughness={0.85} />
        </mesh>
        <mesh position={[0, 5.2, 0]}>
          <boxGeometry args={[1.8, 1.1, 0.06]} />
          <meshStandardMaterial color="#c83838" roughness={0.7} />
        </mesh>
      </group>

      <group position={[0, -1.32, -3.5]}>
        <mesh castShadow>
          <boxGeometry args={[3.2, 0.75, 1.2]} />
          <meshStandardMaterial color="#5a4a38" roughness={0.88} />
        </mesh>
        <mesh position={[0, 0.52, 0]} castShadow>
          <boxGeometry args={[2.8, 0.14, 1.0]} />
          <meshStandardMaterial color="#4a3a28" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.68, -0.35]}>
          <boxGeometry args={[0.8, 0.08, 0.5]} />
          <meshStandardMaterial color="#3a3028" roughness={0.8} />
        </mesh>
      </group>

      <ChainLinkFence x={-15} />
      <ChainLinkFence x={15} />

      {/* meshBasic depth pass — fence distance plaques and berm silhouette (no glass in lane) */}
      {distanceMarkers.map(marker =>
        [-14.85, 14.85].map(fenceX => (
          <group key={`${marker.label}-${fenceX}`} position={[fenceX, 1.05, marker.z]}>
            <mesh>
              <boxGeometry args={[0.06, 0.55, 0.9]} />
              <meshBasicMaterial color="#2a3828" toneMapped={false} />
            </mesh>
            <mesh position={[fenceX > 0 ? -0.04 : 0.04, 0.08, 0]}>
              <boxGeometry args={[0.04, 0.18, 0.45]} />
              <meshBasicMaterial color="#e8d848" toneMapped={false} />
            </mesh>
          </group>
        ))
      )}

      {[0, 1, 2].map(layer => (
        <mesh key={`berm-depth-${layer}`} position={[0, 1.05 + layer * 0.55, -45.1 - layer * 0.18]}>
          <boxGeometry args={[38 - layer * 4, 2.2 - layer * 0.35, 0.12]} />
          <meshBasicMaterial color={['#2a2018', '#241810', '#1e140c'][layer]} toneMapped={false} />
        </mesh>
      ))}

      {showRangeLights ? (
        <>
          {[-15, 15].flatMap(x =>
            [-6, -18, -30, -42].map(z => (
              <OutdoorRangeLight key={`range-light-${x}-${z}`} position={[x, 0, z]} />
            ))
          )}
          <OutdoorRangeLight position={[-10, 0, -44]} />
          <OutdoorRangeLight position={[10, 0, -44]} />
          <mesh position={[0, 3.8, -45.5]}>
            <boxGeometry args={[34, 0.14, 0.35]} />
            <meshStandardMaterial
              color="#fff0d0"
              emissive="#ffb347"
              emissiveIntensity={0.55}
              toneMapped={false}
            />
          </mesh>
          <pointLight position={[0, 3.6, -45.5]} intensity={2.1} color="#ffd8a0" distance={34} decay={2} />
        </>
      ) : null}

      {bushes.map(([x, z], i) => (
        <BushClump key={i} position={[x, -1.95, z]} scale={0.85 + (i % 3) * 0.12} />
      ))}

      {treeLine.map(({ pos, type, scale }, i) => {
        const treePosition = [pos[0], -2, pos[1]] as [number, number, number]
        if (type === 'evergreen') {
          return <EvergreenTree key={i} position={treePosition} scale={scale} />
        }
        if (type === 'umbrella') {
          return <UmbrellaTree key={i} position={treePosition} scale={scale} />
        }
        if (type === 'sparse') {
          return <SparseTree key={i} position={treePosition} scale={scale} />
        }
        return <DeciduousTree key={i} position={treePosition} scale={scale} />
      })}

      {/* Distant ridge silhouettes for horizon readability */}
      {[-28, 0, 26].map((x, i) => (
        <mesh key={`ridge-${i}`} position={[x, 1.2, -72 - i * 6]} scale={[1.1 + i * 0.15, 1, 1]}>
          <boxGeometry args={[18 - i * 2, 2.4 + i * 0.5, 4]} />
          <meshBasicMaterial color="#1a2830" transparent opacity={0.38 - i * 0.06} toneMapped={false} />
        </mesh>
      ))}
    </>
  )
}

function SafetyStripe({ x, z, vertical = false }: { x: number; z: number; vertical?: boolean }) {
  const stripes = Array.from({ length: 4 }, (_, i) => (
    <mesh key={i} position={vertical ? [0, i * 0.28 - 0.42, 0] : [i * 0.28 - 0.42, 0, 0]}>
      <boxGeometry args={vertical ? [0.22, 0.24, 0.04] : [0.24, 0.22, 0.04]} />
      <meshStandardMaterial color={i % 2 === 0 ? '#e8b020' : '#2a2218'} roughness={0.7} />
    </mesh>
  ))
  return <group position={[x, vertical ? 0.5 : 0.08, z]}>{stripes}</group>
}

function WarehouseRange({ config }: { config: MapConfig }) {
  const distanceMarkers = useMemo(
    () => [
      { z: -10, label: '5M' },
      { z: -22, label: '12M' },
      { z: -34, label: '20M' },
      { z: -46, label: '30M' },
    ],
    []
  )

  const crateStacks = useMemo(
    () => [
      { x: -14, z: -28, h: 2.2 },
      { x: 0, z: -32, h: 2.8 },
      { x: 14, z: -26, h: 2.0 },
      { x: -8, z: -40, h: 1.6 },
      { x: 10, z: -42, h: 2.4 },
      { x: -12, z: -18, h: 1.4 },
      { x: 12, z: -20, h: 1.8 },
      { x: -5, z: -14, h: 1.2 },
      { x: 7, z: -16, h: 1.5 },
    ],
    []
  )

  const deepCrates = useMemo(
    () => [
      { x: -15.8, z: -44, w: 2.6, h: 2.8, d: 1.8 },
      { x: 15.5, z: -42, w: 2.4, h: 2.2, d: 1.6 },
      { x: -15.2, z: -30, w: 2.2, h: 1.8, d: 1.4 },
      { x: 15.8, z: -28, w: 2.0, h: 2.4, d: 1.5 },
      { x: -14.5, z: -16, w: 1.8, h: 1.4, d: 1.2 },
      { x: 14.8, z: -18, w: 2.2, h: 1.6, d: 1.3 },
    ],
    []
  )

  const sideRacks = useMemo(
    () => [
      { x: -17.2, z: -20, shelves: 4 },
      { x: 17.2, z: -26, shelves: 3 },
      { x: -17.2, z: -38, shelves: 5 },
      { x: 17.2, z: -42, shelves: 4 },
    ],
    []
  )

  const pallets = useMemo(
    () => [
      [-16, -12], [16, -14], [-6, -36], [8, -38],
    ],
    []
  )

  return (
    <>
      {/* meshBasic depth pass — trusses, plaques, columns, conduit (no glass in lane) */}
      {[-16, -4, 8, 20].map(x => (
        <mesh key={`wh-truss-${x}`} position={[x, 11.35, -24]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[54, 0.38, 0.55]} />
          <meshBasicMaterial color="#1a1410" toneMapped={false} />
        </mesh>
      ))}

      {distanceMarkers.map(marker => (
        <mesh key={`wh-cross-truss-${marker.z}`} position={[2, 11.35, marker.z]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[34, 0.3, 0.38]} />
          <meshBasicMaterial color="#16120e" toneMapped={false} />
        </mesh>
      ))}

      {[-17.7, 17.7].map(x =>
        [-12, -24, -36, -44].map(z => (
          <mesh key={`wh-pillar-${x}-${z}`} position={[x, 5.5, z]}>
            <boxGeometry args={[0.5, 11, 0.5]} />
            <meshBasicMaterial color="#14100c" toneMapped={false} />
          </mesh>
        ))
      )}

      {[-8, 0, 8].map(x => (
        <mesh key={`wh-conduit-${x}`} position={[x, 10.15, -24]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[50, 0.14, 0.14]} />
          <meshBasicMaterial color="#241c14" toneMapped={false} />
        </mesh>
      ))}

      {distanceMarkers.map(marker => (
        <group key={marker.label} position={[-15.4, 3.2, marker.z]}>
          <mesh>
            <boxGeometry args={[0.06, 0.85, 1.3]} />
            <meshBasicMaterial color="#1e1814" toneMapped={false} />
          </mesh>
          <mesh position={[0.05, 0.12, 0]}>
            <boxGeometry args={[0.04, 0.22, 0.55]} />
            <meshBasicMaterial color={config.accent} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {distanceMarkers.map(marker => (
        <group key={`wh-aisle-band-${marker.z}`}>
          <mesh position={[-17.6, 4.5, marker.z]}>
            <boxGeometry args={[0.1, 0.4, 9]} />
            <meshBasicMaterial color="#1c1612" toneMapped={false} />
          </mesh>
          <mesh position={[17.6, 4.5, marker.z]}>
            <boxGeometry args={[0.1, 0.4, 9]} />
            <meshBasicMaterial color="#1c1612" toneMapped={false} />
          </mesh>
        </group>
      ))}

      {[0, 1, 2].map(layer => (
        <mesh key={`wh-backstop-depth-${layer}`} position={[0, 2.8 + layer * 1.4, -47.65 - layer * 0.12]}>
          <boxGeometry args={[28 - layer * 2.5, 6 - layer * 0.5, 0.1]} />
          <meshBasicMaterial color={['#14100c', '#16120e', '#181410'][layer]} toneMapped={false} />
        </mesh>
      ))}

      {deepCrates.map((crate, index) => (
        <mesh
          key={`wh-deep-crate-${index}`}
          position={[crate.x, crate.h / 2 - 1.85, crate.z]}
        >
          <boxGeometry args={[crate.w, crate.h, crate.d]} />
          <meshBasicMaterial color={index % 2 === 0 ? '#1a1410' : '#16120e'} toneMapped={false} />
        </mesh>
      ))}

      {sideRacks.map((rack, index) => (
        <group key={`wh-side-rack-${index}`} position={[rack.x, 1.2, rack.z]}>
          <mesh>
            <boxGeometry args={[0.35, rack.shelves * 1.35 + 0.8, 2.4]} />
            <meshBasicMaterial color="#14100c" toneMapped={false} />
          </mesh>
          {Array.from({ length: rack.shelves }, (_, shelf) => (
            <mesh key={shelf} position={[rack.x > 0 ? -0.12 : 0.12, shelf * 1.35 - 0.2, 0]}>
              <boxGeometry args={[0.55, 0.1, 2.2]} />
              <meshBasicMaterial color="#1c1814" toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 12.02, -18]}>
        <planeGeometry args={[42, 72]} />
        <meshStandardMaterial
          color="#5a5048"
          emissive="#7a6a50"
          emissiveIntensity={0.28}
          metalness={0.35}
          roughness={0.72}
          side={THREE.DoubleSide}
        />
      </mesh>

      <ambientLight intensity={0.42} color="#ffe8c8" />

      {[-16, -4, 8, 20].map(x => (
        <mesh key={x} position={[x, 11.2, -24]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[56, 0.22, 0.38]} />
          <meshStandardMaterial color="#5a4a38" metalness={0.65} roughness={0.42} />
        </mesh>
      ))}

      {[-12, 0, 12].map(x => (
        <mesh key={`pipe-${x}`} position={[x, 10.5, -24]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 52, 8]} />
          <meshStandardMaterial color="#6a5a48" metalness={0.7} roughness={0.38} />
        </mesh>
      ))}

      {[-8, -22, -36, -48].map(z => (
        <group key={z} position={[0, 10.8, z]}>
          <mesh>
            <boxGeometry args={[30, 0.12, 0.5]} />
            <meshStandardMaterial
              color="#fff0d0"
              emissive="#ffb347"
              emissiveIntensity={1.05}
              toneMapped={false}
            />
          </mesh>
          <pointLight intensity={2.05} distance={24} color={config.accent} decay={2} position={[0, -0.15, 0]} />
        </group>
      ))}

      <mesh position={[-18, 6, -24]}>
        <boxGeometry args={[0.55, 12.2, 56]} />
        <meshStandardMaterial color="#4a4038" metalness={0.35} roughness={0.7} />
      </mesh>
      <mesh position={[18, 6, -24]}>
        <boxGeometry args={[0.55, 12.2, 56]} />
        <meshStandardMaterial color="#4a4038" metalness={0.35} roughness={0.7} />
      </mesh>
      <mesh position={[0, 6, -48.2]}>
        <boxGeometry args={[36.5, 12.2, 0.55]} />
        <meshStandardMaterial color="#3a3028" metalness={0.3} roughness={0.68} />
      </mesh>

      {/* Back-wall solid window recesses — opaque frames only, no glass panes */}
      {[-8, -2.5, 2.5, 8].map(x => (
        <mesh key={`wh-window-${x}`} position={[x, 5.2, -47.55]}>
          <boxGeometry args={[3.2, 2.4, 0.12]} />
          <meshStandardMaterial color="#1a1410" metalness={0.2} roughness={0.85} />
        </mesh>
      ))}

      {/* Distant rack + forklift — solid silhouettes on back wall */}
      {[-12, -4, 4, 12].map(x => (
        <mesh key={`rear-rack-${x}`} position={[x, 3.8, -47.35]}>
          <boxGeometry args={[2.8, 6.8, 0.35]} />
          <meshBasicMaterial color="#14100c" toneMapped={false} />
        </mesh>
      ))}
      <group position={[-10, -1.2, -46.8]}>
        <mesh>
          <boxGeometry args={[2.4, 0.9, 1.4]} />
          <meshBasicMaterial color="#181410" toneMapped={false} />
        </mesh>
        <mesh position={[0.35, 1.35, 0]}>
          <boxGeometry args={[0.18, 1.6, 0.18]} />
          <meshBasicMaterial color="#1a1612" toneMapped={false} />
        </mesh>
        <mesh position={[0.35, 2.15, 0.35]} rotation={[-0.35, 0, 0]}>
          <boxGeometry args={[1.1, 0.12, 0.55]} />
          <meshBasicMaterial color="#1c1814" toneMapped={false} />
        </mesh>
      </group>

      <group position={[0, 4.5, -47.85]}>
        <mesh>
          <boxGeometry args={[28, 7.5, 0.25]} />
          <meshStandardMaterial color="#5a5048" metalness={0.45} roughness={0.65} />
        </mesh>
        {[1.5, 3.2, 4.9, 6.6].map(y => (
          <mesh key={y} position={[0, y - 3.5, 0.14]}>
            <boxGeometry args={[26, 0.22, 0.08]} />
            <meshStandardMaterial color="#7a6a58" metalness={0.55} roughness={0.5} />
          </mesh>
        ))}
      </group>

      <mesh position={[0, 3.5, -47.9]}>
        <boxGeometry args={[32, 6.5, 0.35]} />
        <meshStandardMaterial color="#4a4030" metalness={0.4} roughness={0.75} />
      </mesh>
      {[2.2, 3.8, 5.4].map(y => (
        <mesh key={y} position={[0, y, -47.7]}>
          <boxGeometry args={[30, 0.18, 0.12]} />
          <meshStandardMaterial color="#6a5a40" metalness={0.5} roughness={0.55} />
        </mesh>
      ))}

      {crateStacks.map((crate, index) => (
        <group key={`${crate.x}-${crate.z}`} position={[crate.x, crate.h / 2 - 1.85, crate.z]}>
          <mesh castShadow>
            <boxGeometry args={[3.8, crate.h, 2.4]} />
            <meshStandardMaterial
              color={index % 2 === 0 ? '#6a5238' : '#5a4630'}
              metalness={0.18}
              roughness={0.82}
            />
          </mesh>
          <mesh position={[0, crate.h / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3.6, 2.2]} />
            <meshStandardMaterial color="#8a6848" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {pallets.map(([x, z], i) => (
        <group key={i} position={[x, -1.72, z]}>
          <mesh>
            <boxGeometry args={[1.8, 0.12, 1.4]} />
            <meshStandardMaterial color="#6a5a48" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[1.5, 0.55, 1.1]} />
            <meshStandardMaterial color="#5a4a38" metalness={0.15} roughness={0.85} />
          </mesh>
        </group>
      ))}

      {[-17, 17].map(x => (
        <group key={x} position={[x, 2.5, -22]}>
          <mesh>
            <boxGeometry args={[0.35, 5, 0.35]} />
            <meshStandardMaterial color="#4a4034" metalness={0.55} roughness={0.45} />
          </mesh>
          <SafetyStripe x={0} z={0} vertical />
          {[0, 1.8, 3.6].map(y => (
            <mesh key={y} position={[0, y - 1.5, 0]}>
              <boxGeometry args={[2.8, 0.12, 0.8]} />
              <meshStandardMaterial color="#5a4a38" metalness={0.4} roughness={0.6} />
            </mesh>
          ))}
        </group>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.964, -21]}>
        <planeGeometry args={[10, 46]} />
        <meshStandardMaterial color="#6a6058" metalness={0.15} roughness={0.75} />
      </mesh>

      {distanceMarkers.map(marker => (
        <mesh key={`aisle-marker-${marker.z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9645, marker.z]}>
          <planeGeometry args={[8.5, 0.35]} />
          <meshStandardMaterial color="#3a342c" roughness={0.92} />
        </mesh>
      ))}

      {distanceMarkers.map(marker => (
        <mesh key={`wh-floor-trans-${marker.z}`} position={[0, -1.961, marker.z]}>
          <boxGeometry args={[12, 0.06, 0.08]} />
          <meshBasicMaterial color="#2a2218" toneMapped={false} />
        </mesh>
      ))}

      {/* Center shooting lane stripe */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.963, -21]}>
        <planeGeometry args={[2.4, 44]} />
        <meshStandardMaterial color="#9a9088" metalness={0.24} roughness={0.62} />
      </mesh>
      {[-6, -18, -30, -42].map(z => (
        <mesh key={`wh-marker-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.962, z]}>
          <planeGeometry args={[10.5, 0.18]} />
          <meshStandardMaterial color="#c8a020" emissive="#a88018" emissiveIntensity={0.1} roughness={0.8} />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-11, -1.963, -30]}>
        <planeGeometry args={[4, 18]} />
        <meshStandardMaterial color="#4a4840" roughness={0.88} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[11, -1.963, -35]}>
        <planeGeometry args={[3.5, 14]} />
        <meshStandardMaterial color="#4a4840" roughness={0.88} />
      </mesh>

      {/* Lane edge curbs — solid posts + painted floor lines outside bullet path */}
      {[-15.2, 15.2].map(x => (
        <group key={`wh-lane-curb-${x}`}>
          {[-8, -20, -32, -44].map(z => (
            <mesh key={z} position={[x, 0.18, z]}>
              <boxGeometry args={[0.1, 0.36, 0.1]} />
              <meshBasicMaterial color="#4a3d30" toneMapped={false} />
            </mesh>
          ))}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, -1.971, -24]}>
            <planeGeometry args={[0.12, 48]} />
            <meshStandardMaterial color={config.accent} metalness={0.2} roughness={0.75} />
          </mesh>
        </group>
      ))}

      {[-16, 16].map(x => (
        <WallSconce key={x} x={x} z={-14} color={config.accent} />
      ))}
    </>
  )
}

export function RangeEnvironment({ config, outdoorTimeOfDay = 'day' }: RangeEnvironmentProps) {
  const isOutdoor = config.id === 'outdoor'
  const isWarehouse = config.id === 'warehouse'
  const isIndoor = config.id === 'indoor'
  const outdoorEnv = isOutdoor ? resolveOutdoorEnvironment(config, outdoorTimeOfDay) : null
  const activeConfig = outdoorEnv?.config ?? config
  return (
    <>
      <color attach="background" args={[activeConfig.background]} />
      <fog attach="fog" args={[activeConfig.fog.color, activeConfig.fog.near, activeConfig.fog.far]} />

      <hemisphereLight
        args={[
          activeConfig.hemisphere.sky,
          activeConfig.hemisphere.ground,
          activeConfig.hemisphere.intensity,
        ]}
      />
      <directionalLight
        position={activeConfig.directional.position}
        intensity={activeConfig.directional.intensity}
        color={activeConfig.directional.color}
        castShadow={isWarehouse}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={75}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={18}
        shadow-camera-bottom={-6}
      />
      {activeConfig.fillLight && (
        <pointLight
          position={activeConfig.fillLight.position}
          intensity={activeConfig.fillLight.intensity}
          color={activeConfig.fillLight.color}
          distance={42}
          decay={2}
        />
      )}
      {activeConfig.rimLight && (
        <directionalLight
          position={activeConfig.rimLight.position}
          intensity={activeConfig.rimLight.intensity}
          color={activeConfig.rimLight.color}
        />
      )}

      {!isOutdoor && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -20]} receiveShadow>
          <planeGeometry args={[48, 84]} />
          <meshStandardMaterial
            color={activeConfig.floor.color}
            metalness={activeConfig.floor.metalness}
            roughness={activeConfig.floor.roughness}
          />
        </mesh>
      )}

      {!isOutdoor && !isWarehouse && (
        <gridHelper position={[0, -1.97, -20]} args={activeConfig.grid} />
      )}

      {isIndoor && <IndoorRange config={activeConfig} />}
      {isOutdoor && outdoorEnv && (
        <OutdoorRange
          grassTint={outdoorEnv.grassTint}
          showRangeLights={outdoorEnv.showRangeLights}
          sky={outdoorEnv.sky}
          horizonWash={outdoorEnv.horizonWash}
        />
      )}
      {isWarehouse && <WarehouseRange config={activeConfig} />}
    </>
  )
}
