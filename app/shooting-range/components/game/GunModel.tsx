import { RoundedBox } from '@react-three/drei'

/** A compact near-future carbine assembled from low-cost primitives. */
export function GunModel() {
  return (
    <group rotation={[-0.045, -0.14, -0.018]}>
      {/* Main receiver */}
      <RoundedBox position={[0, 0, -0.16]} args={[0.17, 0.13, 0.58]} radius={0.025} smoothness={4} castShadow>
        <meshStandardMaterial
          color="#637784"
          emissive="#111b21"
          emissiveIntensity={0.45}
          metalness={0.76}
          roughness={0.24}
        />
      </RoundedBox>

      {/* Sloped upper shroud */}
      <RoundedBox
        position={[0, 0.075, -0.18]}
        rotation={[0.04, 0, 0]}
        args={[0.155, 0.052, 0.64]}
        radius={0.016}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial
          color="#91a4ad"
          emissive="#101b20"
          emissiveIntensity={0.35}
          metalness={0.68}
          roughness={0.28}
        />
      </RoundedBox>

      {/* Front handguard */}
      <RoundedBox
        position={[0, -0.005, -0.48]}
        args={[0.145, 0.115, 0.31]}
        radius={0.025}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial color="#344852" metalness={0.62} roughness={0.38} />
      </RoundedBox>
      {[-0.085, 0, 0.085].map(z => (
        <mesh key={z} position={[0.088, -0.005, -0.48 + z]}>
          <boxGeometry args={[0.012, 0.085, 0.035]} />
          <meshBasicMaterial color="#26c6da" toneMapped={false} />
        </mesh>
      ))}

      {/* Barrel and muzzle brake */}
      <mesh position={[0, 0.005, -0.7]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.027, 0.032, 0.34, 16]} />
        <meshStandardMaterial color="#495a63" metalness={0.92} roughness={0.18} />
      </mesh>
      <mesh position={[0, 0.005, -0.88]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.046, 0.046, 0.09, 12]} />
        <meshStandardMaterial color="#586a73" metalness={0.88} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0.005, -0.927]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.019, 0.039, 16]} />
        <meshBasicMaterial color="#020405" />
      </mesh>

      {/* Pistol grip */}
      <RoundedBox
        position={[0, -0.17, 0.035]}
        rotation={[-0.32, 0, 0]}
        args={[0.11, 0.27, 0.13]}
        radius={0.028}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial color="#30434c" metalness={0.28} roughness={0.7} />
      </RoundedBox>
      <mesh position={[0, -0.185, 0.09]} rotation={[-0.32, 0, 0]}>
        <boxGeometry args={[0.116, 0.19, 0.02]} />
        <meshStandardMaterial color="#52656e" metalness={0.42} roughness={0.52} />
      </mesh>

      {/* Trigger guard */}
      <mesh position={[0, -0.1, -0.105]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.072, 0.012, 8, 20]} />
        <meshStandardMaterial color="#4c5d66" metalness={0.68} roughness={0.34} />
      </mesh>

      {/* Open holographic optic */}
      <mesh position={[-0.055, 0.155, -0.2]} castShadow>
        <boxGeometry args={[0.018, 0.1, 0.12]} />
        <meshStandardMaterial color="#465a64" metalness={0.62} roughness={0.32} />
      </mesh>
      <mesh position={[0.055, 0.155, -0.2]} castShadow>
        <boxGeometry args={[0.018, 0.1, 0.12]} />
        <meshStandardMaterial color="#465a64" metalness={0.62} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0.205, -0.2]} castShadow>
        <boxGeometry args={[0.125, 0.018, 0.12]} />
        <meshStandardMaterial color="#465a64" metalness={0.62} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0.158, -0.263]}>
        <planeGeometry args={[0.085, 0.072]} />
        <meshBasicMaterial color="#60efff" transparent opacity={0.55} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.114, -0.22]}>
        <boxGeometry args={[0.15, 0.018, 0.25]} />
        <meshStandardMaterial color="#0c1317" metalness={0.8} roughness={0.28} />
      </mesh>

      {/* Receiver accent and safety */}
      <mesh position={[0.102, 0.01, -0.15]}>
        <boxGeometry args={[0.008, 0.035, 0.28]} />
        <meshBasicMaterial color="#ff9f1c" toneMapped={false} />
      </mesh>
      <mesh position={[0.108, 0.025, 0.005]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.026, 0.026, 0.018, 16]} />
        <meshBasicMaterial color="#ff9f1c" toneMapped={false} />
      </mesh>
    </group>
  )
}
