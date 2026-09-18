import * as THREE from 'three'

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

/** Bevelled receiver, open trigger guard and a low-profile sight share a single bore axis. */
export function GunModel() {
  return (
    <group name="carbine-MK01">
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
      <Part position={[0, 0.19, -0.1]} size={[0.13, 0.038, 0.17]} />
      <Part position={[-0.054, 0.255, -0.1]} size={[0.018, 0.11, 0.065]} />
      <Part position={[0.054, 0.255, -0.1]} size={[0.018, 0.11, 0.065]} />
      <Part position={[0, 0.314, -0.1]} size={[0.126, 0.018, 0.065]} />
      <mesh position={[0, 0.263, -0.102]}>
        <planeGeometry args={[0.088, 0.083]} />
        <meshBasicMaterial
          color="#85a1a2"
          transparent
          opacity={0.16}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0.258, -0.067]}>
        <circleGeometry args={[0.003, 8]} />
        <meshBasicMaterial color="#ef9b59" toneMapped={false} />
      </mesh>
    </group>
  )
}
