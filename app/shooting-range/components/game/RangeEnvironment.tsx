import { useEffect, useMemo } from 'react'
import { Sky } from '@react-three/drei'
import * as THREE from 'three'
import type { MapConfig } from '../../utils/mapConfigs'

interface RangeEnvironmentProps {
  config: MapConfig
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
        ctx.fillStyle = '#4a7a48'
        ctx.fillRect(0, 0, w, h)
        for (let i = 0; i < 4200; i += 1) {
          const x = Math.random() * w
          const y = Math.random() * h
          const shade = Math.random()
          ctx.fillStyle =
            shade > 0.82
              ? 'rgba(90, 68, 42, 0.35)'
              : shade > 0.55
                ? `rgba(${58 + Math.random() * 28}, ${108 + Math.random() * 32}, ${58 + Math.random() * 22}, 0.55)`
                : `rgba(${42 + Math.random() * 18}, ${92 + Math.random() * 24}, ${48 + Math.random() * 16}, 0.45)`
          ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 3)
        }
      }, 6),
    []
  )
}

function useGravelTexture() {
  return useMemo(
    () =>
      createCanvasTexture(128, 128, (ctx, w, h) => {
        ctx.fillStyle = '#8a7a62'
        ctx.fillRect(0, 0, w, h)
        for (let i = 0; i < 900; i += 1) {
          const x = Math.random() * w
          const y = Math.random() * h
          const size = 1 + Math.random() * 2.5
          const tone = 110 + Math.random() * 50
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
        ctx.fillStyle = '#6a5840'
        ctx.fillRect(0, 0, w, h)
        for (let i = 0; i < 700; i += 1) {
          const x = Math.random() * w
          const y = Math.random() * h
          const tone = 80 + Math.random() * 45
          ctx.fillStyle = `rgba(${tone + 18}, ${tone}, ${tone - 22}, 0.65)`
          ctx.fillRect(x, y, 2 + Math.random() * 4, 1 + Math.random() * 3)
        }
      }, 2),
    []
  )
}

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
    <group position={[x, INDOOR_CEILING_Y - 0.04, z]}>
      <mesh>
        <boxGeometry args={[3.4, 0.22, 1.75]} />
        <meshStandardMaterial color="#8a9aaa" metalness={0.48} roughness={0.38} />
      </mesh>
      <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.0, 1.45]} />
        <meshStandardMaterial
          color="#f6fcff"
          emissive={accent}
          emissiveIntensity={2.05}
          roughness={0.28}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.6, 1.15]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#e8f8ff"
          emissiveIntensity={1.55}
          roughness={0.2}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight intensity={intensity} distance={18} color="#eef8ff" decay={2} position={[0, -0.25, 0]} />
    </group>
  )
}

function IndoorCeilingVault({ accent }: { accent: string }) {
  const lightRows = useMemo(
    () => [-4, -9, -14, -19, -24, -29, -34, -39, -44, -49],
    []
  )
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, INDOOR_CEILING_Y + 0.06, -24]}>
        <planeGeometry args={[38, 56]} />
        <meshBasicMaterial color="#f8fcff" toneMapped={false} fog={false} side={THREE.DoubleSide} />
      </mesh>

      {lightRows.map(z => (
        <group key={z} position={[0, INDOOR_CEILING_Y - 0.04, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh>
            <planeGeometry args={[32, 2.0]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} fog={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[28, 1.35]} />
            <meshBasicMaterial color={accent} toneMapped={false} fog={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <planeGeometry args={[22, 0.85]} />
            <meshBasicMaterial color="#f8fcff" toneMapped={false} fog={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {[-17.2, 17.2].map(x => (
        <mesh key={x} position={[x, INDOOR_CEILING_Y - 0.17, -24]}>
          <boxGeometry args={[0.45, 0.55, 52]} />
          <meshBasicMaterial color="#d8eaf4" toneMapped={false} fog={false} />
        </mesh>
      ))}

      {[-36, -42, -46].map(z => (
        <group key={`apex-${z}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, INDOOR_CEILING_Y + 0.04, z]}>
            <planeGeometry args={[26, 4.5]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} fog={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, INDOOR_CEILING_Y - 0.02, z]}>
            <planeGeometry args={[20, 2.2]} />
            <meshBasicMaterial color={accent} toneMapped={false} fog={false} side={THREE.DoubleSide} />
          </mesh>
          <pointLight intensity={1.8} distance={24} color="#f4fcff" decay={2} position={[0, INDOOR_CEILING_Y - 0.52, z]} />
        </group>
      ))}
    </>
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

function IndoorLaneLightBars({ accent }: { accent: string }) {
  const rowZs = useMemo(() => Array.from({ length: 9 }, (_, i) => -8 - i * 5), [])

  return (
    <>
      {rowZs.map(z => (
        <group key={`lane-bar-${z}`} position={[0, 5.85, z]}>
          <mesh>
            <boxGeometry args={[36, 0.28, 2.5]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} fog={false} />
          </mesh>
          <mesh position={[0, -0.13, 0]}>
            <boxGeometry args={[32, 0.1, 1.85]} />
            <meshBasicMaterial color={accent} toneMapped={false} fog={false} />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[26, 0.05, 1.2]} />
            <meshBasicMaterial color="#f4fcff" toneMapped={false} fog={false} />
          </mesh>
        </group>
      ))}
    </>
  )
}

function IndoorUpperWallLights({ accent }: { accent: string }) {
  const rowZs = useMemo(() => Array.from({ length: 12 }, (_, i) => -4 - i * 4), [])

  return (
    <>
      {rowZs.flatMap(z =>
        [-17.35, 17.35].map(x => (
          <group key={`wall-light-${x}-${z}`} position={[x, 7.55, z]}>
            <mesh rotation={[0, x > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
              <planeGeometry args={[3.8, 1.05]} />
              <meshBasicMaterial color="#ffffff" toneMapped={false} fog={false} side={THREE.DoubleSide} />
            </mesh>
            <mesh
              rotation={[0, x > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
              position={[0, 0, 0.02]}
            >
              <planeGeometry args={[3.2, 0.62]} />
              <meshBasicMaterial color={accent} toneMapped={false} fog={false} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))
      )}
    </>
  )
}

function IndoorHangingFixtures({ accent }: { accent: string }) {
  const slots = useMemo(() => {
    const points: Array<{ x: number; z: number }> = []
    for (let row = 0; row < 12; row += 1) {
      for (const x of [-12, 0, 12]) {
        points.push({ x, z: -5 - row * 4 })
      }
    }
    return points
  }, [])

  return (
    <>
      {slots.map(({ x, z }) => (
        <group key={`hang-${x}-${z}`} position={[x, INDOOR_CEILING_Y - 0.55, z]}>
          <mesh>
            <boxGeometry args={[3.6, 0.14, 1.55]} />
            <meshStandardMaterial color="#c8dce8" metalness={0.35} roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.12, 0]}>
            <boxGeometry args={[3.1, 0.06, 1.25]} />
            <meshBasicMaterial color={accent} toneMapped={false} fog={false} />
          </mesh>
          <mesh position={[0, -0.18, 0]}>
            <boxGeometry args={[2.5, 0.04, 0.95]} />
            <meshBasicMaterial color="#f8fcff" toneMapped={false} fog={false} />
          </mesh>
        </group>
      ))}
    </>
  )
}

function IndoorOverheadLightRows({ accent }: { accent: string }) {
  const rowZs = useMemo(() => Array.from({ length: 16 }, (_, i) => -1.5 - i * 3.2), [])

  return (
    <>
      {rowZs.map(z => (
        <group key={`overhead-${z}`} position={[0, INDOOR_CEILING_Y - 0.14, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[36, 3.2]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} fog={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.03]}>
            <planeGeometry args={[31, 2.0]} />
            <meshBasicMaterial color={accent} toneMapped={false} fog={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.05]}>
            <planeGeometry args={[24, 1.1]} />
            <meshBasicMaterial color="#f8fcff" toneMapped={false} fog={false} side={THREE.DoubleSide} />
          </mesh>
          <pointLight intensity={1.65} distance={18} color="#f4fcff" decay={2} position={[0, -0.35, 0]} />
        </group>
      ))}
    </>
  )
}

function IndoorCeilingGrid({ accent }: { accent: string }) {
  const troffers = useMemo(() => {
    const slots: Array<{ x: number; z: number }> = []
    for (let row = 0; row < 7; row += 1) {
      for (let col = 0; col < 5; col += 1) {
        slots.push({ x: -16 + col * 8, z: -6 - row * 7 })
      }
    }
    return slots
  }, [])

  const soffitZs = useMemo(() => Array.from({ length: 14 }, (_, i) => -2 - i * 3.6), [])

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, INDOOR_CEILING_Y + 0.12, -22]}>
        <planeGeometry args={[38, 58]} />
        <meshBasicMaterial color="#f8fcff" toneMapped={false} fog={false} side={THREE.DoubleSide} />
      </mesh>

      {Array.from({ length: 12 }, (_, i) => (
        <mesh
          key={`panel-row-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, INDOOR_CEILING_Y + 0.07, -4 - i * 4.5]}
        >
          <planeGeometry args={[34, 2.4]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} fog={false} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {[-17.6, 17.6].map(x => (
        <mesh key={`crown-${x}`} position={[x, INDOOR_CEILING_Y - 0.37, -22]}>
          <boxGeometry args={[0.35, 0.65, 54]} />
          <meshStandardMaterial
            color="#c8dce8"
            emissive={accent}
            emissiveIntensity={1.05}
            toneMapped={false}
          />
        </mesh>
      ))}

      {[-10, 10].map(x => (
        <mesh key={`beam-${x}`} position={[x, INDOOR_CEILING_Y + 0.06, -22]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[56, 0.28, 0.42]} />
          <meshStandardMaterial color="#9aacb8" metalness={0.42} roughness={0.45} />
        </mesh>
      ))}

      {soffitZs.map(z => (
        <CeilingSoffitRow key={z} z={z} accent={accent} />
      ))}

      {troffers.map(slot => (
        <CeilingTroffer key={`${slot.x}-${slot.z}`} x={slot.x} z={slot.z} accent={accent} />
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

function OutdoorSky() {
  const cloudBanks = useMemo(
    () => [
      { pos: [-24, 28, -82] as [number, number, number], scale: [14, 3.2, 5] as [number, number, number], opacity: 0.12 },
      { pos: [18, 30, -78] as [number, number, number], scale: [12, 2.8, 4.5] as [number, number, number], opacity: 0.1 },
      { pos: [-6, 32, -92] as [number, number, number], scale: [18, 3.5, 6] as [number, number, number], opacity: 0.11 },
      { pos: [32, 26, -68] as [number, number, number], scale: [10, 2.4, 4] as [number, number, number], opacity: 0.08 },
    ],
    []
  )

  return (
    <>
      <Sky
        distance={450000}
        sunPosition={[85, 22, -45]}
        mieCoefficient={0.004}
        mieDirectionalG={0.8}
        rayleigh={1.55}
        turbidity={6.2}
      />
      <mesh position={[0, 18, -55]} rotation={[0.12, 0, 0]}>
        <planeGeometry args={[180, 42]} />
        <meshBasicMaterial color="#8ab8d8" transparent opacity={0.28} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[38, 34, -72]}>
        <sphereGeometry args={[2.0, 10, 10]} />
        <meshBasicMaterial color="#fff4e8" transparent opacity={0.14} toneMapped={false} depthWrite={false} />
      </mesh>
      {cloudBanks.map((bank, i) => (
        <group key={i} position={bank.pos} rotation={[0.04, i * 0.7, 0.02]}>
          {[0, 0.35, -0.3].map((xOff, j) => (
            <mesh key={j} position={[xOff * bank.scale[0] * 0.25, 0, j * 0.8]}>
              <boxGeometry args={[bank.scale[0] * 0.42, bank.scale[1] * 0.55, bank.scale[2] * 0.35]} />
              <meshBasicMaterial
                color="#eef4f8"
                transparent
                opacity={bank.opacity * 0.55}
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

function ChainLinkFence({ x }: { x: number }) {
  const posts = [-6, -14, -20, -27, -34, -41, -48]
  const panelZs = [-10, -17, -24, -31, -38, -45]

  return (
    <group>
      {posts.map(z => (
        <group key={z} position={[x, 0, z]}>
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

      <mesh position={[x, 2.15, -27]}>
        <boxGeometry args={[0.08, 0.08, 44]} />
        <meshStandardMaterial color="#a8a098" metalness={0.68} roughness={0.35} />
      </mesh>
      <mesh position={[x, 0.42, -27]}>
        <boxGeometry args={[0.08, 0.08, 44]} />
        <meshStandardMaterial color="#8a8278" metalness={0.62} roughness={0.4} />
      </mesh>

      {panelZs.map(z => (
        <group key={z} position={[x, 1.25, z]}>
          <mesh>
            <planeGeometry args={[0.02, 1.55]} />
            <meshStandardMaterial color="#9a9488" metalness={0.72} roughness={0.32} transparent opacity={0.55} />
          </mesh>
          {[-0.55, 0, 0.55].map(yOff => (
            <mesh key={yOff} position={[0, yOff, 0]} rotation={[0, 0, Math.PI / 4]}>
              <planeGeometry args={[0.02, 1.4]} />
              <meshStandardMaterial color="#a8a298" metalness={0.7} roughness={0.35} transparent opacity={0.45} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function IndoorRange({ config }: { config: MapConfig }) {
  const lightZs = [-8, -18, -28, -38, -48]
  const laneZs = [-12, -26, -40]

  return (
    <>
      <IndoorLaneLightBars accent={config.accent} />
      <IndoorUpperWallLights accent={config.accent} />
      <IndoorHangingFixtures accent={config.accent} />
      <IndoorOverheadLightRows accent={config.accent} />
      <IndoorCeilingGrid accent={config.accent} />
      <IndoorCeilingVault accent={config.accent} />

      {[-14, 0, 14].map(x => (
        <mesh key={`duct-${x}`} position={[x, INDOOR_CEILING_Y - 0.87, -24]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[54, 0.5, 0.5]} />
          <meshStandardMaterial color="#9aacb8" metalness={0.55} roughness={0.38} />
        </mesh>
      ))}

      {lightZs.map(z => (
        <CeilingLightStrip key={z} z={z} accent={config.accent} intensity={1.95} />
      ))}

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

      {[-9, 9].map(x => (
        <mesh key={`divider-${x}`} position={[x, 2.8, -24]}>
          <boxGeometry args={[0.08, 5.6, 50]} />
          <meshStandardMaterial color="#4a6878" metalness={0.35} roughness={0.48} transparent opacity={0.85} />
        </mesh>
      ))}

      {[-12, 0, 12].map(x => (
        <mesh key={x} position={[x, 5.8, -24]}>
          <boxGeometry args={[0.08, 0.08, 52]} />
          <meshStandardMaterial color="#7ce8ff" emissive="#4ec8e8" emissiveIntensity={0.85} toneMapped={false} />
        </mesh>
      ))}

      <mesh position={[0, 5.75, -24]}>
        <boxGeometry args={[34, 0.1, 52]} />
        <meshStandardMaterial color="#6a8a9a" metalness={0.5} roughness={0.32} />
      </mesh>

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

      {[-6, 6].map(x => (
        <mesh key={x} position={[x, -1.05, -21]}>
          <boxGeometry args={[0.14, 1.45, 48]} />
          <meshStandardMaterial color="#5f7f90" metalness={0.48} roughness={0.38} />
        </mesh>
      ))}

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

      <group position={[15, 3.5, -14]}>
        <mesh>
          <boxGeometry args={[2.2, 2.8, 0.12]} />
          <meshStandardMaterial
            color="#88b8d0"
            emissive="#5090b0"
            emissiveIntensity={0.25}
            metalness={0.2}
            roughness={0.35}
            transparent
            opacity={0.75}
          />
        </mesh>
      </group>

      {[-16, 16].map(x => (
        <WallSconce key={x} x={x} z={-16} color={config.accent} />
      ))}

      {[-15, -30, -44].map(z => (
        <pointLight key={z} position={[0, 6.5, z]} intensity={0.68} color="#e8f8ff" distance={16} decay={2} />
      ))}

      {[-12, -24, -36].map(z => (
        <pointLight key={`ceiling-${z}`} position={[0, INDOOR_CEILING_Y - 0.52, z]} intensity={0.78} color="#eef8ff" distance={22} decay={2} />
      ))}

      <pointLight position={[0, 5.5, -46]} intensity={0.85} color="#dff4ff" distance={18} decay={2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 5.85, -46]}>
        <planeGeometry args={[32, 4]} />
        <meshBasicMaterial color="#d8f4ff" transparent opacity={0.22} toneMapped={false} depthWrite={false} />
      </mesh>
    </>
  )
}

function OutdoorRange() {
  const grassTexture = useGrassTexture()
  const gravelTexture = useGravelTexture()
  const earthTexture = useEarthTexture()

  useEffect(() => {
    return () => {
      grassTexture?.dispose()
      gravelTexture?.dispose()
      earthTexture?.dispose()
    }
  }, [grassTexture, gravelTexture, earthTexture])

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

  const dirtPatches = useMemo(
    () => [
      { x: -9, z: -20, w: 5, d: 4, color: '#6a5840' },
      { x: 10, z: -28, w: 4.5, d: 3.5, color: '#5a4838' },
      { x: -7, z: -38, w: 4, d: 3, color: '#625040' },
      { x: 8, z: -16, w: 3.5, d: 3, color: '#584838' },
    ],
    []
  )

  const treeLine = useMemo(
    () => [
      { pos: [-22, -22] as [number, number], type: 'evergreen' as const, scale: 1.15 },
      { pos: [-14, -30] as [number, number], type: 'deciduous' as const, scale: 1.0 },
      { pos: [10, -26] as [number, number], type: 'evergreen' as const, scale: 1.05 },
      { pos: [20, -36] as [number, number], type: 'deciduous' as const, scale: 1.2 },
      { pos: [-26, -40] as [number, number], type: 'evergreen' as const, scale: 0.95 },
      { pos: [2, -44] as [number, number], type: 'deciduous' as const, scale: 1.08 },
      { pos: [-16, -52] as [number, number], type: 'evergreen' as const, scale: 1.25 },
      { pos: [24, -48] as [number, number], type: 'deciduous' as const, scale: 0.92 },
      { pos: [-8, -58] as [number, number], type: 'evergreen' as const, scale: 1.1 },
      { pos: [14, -56] as [number, number], type: 'deciduous' as const, scale: 0.85 },
    ],
    []
  )

  const bushes = useMemo(
    () => [
      [-10, -14], [12, -16], [-6, -22], [8, -20], [16, -30], [-4, -34],
    ],
    []
  )

  return (
    <>
      <OutdoorSky />

      {[-38, -58, -78, -98].map((z, index) => (
        <mesh key={z} position={[0, 0.6 + index * 0.55, z]} scale={[1.5 - index * 0.1, 1, 1]}>
          <boxGeometry args={[52 - index * 5, 2.2 + index * 0.7, 3.5]} />
          <meshStandardMaterial
            color={['#6a8498', '#7a94a8', '#8aa4b8', '#9ab4c8'][index]}
            roughness={0.98}
            metalness={0.01}
            transparent
            opacity={0.52 - index * 0.04}
            flatShading
          />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -10]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial
          map={grassTexture}
          color="#4a7a48"
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

      {dirtPatches.map((patch, i) => (
        <mesh
          key={`dirt-patch-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[patch.x, -1.984, patch.z]}
        >
          <planeGeometry args={[patch.w, patch.d]} />
          <meshStandardMaterial map={earthTexture} color={patch.color} roughness={0.94} transparent opacity={0.55} />
        </mesh>
      ))}

      {/* Main gravel shooting lane — firing line to berm */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.968, -24]} receiveShadow>
        <planeGeometry args={[12, 50]} />
        <meshStandardMaterial map={gravelTexture} color="#9a8a72" roughness={0.88} />
      </mesh>

      {/* Inner packed-dirt center strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.967, -24]}>
        <planeGeometry args={[5.5, 48]} />
        <meshStandardMaterial map={earthTexture} color="#756048" roughness={0.9} />
      </mesh>

      {/* Center chalk line for lane alignment */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.966, -24]}>
        <planeGeometry args={[0.14, 48]} />
        <meshStandardMaterial color="#e8e4d8" emissive="#d8d4c8" emissiveIntensity={0.08} roughness={0.82} />
      </mesh>

      {/* Lane edge borders */}
      {[-6.2, 6.2].map(x => (
        <mesh key={`lane-edge-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, -1.966, -24]}>
          <planeGeometry args={[0.45, 50]} />
          <meshStandardMaterial color="#4a4038" roughness={0.9} />
        </mesh>
      ))}

      {/* Firing line and distance markers */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.965, -2.5]}>
        <planeGeometry args={[12.5, 0.45]} />
        <meshStandardMaterial color="#e8d848" emissive="#c8b028" emissiveIntensity={0.12} roughness={0.75} />
      </mesh>
      {[-8, -16, -24, -32, -40].map(z => (
        <mesh key={`marker-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.965, z]}>
          <planeGeometry args={[12.5, 0.12]} />
          <meshStandardMaterial color="#7a7068" roughness={0.85} transparent opacity={0.65} />
        </mesh>
      ))}

      {/* Berm approach gravel pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.966, -42]}>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial map={gravelTexture} color="#7a6a52" roughness={0.88} />
      </mesh>

      <mesh position={[0, 0.85, -44]}>
        <boxGeometry args={[42, 1.7, 2.8]} />
        <meshStandardMaterial map={earthTexture} color="#6a5840" roughness={0.96} />
      </mesh>
      <mesh position={[0, 0.35, -44.5]}>
        <boxGeometry args={[40, 0.55, 2.4]} />
        <meshStandardMaterial map={earthTexture} color="#5a4838" roughness={0.94} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.62, -44.8]}>
        <planeGeometry args={[40, 2.8]} />
        <meshStandardMaterial map={grassTexture} color="#4a8a48" roughness={0.93} side={THREE.DoubleSide} />
      </mesh>
      {[-14, -7, 0, 7, 14].map(x => (
        <mesh key={x} position={[x, 1.48, -45.2]}>
          <boxGeometry args={[0.35, 0.22, 0.35]} />
          <meshStandardMaterial color="#6a6458" roughness={0.92} />
        </mesh>
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

      {bushes.map(([x, z], i) => (
        <BushClump key={i} position={[x, -1.95, z]} scale={0.85 + (i % 3) * 0.12} />
      ))}

      {treeLine.map(({ pos, type, scale }, i) =>
        type === 'evergreen' ? (
          <EvergreenTree key={i} position={[pos[0], -2, pos[1]]} scale={scale} />
        ) : (
          <DeciduousTree key={i} position={[pos[0], -2, pos[1]]} scale={scale} />
        )
      )}

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

  const pallets = useMemo(
    () => [
      [-16, -12], [16, -14], [-6, -36], [8, -38],
    ],
    []
  )

  return (
    <>
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

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 11.95, -24]}>
        <planeGeometry args={[14, 58]} />
        <meshBasicMaterial color="#fff0d8" transparent opacity={0.08} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
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

      {/* Back-wall window silhouettes + warm wash for rear depth */}
      {[-8, -2.5, 2.5, 8].map(x => (
        <group key={`wh-window-${x}`}>
          <mesh position={[x, 5.2, -47.55]}>
            <planeGeometry args={[3.2, 2.4]} />
            <meshBasicMaterial color="#0c1018" transparent opacity={0.55} toneMapped={false} />
          </mesh>
          <mesh position={[x, 5.2, -47.48]}>
            <planeGeometry args={[2.6, 1.8]} />
            <meshBasicMaterial color="#ffe8c0" transparent opacity={0.08} toneMapped={false} depthWrite={false} />
          </mesh>
        </group>
      ))}

      {/* Distant rack + forklift silhouettes — cheap depth read without new lights */}
      {[-12, -4, 4, 12].map(x => (
        <mesh key={`rear-rack-${x}`} position={[x, 3.8, -47.35]}>
          <boxGeometry args={[2.8, 6.8, 0.35]} />
          <meshBasicMaterial color="#14100c" transparent opacity={0.72} toneMapped={false} />
        </mesh>
      ))}
      <group position={[-10, -1.2, -46.8]}>
        <mesh>
          <boxGeometry args={[2.4, 0.9, 1.4]} />
          <meshBasicMaterial color="#181410" transparent opacity={0.78} toneMapped={false} />
        </mesh>
        <mesh position={[0.35, 1.35, 0]}>
          <boxGeometry args={[0.18, 1.6, 0.18]} />
          <meshBasicMaterial color="#1a1612" transparent opacity={0.75} toneMapped={false} />
        </mesh>
        <mesh position={[0.35, 2.15, 0.35]} rotation={[-0.35, 0, 0]}>
          <boxGeometry args={[1.1, 0.12, 0.55]} />
          <meshBasicMaterial color="#1c1814" transparent opacity={0.72} toneMapped={false} />
        </mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 6.2, -47.2]}>
        <planeGeometry args={[30, 5.5]} />
        <meshBasicMaterial color="#ffe0b0" transparent opacity={0.07} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

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
        <mesh position={[0, 0.2, 0.16]}>
          <planeGeometry args={[26, 7.2]} />
          <meshBasicMaterial color="#ffe8c0" transparent opacity={0.06} toneMapped={false} depthWrite={false} />
        </mesh>
      </group>

      <mesh position={[0, 3.5, -47.9]}>
        <boxGeometry args={[32, 6.5, 0.35]} />
        <meshStandardMaterial color="#4a4030" metalness={0.4} roughness={0.75} />
      </mesh>
      <mesh position={[0, 5.8, -47.75]}>
        <planeGeometry args={[30, 5.5]} />
        <meshBasicMaterial color="#fff0d8" transparent opacity={0.1} toneMapped={false} depthWrite={false} />
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

      {[-6, 6].map(x => (
        <group key={x}>
          <mesh position={[x, -1.03, -21]}>
            <boxGeometry args={[0.14, 1.4, 48]} />
            <meshStandardMaterial color="#4a3d30" metalness={0.5} roughness={0.45} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, -1.965, -21]}>
            <planeGeometry args={[0.22, 46]} />
            <meshStandardMaterial color="#c8a020" emissive="#a88018" emissiveIntensity={0.18} roughness={0.8} />
          </mesh>
        </group>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.964, -21]}>
        <planeGeometry args={[10, 46]} />
        <meshStandardMaterial color="#6a6058" metalness={0.15} roughness={0.75} />
      </mesh>

      {[-10, -22, -34, -46].map(z => (
        <mesh key={`aisle-shadow-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9645, z]}>
          <planeGeometry args={[8.5, 0.35]} />
          <meshStandardMaterial color="#3a342c" roughness={0.92} transparent opacity={0.22} depthWrite={false} />
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
        <meshStandardMaterial color="#4a4840" roughness={0.88} transparent opacity={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[11, -1.963, -35]}>
        <planeGeometry args={[3.5, 14]} />
        <meshStandardMaterial color="#4a4840" roughness={0.88} transparent opacity={0.3} />
      </mesh>

      {[-16, 16].map(x => (
        <WallSconce key={x} x={x} z={-14} color={config.accent} />
      ))}
    </>
  )
}

export function RangeEnvironment({ config }: RangeEnvironmentProps) {
  const isOutdoor = config.id === 'outdoor'
  const isWarehouse = config.id === 'warehouse'
  const isIndoor = config.id === 'indoor'

  return (
    <>
      <color attach="background" args={[config.background]} />
      <fog attach="fog" args={[config.fog.color, config.fog.near, config.fog.far]} />

      <hemisphereLight
        args={[config.hemisphere.sky, config.hemisphere.ground, config.hemisphere.intensity]}
      />
      <directionalLight
        position={config.directional.position}
        intensity={config.directional.intensity}
        color={config.directional.color}
        castShadow={isWarehouse}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={75}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={18}
        shadow-camera-bottom={-6}
      />
      {config.fillLight && (
        <pointLight
          position={config.fillLight.position}
          intensity={config.fillLight.intensity}
          color={config.fillLight.color}
          distance={42}
          decay={2}
        />
      )}
      {config.rimLight && (
        <directionalLight
          position={config.rimLight.position}
          intensity={config.rimLight.intensity}
          color={config.rimLight.color}
        />
      )}

      {!isOutdoor && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -20]} receiveShadow>
          <planeGeometry args={[48, 84]} />
          <meshStandardMaterial
            color={config.floor.color}
            metalness={config.floor.metalness}
            roughness={config.floor.roughness}
          />
        </mesh>
      )}


      {!isOutdoor && !isWarehouse && (
        <gridHelper position={[0, -1.97, -20]} args={config.grid} />
      )}

      {isIndoor && <IndoorRange config={config} />}
      {isOutdoor && <OutdoorRange />}
      {isWarehouse && <WarehouseRange config={config} />}
    </>
  )
}
