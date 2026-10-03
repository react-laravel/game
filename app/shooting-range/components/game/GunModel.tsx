import * as THREE from 'three'
import type { WeaponId } from '../../utils/weapons'

type Point = [number, number]
function profile(points: Point[]) {
  const shape = new THREE.Shape()
  points.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)))
  shape.closePath()
  return shape
}

// Local X is width, Y up, -Z barrel. Profiles are dimensioned in length/height.
const receiver = profile([
  [-0.2, -0.07],
  [0.47, -0.07],
  [0.56, -0.01],
  [0.54, 0.1],
  [0.4, 0.14],
  [-0.14, 0.14],
  [-0.22, 0.07],
])
const stock = profile([
  [-0.59, -0.15],
  [-0.5, -0.17],
  [-0.25, -0.04],
  [-0.16, -0.02],
  [-0.16, 0.09],
  [-0.56, 0.09],
])
const grip = profile([
  [-0.16, -0.05],
  [-0.03, -0.06],
  [-0.1, -0.32],
  [-0.23, -0.28],
])
const magazine = profile([
  [0.1, -0.05],
  [0.25, -0.05],
  [0.27, -0.3],
  [0.17, -0.37],
  [0.07, -0.33],
])
const guard = profile([
  [-0.07, -0.07],
  [0.12, -0.07],
  [0.12, -0.2],
  [-0.07, -0.2],
])
const guardHole = new THREE.Path()
guardHole.moveTo(-0.045, -0.095)
guardHole.lineTo(-0.045, -0.173)
guardHole.lineTo(0.092, -0.173)
guardHole.lineTo(0.092, -0.095)
guardHole.closePath()
guard.holes.push(guardHole)

function Shell({
  shape,
  width,
  color,
  metalness = 0.35,
}: {
  shape: THREE.Shape
  width: number
  color: string
  metalness?: number
}) {
  return (
    <mesh position={[-width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <extrudeGeometry
        args={[
          shape,
          {
            depth: width,
            bevelEnabled: true,
            bevelSize: 0.009,
            bevelThickness: 0.009,
            bevelSegments: 2,
            steps: 1,
            curveSegments: 6,
          },
        ]}
      />
      <meshStandardMaterial color={color} metalness={metalness} roughness={0.48} />
    </mesh>
  )
}
function Part({
  position,
  size,
  color = '#283234',
}: {
  position: [number, number, number]
  size: [number, number, number]
  color?: string
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.45} />
    </mesh>
  )
}

const pistolSlide = profile([
  [-0.12, -0.04],
  [0.39, -0.04],
  [0.42, 0.01],
  [0.4, 0.1],
  [-0.12, 0.1],
])
const pistolFrame = profile([
  [-0.12, -0.035],
  [0.35, -0.035],
  [0.31, -0.095],
  [0.06, -0.095],
  [-0.01, -0.32],
  [-0.15, -0.29],
  [-0.09, -0.1],
])

/** Two dimensioned training weapons share the same local forward axis (-Z). */
export function GunModel({ weaponId = 'sniper' }: { weaponId?: WeaponId } = {}) {
  if (weaponId === 'pistol') {
    return (
      <group name="pistol-model">
        <Shell shape={pistolFrame} width={0.095} color="#283c3c" metalness={0.12} />
        <Shell shape={pistolSlide} width={0.12} color="#9aaba2" metalness={0.62} />
        <Shell shape={guard} width={0.035} color="#243232" />
        <Part position={[0, 0.12, -0.375]} size={[0.023, 0.035, 0.025]} color="#293d39" />
        <Part position={[-0.039, 0.118, 0.06]} size={[0.025, 0.03, 0.03]} />
        <Part position={[0.039, 0.118, 0.06]} size={[0.025, 0.03, 0.03]} />
        <Part position={[0, 0.13, -0.37]} size={[0.008, 0.025, 0.008]} color="#dfa568" />
        <Part position={[0.063, 0.04, -0.16]} size={[0.005, 0.035, 0.09]} color="#283a37" />
        {[0, 1, 2, 3].map((i) => (
          <Part
            key={i}
            position={[0.063, 0.022, 0.065 - i * 0.025]}
            size={[0.005, 0.07, 0.008]}
            color="#425854"
          />
        ))}
        <mesh position={[0, 0.02, -0.423]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[0.025, 12]} />
          <meshBasicMaterial color="#142022" />
        </mesh>
      </group>
    )
  }
  return (
    <group name="sniper-model">
      <Shell shape={receiver} width={0.17} color="#87968e" />
      <Shell shape={stock} width={0.13} color="#303d3d" metalness={0.1} />
      <Shell shape={grip} width={0.1} color="#283334" metalness={0.05} />
      <Shell shape={magazine} width={0.1} color="#465451" />
      <Shell shape={guard} width={0.035} color="#283334" />
      <Part position={[0, 0.015, -0.63]} size={[0.14, 0.13, 0.27]} color="#4a5a56" />
      <Part position={[0, 0.151, -0.23]} size={[0.095, 0.027, 0.64]} />
      {Array.from({ length: 9 }, (_, i) => (
        <Part key={i} position={[0, 0.17, -0.51 + i * 0.07]} size={[0.12, 0.018, 0.025]} />
      ))}
      {[-1, 1].flatMap((side) =>
        [-0.53, -0.61, -0.69].map((z) => (
          <Part
            key={`${side}-${z}`}
            position={[side * 0.071, 0.022, z]}
            size={[0.007, 0.045, 0.055]}
            color="#172325"
          />
        ))
      )}
      <mesh position={[0, 0.02, -0.825]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.023, 0.023, 0.22, 12]} />
        <meshStandardMaterial color="#263235" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.02, -0.947]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.037, 0.032, 0.06, 8]} />
        <meshStandardMaterial color="#485653" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.02, -0.979]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[0.022, 12]} />
        <meshBasicMaterial color="#0b1518" />
      </mesh>
      {/* Ejection port, charging handle, serial plate and restrained orange safety markings. */}
      <Part position={[0.087, 0.065, -0.08]} size={[0.006, 0.048, 0.18]} color="#1c292a" />
      <Part position={[0.092, 0.057, -0.05]} size={[0.016, 0.012, 0.105]} color="#9caaa0" />
      <Part position={[0.11, 0.07, 0.115]} size={[0.065, 0.028, 0.05]} />
      <Part position={[0.091, -0.021, -0.33]} size={[0.008, 0.035, 0.09]} color="#d88f52" />
      <Part position={[0.075, 0.02, 0.56]} size={[0.02, 0.19, 0.04]} />
      {[-0.17, -0.26, 0.1].map((z) => (
        <mesh key={z} position={[0.09, 0.03, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.013, 0.013, 0.009, 8]} />
          <meshStandardMaterial color="#202c2e" metalness={0.7} roughness={0.5} />
        </mesh>
      ))}

      {/* Long barrel and tubular optic give the sniper a distinct silhouette. */}
      <mesh position={[0, 0.02, -1.19]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.024, 0.024, 0.53, 12]} />
        <meshStandardMaterial color="#415450" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.02, -1.43]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.06, 12]} />
        <meshStandardMaterial color="#273632" metalness={0.65} roughness={0.45} />
      </mesh>
      <Part position={[0, 0.22, -0.03]} size={[0.12, 0.12, 0.3]} />
      <mesh position={[0, 0.31, -0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.067, 0.067, 0.43, 20]} />
        <meshStandardMaterial color="#293d3a" metalness={0.5} roughness={0.45} />
      </mesh>
      {[-0.27, 0.2].map((z) => (
        <mesh key={z} position={[0, 0.31, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.088, 0.088, 0.065, 20]} />
          <meshStandardMaterial color="#50605b" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.31, 0.236]}>
        <circleGeometry args={[0.069, 20]} />
        <meshStandardMaterial color="#1f6570" metalness={0.65} roughness={0.16} />
      </mesh>
      <mesh position={[0, 0.397, -0.03]}>
        <cylinderGeometry args={[0.033, 0.033, 0.045, 12]} />
        <meshStandardMaterial color="#273632" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}
