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
        <meshStandardMaterial color="#d8e8f0" emissive={accent} emissiveIntensity={0.62} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[width + 0.6, 0.06, 0.72]} />
        <meshStandardMaterial color="#8a9aa8" metalness={0.35} roughness={0.55} />
      </mesh>
      <pointLight intensity={intensity} distance={18} color={accent} decay={2} position={[0, -0.2, 0]} />
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
      <pointLight intensity={0.55} distance={9} color={color} decay={2} />
    </group>
  )
}

function IndoorRange({ config }: { config: MapConfig }) {
  const lightZs = [-8, -18, -28, -38, -48]
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 12.02, -18]}>
        <planeGeometry args={[42, 72]} />
        <meshStandardMaterial
          color="#edf4fa"
          emissive="#c8e4f4"
          emissiveIntensity={0.55}
          roughness={0.78}
          side={THREE.DoubleSide}
        />
      </mesh>

      {[-14, 0, 14].map(x => (
        <mesh key={`duct-${x}`} position={[x, 11.35, -24]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[54, 0.55, 0.55]} />
          <meshStandardMaterial color="#9aacb8" metalness={0.55} roughness={0.38} />
        </mesh>
      ))}

      {lightZs.map(z => (
        <CeilingLightStrip key={z} z={z} accent={config.accent} intensity={1.95} />
      ))}

      <ambientLight intensity={0.32} color="#d8ecff" />

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

      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={`trap-${i}`} position={[0, 1.4 + i * 1.1, -47.75]}>
          <boxGeometry args={[33.5, 0.85, 0.18]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#2a3844' : '#1e2c38'}
            metalness={0.15}
            roughness={0.88}
          />
        </mesh>
      ))}

      {[-6, 6].map(x => (
        <mesh key={x} position={[x, -1.05, -21]}>
          <boxGeometry args={[0.14, 1.45, 48]} />
          <meshStandardMaterial color="#5f7f90" metalness={0.48} roughness={0.38} />
        </mesh>
      ))}

      {[-10, -24, -38].map((z, i) => (
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
              emissiveIntensity={0.5}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      {[-16, 16].map(x => (
        <WallSconce key={x} x={x} z={-16} color={config.accent} />
      ))}

      {[-15, -30, -44].map(z => (
        <pointLight key={z} position={[0, 5.5, z]} intensity={0.45} color="#dff6ff" distance={14} decay={2} />
      ))}
    </>
  )
}

function OutdoorSky() {
  return (
    <>
      <mesh position={[0, 18, -25]}>
        <sphereGeometry args={[120, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
        <meshBasicMaterial color="#5a9fcc" side={THREE.BackSide} toneMapped={false} />
      </mesh>
      <mesh position={[0, -2, -40]}>
        <sphereGeometry args={[108, 32, 14, 0, Math.PI * 2, 0, Math.PI * 0.36]} />
        <meshBasicMaterial color="#c0e0f4" side={THREE.BackSide} transparent opacity={0.5} toneMapped={false} />
      </mesh>
      <mesh position={[38, 24, -62]}>
        <sphereGeometry args={[6, 16, 16]} />
        <meshBasicMaterial color="#fff6d8" toneMapped={false} />
      </mesh>
      <pointLight position={[38, 24, -62]} intensity={0.5} color="#fff4d0" distance={120} decay={2} />
      {[
        [-20, 26, -70, 8, 2.2],
        [14, 24, -65, 10, 1.8],
        [-8, 28, -80, 7, 1.5],
      ].map(([x, y, z, w, h], i) => (
        <mesh key={i} position={[x, y, z]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.35} toneMapped={false} />
        </mesh>
      ))}
    </>
  )
}

function OutdoorRange() {
  const treePositions = useMemo(
    () => [
      [-16, -22], [-10, -30], [12, -26], [20, -36], [-22, -40], [6, -44], [-14, -52], [18, -48],
    ],
    []
  )
  const grassPatches = useMemo(
    () => [
      [-12, -14, 9, 6], [10, -16, 11, 7], [-6, -28, 13, 9], [16, -32, 10, 8], [-18, -38, 12, 8],
    ],
    []
  )

  return (
    <>
      <OutdoorSky />

      {[-32, -48, -68].map((z, index) => (
        <mesh key={z} position={[0, 1.8 + index * 1.8, z]}>
          <boxGeometry args={[150 - index * 20, 4 + index * 3, 2]} />
          <meshStandardMaterial
            color={['#6a8ea8', '#7a9cb8', '#8aaccc'][index]}
            roughness={0.98}
            metalness={0.01}
            transparent
            opacity={0.85 - index * 0.1}
          />
        </mesh>
      ))}

      <group position={[-20, 0, -12]}>
        <mesh position={[0, 2.5, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 5, 8]} />
          <meshStandardMaterial color="#7a6a58" roughness={0.85} />
        </mesh>
        <mesh position={[0, 5.2, 0]}>
          <boxGeometry args={[1.8, 1.1, 0.06]} />
          <meshStandardMaterial color="#d84848" roughness={0.7} />
        </mesh>
      </group>

      {grassPatches.map(([x, z, w, d], i) => (
        <mesh key={`${x}-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, -1.982, z]}>
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial
            color={['#4a8a4d', '#3f7a42', '#568f58'][i % 3]}
            roughness={0.96}
            transparent
            opacity={0.45}
          />
        </mesh>
      ))}

      <mesh position={[0, -1.97, -30]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 4]} />
        <meshStandardMaterial color="#8a7a58" roughness={0.92} />
      </mesh>

      <mesh position={[0, 1.8, -46]}>
        <boxGeometry args={[36, 3.5, 1.2]} />
        <meshStandardMaterial color="#7a6a52" roughness={0.9} />
      </mesh>

      <group position={[0, -1.35, -4]}>
        <mesh>
          <boxGeometry args={[2.8, 0.7, 1.1]} />
          <meshStandardMaterial color="#6a5a48" roughness={0.88} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[2.4, 0.12, 0.9]} />
          <meshStandardMaterial color="#5a4a38" roughness={0.85} />
        </mesh>
      </group>

      {[-14, 14].map(x => (
        <group key={x}>
          {[-8, -20, -34, -48].map(z => (
            <mesh key={z} position={[x, 1.1, z]}>
              <boxGeometry args={[0.18, 2.2, 0.18]} />
              <meshStandardMaterial color="#6a5a48" roughness={0.9} />
            </mesh>
          ))}
          <mesh position={[x, 1.2, -6]}>
            <boxGeometry args={[0.08, 1.8, 3.5]} />
            <meshStandardMaterial color="#8a7a68" roughness={0.85} transparent opacity={0.7} />
          </mesh>
        </group>
      ))}

      {treePositions.map(([x, z], index) => (
        <group key={`${x}-${z}`} position={[x, 0, z]}>
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.32, 0.48, 3, 8]} />
            <meshStandardMaterial color="#5f4a32" roughness={0.95} />
          </mesh>
          <mesh position={[0, 3.6 + (index % 2) * 0.3, 0]}>
            <sphereGeometry args={[1.5 + (index % 3) * 0.3, 10, 10]} />
            <meshStandardMaterial color={['#3f7a42', '#4a8548', '#367238'][index % 3]} roughness={0.88} />
          </mesh>
        </group>
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
          emissiveIntensity={0.22}
          metalness={0.35}
          roughness={0.72}
          side={THREE.DoubleSide}
        />
      </mesh>

      <ambientLight intensity={0.3} color="#ffe8c8" />

      {[-16, -4, 8, 20].map(x => (
        <mesh key={x} position={[x, 11.2, -24]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[56, 0.22, 0.38]} />
          <meshStandardMaterial color="#5a4a38" metalness={0.65} roughness={0.42} />
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
          <pointLight intensity={1.65} distance={20} color={config.accent} decay={2} position={[0, -0.15, 0]} />
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
            <meshStandardMaterial color="#c8a020" emissive="#a88018" emissiveIntensity={0.15} roughness={0.8} />
          </mesh>
        </group>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.964, -21]}>
        <planeGeometry args={[10, 46]} />
        <meshStandardMaterial color="#6a6058" metalness={0.15} roughness={0.75} />
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
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.985, -10]}>
          <planeGeometry args={[160, 160]} />
          <meshStandardMaterial color="#3d6b3f" roughness={0.96} metalness={0.02} transparent opacity={0.22} />
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
