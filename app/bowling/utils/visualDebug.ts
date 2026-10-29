import * as THREE from 'three'
import { CAMERA_CONFIG } from '../config/constants'
import type { SceneRef } from '../types/scene'

type DebugOptions = {
  enabled?: boolean
  mode?: 'final' | 'normals' | 'wireframe'
  view?: 'player' | 'deck' | 'room'
}

/** Fixed inspection cameras affect the renderer, never the game or its physics. */
export function installBowlingVisualDebug(ref: SceneRef) {
  const normalMaterial = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide })
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x91b0b1,
    wireframe: true,
    side: THREE.DoubleSide,
  })
  const debugWindow = window as Window & {
    bowling_visual_debug?: (options?: DebugOptions) => unknown
  }
  const inspect = (options: DebugOptions = {}) => {
    if (options.mode) {
      ref.scene.overrideMaterial = options.mode === 'normals'
        ? normalMaterial
        : options.mode === 'wireframe'
          ? wireMaterial
          : null
    }
    if (options.view) {
      ref.debugView = options.view
      if (options.view === 'player') {
        const { x, y, z } = CAMERA_CONFIG.INITIAL_POSITION
        ref.camera.position.set(x, y, z)
        ref.camera.lookAt(0, 0.8, -20)
      } else if (options.view === 'deck') {
        ref.camera.position.set(0, 5.8, -10)
        ref.camera.lookAt(0, 0.8, -21)
      } else {
        ref.camera.position.set(18, 6.2, 21)
        ref.camera.lookAt(0, 2.4, -6)
      }
    }
    if (options.enabled === false) {
      ref.debugView = undefined
      ref.scene.overrideMaterial = null
    }
    ref.renderer.render(ref.scene, ref.camera)
    const gl = ref.renderer.getContext()
    const driver = gl.getExtension('WEBGL_debug_renderer_info')
    return {
      seed: 'fixed-planks-and-architecture-v1',
      threeVersion: THREE.REVISION,
      drawCalls: ref.renderer.info.render.calls,
      triangles: ref.renderer.info.render.triangles,
      geometries: ref.renderer.info.memory.geometries,
      textures: ref.renderer.info.memory.textures,
      renderTargets: [
        { type: 'environment', width: ref.environmentTarget?.width, height: ref.environmentTarget?.height },
        ...ref.scene.children.filter((object): object is THREE.DirectionalLight =>
          object instanceof THREE.DirectionalLight && object.castShadow
        )
          .map(light => ({ type: 'shadow', width: light.shadow.mapSize.x, height: light.shadow.mapSize.y })),
      ],
      viewport: ref.renderer.getSize(new THREE.Vector2()).toArray(),
      pixelRatio: ref.renderer.getPixelRatio(),
      camera: { position: ref.camera.position.toArray(), quaternion: ref.camera.quaternion.toArray(), fov: ref.camera.fov },
      postprocessing: false,
      gpu: driver ? gl.getParameter(driver.UNMASKED_RENDERER_WEBGL) : 'unavailable',
    }
  }
  debugWindow.bowling_visual_debug = inspect
  return () => {
    if (debugWindow.bowling_visual_debug === inspect) delete debugWindow.bowling_visual_debug
    normalMaterial.dispose()
    wireMaterial.dispose()
  }
}

/** Scene assets share maps and materials; release each GPU resource only once. */
export function disposeBowlingScene(ref: SceneRef) {
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  const textures = new Set<THREE.Texture>()
  ref.scene.traverse(object => {
    if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
      geometries.add(object.geometry)
      const entries = Array.isArray(object.material) ? object.material : [object.material]
      entries.forEach(material => materials.add(material))
    }
    if (object instanceof THREE.InstancedMesh) object.dispose()
    if (object instanceof THREE.Light && 'shadow' in object) {
      const light = object as THREE.DirectionalLight
      light.shadow.dispose()
    }
  })
  materials.forEach(material => {
    Object.values(material).forEach(value => {
      if (value instanceof THREE.Texture) textures.add(value)
    })
    material.dispose()
  })
  textures.forEach(texture => texture.dispose())
  geometries.forEach(geometry => geometry.dispose())
  ref.environmentTarget?.dispose()
  ref.renderer.dispose()
}
