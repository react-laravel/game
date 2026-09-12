import type { MapConfig } from '../../utils/mapConfigs'

interface RangeEnvironmentProps {
  config: MapConfig
}

export function RangeEnvironment({ config }: RangeEnvironmentProps) {
  const isOutdoor = config.id === 'outdoor'
  const isWarehouse = config.id === 'warehouse'

  return (
    <>
      <color attach="background" args={[config.background]} />
      <fog
        attach="fog"
        args={[config.fog.color, config.fog.near, config.fog.far]}
      />

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
        shadow-camera-far={65}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={15}
        shadow-camera-bottom={-5}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -20]} receiveShadow>
        <planeGeometry args={[isOutdoor ? 120 : 44, isOutdoor ? 120 : 80]} />
        <meshStandardMaterial
          color={config.floor.color}
          metalness={config.floor.metalness}
          roughness={config.floor.roughness}
        />
      </mesh>
      <gridHelper
        position={[0, -1.97, -20]}
        args={config.grid}
      />

      {isOutdoor ? (
        <>
          <mesh position={[0, 4, -72]}>
            <boxGeometry args={[120, 18, 0.6]} />
            <meshStandardMaterial color="#6f8ea8" metalness={0.1} roughness={0.9} />
          </mesh>
          <mesh position={[-28, 2.5, -40]}>
            <cylinderGeometry args={[1.2, 1.4, 5, 8]} />
            <meshStandardMaterial color="#5f4a32" roughness={0.95} />
          </mesh>
          <mesh position={[24, 2.5, -52]}>
            <cylinderGeometry args={[1.1, 1.3, 4.5, 8]} />
            <meshStandardMaterial color="#5f4a32" roughness={0.95} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[-18, 6, -24]}>
            <boxGeometry args={[0.4, 16, 56]} />
            <meshStandardMaterial color={isWarehouse ? '#3a2f24' : '#10232d'} metalness={0.25} roughness={0.75} />
          </mesh>
          <mesh position={[18, 6, -24]}>
            <boxGeometry args={[0.4, 16, 56]} />
            <meshStandardMaterial color={isWarehouse ? '#3a2f24' : '#10232d'} metalness={0.25} roughness={0.75} />
          </mesh>
          <mesh position={[0, 6, -48]}>
            <boxGeometry args={[36, 16, 0.5]} />
            <meshStandardMaterial color={isWarehouse ? '#241c14' : '#0b1b24'} metalness={0.35} roughness={0.66} />
          </mesh>
        </>
      )}

      {isWarehouse && (
        <>
          {[-14, 0, 14].map(x => (
            <mesh key={x} position={[x, 1.2, -30]} castShadow>
              <boxGeometry args={[4.5, 2.4, 2.2]} />
              <meshStandardMaterial color="#4a3a2a" metalness={0.4} roughness={0.7} />
            </mesh>
          ))}
          <mesh position={[0, 8.5, -26]}>
            <boxGeometry args={[34, 0.35, 0.35]} />
            <meshStandardMaterial color="#5a4632" metalness={0.6} roughness={0.45} />
          </mesh>
        </>
      )}

      {[-11, -22, -33, -44].map(z => (
        <group key={z} position={[0, 10, z]}>
          <mesh>
            <boxGeometry args={[18, 0.12, 0.14]} />
            <meshBasicMaterial color={config.accent} toneMapped={false} />
          </mesh>
          <pointLight intensity={isOutdoor ? 0.85 : 1.25} distance={11} color={config.accent} />
        </group>
      ))}

      {!isOutdoor && [-6, 6].map(x => (
        <mesh key={x} position={[x, -1.2, -21]}>
          <boxGeometry args={[0.12, 1.6, 48]} />
          <meshStandardMaterial color={isWarehouse ? '#4a3d30' : '#233744'} metalness={0.55} roughness={0.42} />
        </mesh>
      ))}
    </>
  )
}
