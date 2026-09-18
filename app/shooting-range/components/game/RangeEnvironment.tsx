import { memo } from 'react'
import { PineForest, RangeGround, RangeSky, RidgeLine } from './environment/RangeLandscape'
import type { MapConfig } from '../../utils/mapConfigs'
import type { OutdoorTimeOfDay } from '../../types'
import { getOutdoorTimePreset } from '../../utils/outdoorTimeOfDay'
import { BlockMesh, Blocks, RangeSign, type Block } from './environment/RangePrimitives'

// Floor -2m, camera 1.6m, clear target volume x ±13 / z -7…-35.
// Repeated architecture is instanced by surface; no post-processing or shadow passes.
const BAYS = [-5, -13, -21, -29, -37, -45]
const SIDES = [-1, 1]
const block = (position: Block['position'], size: Block['size']): Block => ({ position, size })
const pillars = SIDES.flatMap((side) =>
  BAYS.map((z) => block([side * 17.6, 3.2, z], [0.5, 10.4, 0.55]))
)
const ceilingRibs = BAYS.map((z) => block([0, 8.7, z], [36, 0.55, 0.6]))
const ceilingPanels = BAYS.map((z) => block([0, 9.2, z - 3.5], [35.6, 0.25, 7.35]))
const wallPanels = SIDES.flatMap((side) =>
  BAYS.map((z) => block([side * 18, 3, z - 3.6], [0.25, 8.8, 7.2]))
)
const lowerPanels = SIDES.flatMap((side) =>
  BAYS.map((z) => block([side * 17.78, -0.3, z - 3.6], [0.15, 3.4, 7.15]))
)
const lamps = SIDES.flatMap((side) =>
  BAYS.map((z) => block([side * 9, 8.48, z - 2], [0.55, 0.08, 4.8]))
)
const seams = Array.from({ length: 14 }, (_, i) =>
  block([0, -1.989, 5 - i * 4], [36, 0.012, 0.025])
)
const laneLines = [-12, -6, 6, 12].map((x) => block([x, -1.975, -23], [0.045, 0.015, 53]))
const safetyLines = SIDES.flatMap((side) =>
  [0, 1, 2, 3, 4].map((i) => block([side * (14 + i * 0.65), -1.97, -2], [0.3, 0.018, 1.1]))
)
const backstop = Array.from({ length: 14 }, (_, i) =>
  block([0, -1.5 + i * 0.66, -49], [35.5, 0.54, 0.4])
)

function IndoorRange() {
  return (
    <group name="architecture-indoor">
      <RangeGround />
      <Blocks items={seams} color="#424c4d" />
      <Blocks items={laneLines} color="#8c9892" />
      <Blocks items={safetyLines} color="#d69a61" />
      <Blocks items={wallPanels} color="#c2c1b6" />
      <Blocks items={lowerPanels} color="#586563" />
      <Blocks items={[...pillars, ...ceilingRibs]} color="#344345" metalness={0.25} />
      <Blocks items={ceilingPanels} color="#a4aeaa" />
      <Blocks items={lamps} color="#fff5df" emissive />
      <Blocks items={backstop} color="#323d3d" />
      <BlockMesh position={[0, 3.1, -49.5]} size={[36, 11, 0.6]} color="#465451" />
      <Blocks
        items={SIDES.map((side) => block([side * 17.5, 1.65, -25], [0.04, 0.18, 48]))}
        color="#dba073"
      />
      <RangeSign
        text="RANGE / 01"
        position={[0, 6.8, -48.7]}
        width={8}
        caption="FOCUS. BREATHE. REPEAT."
      />
      {[-12, -24, -36].flatMap((z, i) =>
        SIDES.map((side) => (
          <RangeSign
            key={`${z}-${side}`}
            text={`${(i + 1) * 10} M`}
            caption="PRECISION / INDOOR"
            width={3}
            position={[side * 17.4, 3.5, z]}
            rotation={[0, (-side * Math.PI) / 2, 0]}
          />
        ))
      )}
    </group>
  )
}

const warehousePosts = SIDES.flatMap((side) =>
  BAYS.map((z) => block([side * 19, 4, z], [0.65, 12, 0.65]))
)
const roofTrusses = BAYS.flatMap((z) => [
  block([0, 10, z], [39, 0.5, 0.55]),
  block([0, 11.2, z], [39, 0.35, 0.45]),
])
const containerRibs = SIDES.flatMap((side) =>
  [-17, -34].flatMap((z) =>
    Array.from({ length: 13 }, (_, i) =>
      block([side * 17, 0.4, z + i * 0.58 - 3.5], [0.12, 4.7, 0.12])
    )
  )
)

function WarehouseRange() {
  return (
    <group name="architecture-warehouse">
      <BlockMesh position={[0, -2.15, -23]} size={[46, 0.3, 72]} color="#777367" />
      <Blocks items={seams} color="#605f57" />
      <Blocks items={warehousePosts.concat(roofTrusses)} color="#3c4645" metalness={0.3} />
      <Blocks items={BAYS.map((z) => block([0, 11.7, z - 3.5], [43, 0.3, 7.5]))} color="#89918a" />
      <Blocks
        items={SIDES.map((side) => block([side * 22, 4, -23], [0.4, 12, 65]))}
        color="#9e9a8b"
      />
      <BlockMesh position={[0, 4, -54]} size={[45, 12, 0.5]} color="#777f75" />
      <Blocks
        items={SIDES.flatMap((side) =>
          [-17, -34].map((z) => block([side * 19, 0.4, z], [4, 4.8, 9]))
        )}
        color="#3c615f"
      />
      <Blocks items={containerRibs} color="#587b74" />
      <Blocks
        items={SIDES.map((side) => block([side * 14.5, -1.974, -25], [0.16, 0.018, 56]))}
        color="#ddad62"
      />
      <Blocks
        items={BAYS.flatMap((z) => [-8, 8].map((x) => block([x, 10.2, z], [1.7, 0.12, 0.7])))}
        color="#fff1cf"
        emissive
      />
      <Blocks
        items={[-15, -5, 5, 15].map((x) => block([x, 7.6, -53.65], [6.8, 3, 0.06]))}
        color="#bacccd"
        emissive
      />
      <RangeSign
        text="SECTOR / 03"
        caption="MOVEMENT & ACQUISITION"
        position={[0, 3.7, -53.6]}
        width={11}
      />
      {SIDES.map((side) => (
        <RangeSign
          key={side}
          text={side < 0 ? 'A—01' : 'B—02'}
          caption="TRAINING FACILITY"
          position={[side * 16.9, 1, -17]}
          rotation={[0, (-side * Math.PI) / 2, 0]}
          width={3.5}
        />
      ))}
    </group>
  )
}

const trees = SIDES.flatMap((side) =>
  Array.from({ length: 18 }, (_, i) => ({
    x: side * (32 + ((i * 17) % 21)),
    z: -8 - i * 5.2,
    h: 6 + ((i * 7) % 6),
  }))
)
function OutdoorRange({ time }: { time: OutdoorTimeOfDay }) {
  const night = time === 'night'
  return (
    <group name="architecture-outdoor">
      <RangeGround outdoor night={night} />
      <RangeSky color={getOutdoorTimePreset(time).background} night={night} />
      <BlockMesh position={[0, -2.03, 4]} size={[38, 0.12, 12]} color="#7f8176" />
      <Blocks
        items={SIDES.map((side) => block([side * 24, -0.8, -24], [0.45, 2.4, 72]))}
        color="#86877b"
      />
      <Blocks
        items={SIDES.flatMap((side) =>
          Array.from({ length: 10 }, (_, i) => block([side * 24, 1, -i * 7], [0.2, 3.4, 0.2]))
        )}
        color="#454f47"
      />
      <Blocks
        items={SIDES.flatMap((side) =>
          [1, 2.3].map((y) => block([side * 24, y, -28], [0.13, 0.12, 65]))
        )}
        color="#454f47"
      />
      <BlockMesh position={[0, 0, -55]} size={[51, 4, 5]} color="#687152" />
      <BlockMesh position={[0, 2, -59]} size={[64, 5, 6]} color="#737754" />
      <RangeSign
        text="FIELD / 02"
        position={[0, 2.7, -52.4]}
        caption="OPEN AIR / TRAINING GROUNDS"
        width={10}
      />
      <Blocks
        items={trees.map((t) => block([t.x, t.h / 2 - 2, t.z], [0.5, t.h, 0.5]))}
        color="#5c5f4e"
      />
      <PineForest trees={trees} />
      <RidgeLine night={night} />
      {SIDES.flatMap((side) =>
        [-10, -30, -48].map((z) => (
          <group key={`${side}-${z}`} position={[side * 22, 0, z]}>
            <BlockMesh position={[0, 2.5, 0]} size={[0.18, 9, 0.18]} color="#3b4644" />
            <BlockMesh position={[-side * 0.6, 6.9, 0]} size={[1.4, 0.18, 0.6]} color="#4d5955" />
            <mesh position={[-side * 0.6, 6.78, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.1, 0.4]} />
              <meshBasicMaterial color={night ? '#ffe2ab' : '#ebe8da'} />
            </mesh>
          </group>
        ))
      )}
      {[-10, -25, -40].map((z, i) => (
        <RangeSign
          key={z}
          text={`${(i + 1) * 10} M`}
          caption="FIELD DISTANCE"
          position={[-22, 0.2, z]}
          width={2.5}
        />
      ))}
      {night && (
        <>
          <hemisphereLight args={['#9eaebb', '#8b7954', 1.3]} />
          <directionalLight position={[12, 7, 5]} color="#ffe5bb" intensity={1.2} />
        </>
      )}
    </group>
  )
}

interface RangeEnvironmentProps {
  config: MapConfig
  outdoorTimeOfDay?: OutdoorTimeOfDay
}
export const RangeEnvironment = memo(function RangeEnvironment({
  config,
  outdoorTimeOfDay = 'day',
}: RangeEnvironmentProps) {
  const outdoor = config.id === 'outdoor'
  const lighting = outdoor ? getOutdoorTimePreset(outdoorTimeOfDay) : config
  return (
    <>
      <color attach="background" args={[lighting.background]} />
      <fog attach="fog" args={[lighting.fog.color, lighting.fog.near, lighting.fog.far]} />
      <hemisphereLight
        args={[lighting.hemisphere.sky, lighting.hemisphere.ground, lighting.hemisphere.intensity]}
      />
      <directionalLight
        position={lighting.directional.position}
        color={lighting.directional.color}
        intensity={lighting.directional.intensity}
      />
      <directionalLight position={[-10, 6, -30]} intensity={outdoor ? 0.5 : 1.2} color="#d8e4e5" />
      {config.id === 'indoor' ? (
        <IndoorRange />
      ) : config.id === 'warehouse' ? (
        <WarehouseRange />
      ) : (
        <OutdoorRange time={outdoorTimeOfDay} />
      )}
    </>
  )
})
