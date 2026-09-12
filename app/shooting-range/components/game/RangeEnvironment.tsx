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
        <meshStandardMaterial color="#d8e8f0" emissive={accent} emissiveIntensity={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[width + 0.6, 0.06, 0.72]} />
        <meshStandardMaterial color="#8a9aa8" metalness={0.35} roughness={0.55} />
      </mesh>
      <pointLight intensity={intensity} distance={16} color={accent} decay={2} position={[0, -0.2, 0]} />
    </group>
  )
}

function IndoorRange({ config }: { config: MapConfig }) {
  const lightZs = [-10, -22, -34, -46]
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 12.02, -18]}>
        <planeGeometry args={[42, 72]} />
        <meshStandardMaterial
          color="#edf4fa"
          emissive="#c8e4f4"
          emissiveIntensity={0.42}
          roughness={0.78}
          side={THREE.DoubleSide}
        />
      </mesh>

      {lightZs.map(z => (
        <CeilingLightStrip key={z} z={z} accent={config.accent} intensity={1.85} />
      ))}

      <ambientLight intensity={0.28} color="#d8ecff" />

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

      {[-12, 0, 12].map(x => (
        <mesh key={x} position={[x, 5.8, -24]}>
          <boxGeometry args={[0.08, 0.08, 52]} />
          <meshStandardMaterial color="#7ce8ff" emissive="#4ec8e8" emissiveIntensity={0.8} toneMapped={false} />
        </mesh>
      ))}

      <mesh position={[0, 5.75, -24]}>
        <boxGeometry args={[34, 0.1, 52]} />
        <meshStandardMaterial color="#6a8a9a" metalness={0.5} roughness={0.32} />
      </mesh>

      {[-6, 6].map(x => (
        <mesh key={x} position={[x, -1.05, -21]}>
          <boxGeometry args={[0.14, 1.45, 48]} />
          <meshStandardMaterial color="#5f7f90" metalness={0.48} roughness={0.38} />
        </mesh>
      ))}

      {[-14, -28, -42].map(z => (
        <group key={z} position={[0, 0.02, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[32, 0.35]} />
            <meshStandardMaterial color="#8aa0b0" metalness={0.35} roughness={0.45} />
          </mesh>
        </group>
      ))}
    </>
  )
}

function OutdoorRange() {
  const treePositions = useMemo(
    () => [
      [-32, -38], [-18, -52], [22, -44], [34, -58], [-40, -62], [12, -66],
    ],
    []
  )

  return (
    <>
      <mesh position={[0, 8, 0]}>
        <sphereGeometry args={[130, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
        <meshBasicMaterial color="#8ec8f0" side={THREE.BackSide} toneMapped={false} />
      </mesh>

      <mesh position={[18, 28, -72]}>
        <sphereGeometry args={[4.5, 16, 16]} />
        <meshBasicMaterial color="#fff4c8" toneMapped={false} />
      </mesh>
      <directionalLight position={[18, 28, -72]} intensity={0.35} color="#fff8e0" />

      {[-55, -38, -22].map((z, index) => (
        <mesh key={z} position={[0, 4 + index * 2.2, z]}>
          <boxGeometry args={[150 - index * 14, 10 + index * 3.5, 1.4]} />
          <meshStandardMaterial
            color={['#5a7a92', '#6a8ea8', '#7a9cb2'][index]}
            roughness={0.96}
            metalness={0.02}
          />
        </mesh>
      ))}

      <mesh position={[0, 1.2, -32]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[28, 3.5]} />
        <meshStandardMaterial color="#8a7a58" roughness={0.92} />
      </mesh>

      <mesh position={[0, 2.8, -48]}>
        <boxGeometry args={[34, 5.5, 1.2]} />
        <meshStandardMaterial color="#7a6a52" roughness={0.9} />
      </mesh>

      {treePositions.map(([x, z], index) => (
        <group key={`${x}-${z}`} position={[x, 0, z]}>
          <mesh position={[0, 1.6, 0]}>
            <cylinderGeometry args={[0.35, 0.5, 3.2, 8]} />
            <meshStandardMaterial color="#5f4a32" roughness={0.95} />
          </mesh>
          <mesh position={[0, 3.8 + (index % 2) * 0.4, 0]}>
            <sphereGeometry args={[1.6 + (index % 3) * 0.25, 10, 10]} />
            <meshStandardMaterial color="#3f7a42" roughness={0.88} />
          </mesh>
        </group>
      ))}
    </>
  )
}

function WarehouseRange({ config }: { config: MapConfig }) {
  const crateStacks = useMemo(
    () => [
      { x: -14, z: -28, h: 2.2 },
      { x: 0, z: -32, h: 2.8 },
      { x: 14, z: -26, h: 2.0 },
      { x: -8, z: -40, h: 1.6 },
      { x: 10, z: -42, h: 2.4 },
    ],
    []
  )

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 12.02, -18]}>
        <planeGeometry args={[42, 72]} />
        <meshStandardMaterial
          color="#4a4438"
          emissive="#6a5a40"
          emissiveIntensity={0.18}
          metalness={0.35}
          roughness={0.72}
          side={THREE.DoubleSide}
        />
      </mesh>

      <ambientLight intensity={0.22} color="#ffe8c8" />

      {[-16, -4, 8, 20].map(x => (
        <mesh key={x} position={[x, 11.2, -24]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[56, 0.22, 0.38]} />
          <meshStandardMaterial color="#5a4a38" metalness={0.65} roughness={0.42} />
        </mesh>
      ))}

      {[-11, -33].map(z => (
        <group key={z} position={[0, 10.8, z]}>
          <mesh>
            <boxGeometry args={[30, 0.12, 0.5]} />
            <meshStandardMaterial
              color="#fff0d0"
              emissive="#ffb347"
              emissiveIntensity={0.75}
              toneMapped={false}
            />
          </mesh>
          <pointLight intensity={1.45} distance={18} color={config.accent} decay={2} position={[0, -0.15, 0]} />
        </group>
      ))}

      <mesh position={[-18, 6, -24]}>
        <boxGeometry args={[0.55, 12.2, 56]} />
        <meshStandardMaterial color="#3a3028" metalness={0.35} roughness={0.7} />
      </mesh>
      <mesh position={[18, 6, -24]}>
        <boxGeometry args={[0.55, 12.2, 56]} />
        <meshStandardMaterial color="#3a3028" metalness={0.35} roughness={0.7} />
      </mesh>
      <mesh position={[0, 6, -48.2]}>
        <boxGeometry args={[36.5, 12.2, 0.55]} />
        <meshStandardMaterial color="#2a2218" metalness={0.3} roughness={0.68} />
      </mesh>

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
          {[0, 1.8, 3.6].map(y => (
            <mesh key={y} position={[0, y - 1.5, 0]}>
              <boxGeometry args={[2.8, 0.12, 0.8]} />
              <meshStandardMaterial color="#5a4a38" metalness={0.4} roughness={0.6} />
            </mesh>
          ))}
        </group>
      ))}

      {[-6, 6].map(x => (
        <mesh key={x} position={[x, -1.03, -21]}>
          <boxGeometry args={[0.14, 1.4, 48]} />
          <meshStandardMaterial color="#4a3d30" metalness={0.5} roughness={0.45} />
        </mesh>
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
        castShadow
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
            <meshStandardMaterial color="#3d6b3f" roughness={0.96} metalness={0.02} transparent opacity={0.28} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.975, -10]}>
            <ringGeometry args={[18, 52, 48]} />
            <meshStandardMaterial color="#6a9a5a" roughness={0.94} transparent opacity={0.22} />
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
