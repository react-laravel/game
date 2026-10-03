import { useMemo } from 'react'
import { getGridPositions } from '../../utils/gridDrill'

/** This rack is visual-only. Raycasts are limited to the three active Target groups. */
export function GridDrillGuide({ maxY }: { maxY: number }) {
  const positions = useMemo(() => getGridPositions(maxY), [maxY])
  const lines = useMemo(() => {
    const spacing = (positions[6][1] - positions[0][1]) / 2
    const bottom = positions[0][1] - spacing / 2
    const top = positions[6][1] + spacing / 2
    const z = positions[0][2] - 0.3
    const points: number[] = []
    for (const x of [-5.1, -1.7, 1.7, 5.1]) points.push(x, bottom, z, x, top, z)
    for (let row = 0; row < 4; row++) {
      const y = bottom + row * spacing
      points.push(-5.1, y, z, 5.1, y, z)
    }
    return new Float32Array(points)
  }, [positions])

  return (
    <group name="precision-grid-guide">
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lines, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#b1c6ba" transparent opacity={0.2} depthWrite={false} />
      </lineSegments>
      {positions.map(([x, y, z], index) => (
        <mesh key={index} position={[x, y, z - 0.25]}>
          <ringGeometry args={[0.055, 0.09, 12]} />
          <meshBasicMaterial color="#b6cabe" transparent opacity={0.35} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}
