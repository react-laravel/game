import type { MapConfig } from '../../utils/mapConfigs'

interface RangeEnvironmentProps {
  config: MapConfig
}

function LaneCeilingLights({ accent, intensity = 1.25 }: { accent: string; intensity?: number }) {
  return (
    <>
      {[-11, -22, -33, -44].map(z => (
        <group key={z} position={[0, 10.2, z]}>
          <mesh>
            <boxGeometry args={[18, 0.1, 0.18]} />
            <meshBasicMaterial color={accent} toneMapped={false} />
          </mesh>
          <pointLight intensity={intensity} distance={14} color={accent} decay={2} />
        </group>
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
        shadow-camera-far={65}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={15}
        shadow-camera-bottom={-5}
      />
      {config.fillLight && (
        <pointLight
          position={config.fillLight.position}
          intensity={config.fillLight.intensity}
          color={config.fillLight.color}
          distance={36}
          decay={2}
        />
      )}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -20]} receiveShadow>
        <planeGeometry args={[isOutdoor ? 120 : 44, isOutdoor ? 120 : 80]} />
        <meshStandardMaterial
          color={config.floor.color}
          metalness={config.floor.metalness}
          roughness={config.floor.roughness}
        />
      </mesh>

      {!isOutdoor && (
        <gridHelper position={[0, -1.97, -20]} args={config.grid} />
      )}

      {isOutdoor ? (
        <>
          <mesh position={[0, 24, -58]} rotation={[0.12, 0, 0]}>
            <planeGeometry args={[140, 48]} />
            <meshBasicMaterial color="#8ec0e8" toneMapped={false} />
          </mesh>
          <mesh position={[0, 8, -78]}>
            <boxGeometry args={[120, 22, 0.8]} />
            <meshStandardMaterial color="#7a9cb5" metalness={0.05} roughness={0.92} />
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
          <mesh position={[0, 11.8, -24]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[38, 58]} />
            <meshStandardMaterial
              color={isIndoor ? '#dce8ef' : '#4a4034'}
              emissive={isIndoor ? '#9eb8c8' : '#2a2218'}
              emissiveIntensity={isIndoor ? 0.35 : 0.18}
              roughness={0.88}
            />
          </mesh>

          <mesh position={[-18, 6, -24]}>
            <boxGeometry args={[0.4, 16, 56]} />
            <meshStandardMaterial
              color={isIndoor ? '#3d5666' : '#3a2f24'}
              metalness={0.2}
              roughness={0.68}
            />
          </mesh>
          <mesh position={[18, 6, -24]}>
            <boxGeometry args={[0.4, 16, 56]} />
            <meshStandardMaterial
              color={isIndoor ? '#3d5666' : '#3a2f24'}
              metalness={0.2}
              roughness={0.68}
            />
          </mesh>
          <mesh position={[0, 6, -48]}>
            <boxGeometry args={[36, 16, 0.5]} />
            <meshStandardMaterial
              color={isIndoor ? '#2f4554' : '#241c14'}
              metalness={0.25}
              roughness={0.62}
            />
          </mesh>

          {isIndoor && (
            <>
              <mesh position={[0, 5.8, -24]}>
                <boxGeometry args={[34, 0.08, 52]} />
                <meshStandardMaterial color="#5a7a8c" metalness={0.45} roughness={0.35} />
              </mesh>
              {[-6, 6].map(x => (
                <mesh key={x} position={[x, -1.2, -21]}>
                  <boxGeometry args={[0.12, 1.6, 48]} />
                  <meshStandardMaterial color="#4f6b7a" metalness={0.45} roughness={0.4} />
                </mesh>
              ))}
            </>
          )}
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
          {[-6, 6].map(x => (
            <mesh key={x} position={[x, -1.2, -21]}>
              <boxGeometry args={[0.12, 1.6, 48]} />
              <meshStandardMaterial color="#4a3d30" metalness={0.55} roughness={0.42} />
            </mesh>
          ))}
        </>
      )}

      {!isOutdoor && (
        <LaneCeilingLights
          accent={config.accent}
          intensity={isIndoor ? 1.55 : 1.2}
        />
      )}
    </>
  )
}
