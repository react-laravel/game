import * as CANNON from 'cannon-es'

export function addStaticBox(
  world: CANNON.World,
  halfExtents: CANNON.Vec3,
  position: CANNON.Vec3,
  material?: CANNON.Material
): CANNON.Body {
  const body = new CANNON.Body({ mass: 0, material })
  body.addShape(new CANNON.Box(halfExtents))
  body.position.copy(position)
  world.addBody(body)
  return body
}
