import { useMemo } from 'react'
import * as THREE from 'three'
import type { MapConfig } from '../../utils/mapConfigs'

interface RangeEnvironmentProps {
  config: MapConfig
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
    <group position={[0, 11.55, z]}>
      <mesh>
        <boxGeometry args={[width, 0.14, 0.55]} />
        <meshStandardMaterial
          color="#e8f4fc"
          emissive={accent}
          emissiveIntensity={0.72}
          roughness={0.32}
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

function PineTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.32, 2.2, 6]} />
        <meshStandardMaterial color="#4a3828" roughness={0.96} />
      </mesh>
      {[
        { y: 2.3, r: 1.65, h: 1.35, color: '#2a5530' },
        { y: 3.2, r: 1.25, h: 1.2, color: '#316038' },
        { y: 3.95, r: 0.85, h: 1.0, color: '#3a6a42' },
      ].map(layer => (
        <mesh key={layer.y} position={[0, layer.y, 0]} castShadow>
          <coneGeometry args={[layer.r, layer.h, 7]} />
          <meshStandardMaterial color={layer.color} roughness={0.92} />
        </mesh>
      ))}
    </group>
  )
}

function BroadleafTree({
  position,
  scale = 1,
}: {
  position: [number, number, number]
  scale?: number
}) {
  const foliage = useMemo(
    () => [
      [0, 3.4, 0, 1.4],
      [-0.55, 3.0, 0.2, 1.0],
      [0.5, 3.1, -0.15, 0.95],
      [0.1, 3.8, 0.35, 0.85],
    ],
    []
  )

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.22, 2.8, 6]} />
        <meshStandardMaterial color="#5a4532" roughness={0.95} />
      </mesh>
      {foliage.map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <boxGeometry args={[s * 1.6, s * 1.1, s * 1.4]} />
          <meshStandardMaterial color={['#3d7040', '#457848', '#3a6840'][i % 3]} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function OutdoorSky() {
  const clouds = useMemo(
    () => [
      [-28, 34, -88, 16, 2.4, 0.16],
      [20, 32, -84, 14, 2.0, 0.14],
      [-4, 36, -96, 12, 1.8, 0.12],
    ],
    []
  )

  return (
    <>
      <mesh position={[0, 6, -30]}>
        <sphereGeometry args={[110, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshBasicMaterial color="#3d7aaa" side={THREE.BackSide} toneMapped={false} />
      </mesh>
      <mesh position={[0, -4, -50]}>
        <sphereGeometry args={[100, 32, 14, 0, Math.PI * 2, 0, Math.PI * 0.32]} />
        <meshBasicMaterial
          color="#c8e4f4"
          side={THREE.BackSide}
          transparent
          opacity={0.55}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[42, 36, -78]}>
        <sphereGeometry args={[4.2, 10, 10]} />
        <meshBasicMaterial color="#fff6e0" transparent opacity={0.28} toneMapped={false} />
      </mesh>
      <mesh position={[42, 36, -78]}>
        <sphereGeometry args={[1.4, 8, 8]} />
        <meshBasicMaterial color="#fffaf2" toneMapped={false} />
      </mesh>
      {clouds.map(([x, y, z, w, h, opacity], i) => (
        <group key={i} position={[x, y, z]} rotation={[0.08, (i - 1) * 0.45, 0.05]}>
          <mesh>
            <planeGeometry args={[w, h]} />
            <meshBasicMaterial color="#f8fbff" transparent opacity={opacity} toneMapped={false} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </>
  )
}

function ChainLinkFence({ x }: { x: number }) {
  const posts = [-6, -20, -34, -48]
  return (
    <group>
      {posts.map(z => (
        <mesh key={z} position={[x, 1.15, z]} castShadow>
          <boxGeometry args={[0.12, 2.3, 0.12]} />
          <meshStandardMaterial color="#7a7068" metalness={0.55} roughness={0.48} />
        </mesh>
      ))}
      {[-6, -48].map(z => (
        <group key={`rail-${z}`}>
          <mesh position={[x, 2.05, z === -6 ? -6 : -48]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.06, 0.06, Math.abs(z === -6 ? 0 : 42)]} />
            <meshStandardMaterial color="#9a9088" metalness={0.65} roughness={0.38} />
          </mesh>
        </group>
      ))}
      <mesh position={[x, 2.05, -27]}>
        <boxGeometry args={[0.06, 0.06, 42]} />
        <meshStandardMaterial color="#9a9088" metalness={0.65} roughness={0.38} />
      </mesh>
      <mesh position={[x, 0.35, -27]}>
        <boxGeometry args={[0.06, 0.06, 42]} />
        <meshStandardMaterial color="#8a8278" metalness={0.6} roughness={0.42} />
      </mesh>
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} position={[x, 1.2, -8 - i * 2.9]}>
          <boxGeometry args={[0.03, 1.65, 0.03]} />
          <meshStandardMaterial color="#a8a098" metalness={0.7} roughness={0.35} transparent opacity={0.65} />
        </mesh>
      ))}
    </group>
  )
}

function IndoorRange({ config }: { config: MapConfig }) {
  const lightZs = [-8, -18, -28, -38, -48]
  const laneZs = [-12, -26, -40]

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 11.85, -18]}>
        <planeGeometry args={[42, 72]} />
        <meshStandardMaterial
          color="#f8fcff"
          emissive="#e0f0ff"
          emissiveIntensity={0.78}
          roughness={0.68}
          side={THREE.DoubleSide}
        />
      </mesh>

      {[-8, 0, 8].map(x => (
        <mesh key={`panel-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 10.6, -20]}>
          <planeGeometry args={[10, 18]} />
          <meshStandardMaterial
            color="#eef8ff"
            emissive="#c8e8f8"
            emissiveIntensity={0.35}
            roughness={0.55}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {[-10, 10].map(x => (
        <mesh key={`beam-${x}`} position={[x, 11.2, -24]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[54, 0.35, 0.45]} />
          <meshStandardMaterial color="#a8bcc8" metalness={0.45} roughness={0.42} />
        </mesh>
      ))}

      {[-14, 0, 14].map(x => (
        <mesh key={`duct-${x}`} position={[x, 10.85, -24]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[54, 0.5, 0.5]} />
          <meshStandardMaterial color="#9aacb8" metalness={0.55} roughness={0.38} />
        </mesh>
      ))}

      {lightZs.map(z => (
        <CeilingLightStrip key={z} z={z} accent={config.accent} intensity={2.1} />
      ))}

      <ambientLight intensity={0.42} color="#e0f0ff" />

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
        <pointLight key={z} position={[0, 6.5, z]} intensity={0.55} color="#e8f8ff" distance={16} decay={2} />
      ))}
    </>
  )
}

function OutdoorRange() {
  const treeLine = useMemo(
    () => [
      { pos: [-20, -24] as [number, number], type: 'pine' as const, scale: 1.1 },
      { pos: [-12, -32] as [number, number], type: 'broad' as const, scale: 0.95 },
      { pos: [8, -28] as [number, number], type: 'pine' as const, scale: 1.0 },
      { pos: [18, -38] as [number, number], type: 'broad' as const, scale: 1.15 },
      { pos: [-24, -42] as [number, number], type: 'pine' as const, scale: 0.9 },
      { pos: [4, -46] as [number, number], type: 'broad' as const, scale: 1.05 },
      { pos: [-14, -54] as [number, number], type: 'pine' as const, scale: 1.2 },
      { pos: [22, -50] as [number, number], type: 'broad' as const, scale: 0.88 },
    ],
    []
  )

  const terrainPatches = useMemo(
    (): Array<[number, number, number, number, number, string]> => [
      [-14, -16, 12, 9, 0.04, '#4a8450'],
      [11, -18, 14, 8, -0.03, '#3f7844'],
      [-5, -30, 16, 11, 0.05, '#528a54'],
      [16, -34, 11, 9, -0.02, '#467a4a'],
      [-18, -40, 13, 10, 0.03, '#4a8650'],
      [8, -48, 15, 8, -0.04, '#3d7042'],
    ],
    []
  )

  return (
    <>
      <OutdoorSky />

      {[-34, -52, -72].map((z, index) => (
        <mesh key={z} position={[0, 2.2 + index * 2.2, z]}>
          <boxGeometry args={[140 - index * 18, 5 + index * 2.5, 3]} />
          <meshStandardMaterial
            color={['#5a7a92', '#6a8ea4', '#7a9cb4'][index]}
            roughness={0.98}
            metalness={0.01}
            transparent
            opacity={0.82 - index * 0.08}
          />
        </mesh>
      ))}

      {terrainPatches.map(([x, z, w, d, tilt, color], i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2 + tilt, (i % 3) * 0.4, 0]}
          position={[x, -1.978 + Math.abs(tilt) * 2, z]}
        >
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial color={color} roughness={0.94} metalness={0.02} />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.972, -8]}>
        <planeGeometry args={[14, 3.5]} />
        <meshStandardMaterial color="#8a7a62" roughness={0.92} />
      </mesh>

      <mesh position={[0, 0.55, -43]} rotation={[0.42, 0, 0]}>
        <boxGeometry args={[40, 3.8, 2.4]} />
        <meshStandardMaterial color="#6a5a42" roughness={0.96} />
      </mesh>
      <mesh position={[0, 2.35, -44.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[38, 2.8]} />
        <meshStandardMaterial color="#4a8a48" roughness={0.93} />
      </mesh>
      <mesh position={[0, 1.5, -44.8]} rotation={[0.38, 0, 0]}>
        <boxGeometry args={[36, 0.35, 0.25]} />
        <meshStandardMaterial color="#5a5048" roughness={0.88} />
      </mesh>

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

      {treeLine.map(({ pos, type, scale }, i) =>
        type === 'pine' ? (
          <PineTree key={i} position={[pos[0], -2, pos[1]]} scale={scale} />
        ) : (
          <BroadleafTree key={i} position={[pos[0], -2, pos[1]]} scale={scale} />
        )
      )}
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

      <ambientLight intensity={0.35} color="#ffe8c8" />

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
              emissiveIntensity={0.85}
              toneMapped={false}
            />
          </mesh>
          <pointLight intensity={1.75} distance={22} color={config.accent} decay={2} position={[0, -0.15, 0]} />
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
        castShadow={!isOutdoor}
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

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, isOutdoor ? -10 : -20]} receiveShadow>
        <planeGeometry args={[isOutdoor ? 160 : 48, isOutdoor ? 160 : 84]} />
        <meshStandardMaterial
          color={config.floor.color}
          metalness={config.floor.metalness}
          roughness={config.floor.roughness}
        />
      </mesh>

      {isOutdoor && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.985, -10]}>
            <planeGeometry args={[160, 160]} />
            <meshStandardMaterial color="#3a6840" roughness={0.96} metalness={0.02} transparent opacity={0.28} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.983, -10]}>
            <planeGeometry args={[160, 160, 32, 32]} />
            <meshStandardMaterial
              color="#4a7a4e"
              roughness={0.97}
              metalness={0.01}
              wireframe={false}
              transparent
              opacity={0.12}
            />
          </mesh>
        </>
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
