import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/** Development-only inspection of the actual renderer; never used for player settings. */
export function RangeDiagnostics() {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    const normal = new THREE.MeshNormalMaterial()
    const wireframe = new THREE.MeshBasicMaterial({ color: '#db9d66', wireframe: true })
    const target = window as unknown as {
      inspectShootingRange?: (
        mode?: 'final' | 'normals' | 'wireframe',
        distance?: number
      ) => unknown
    }
    target.inspectShootingRange = (mode = 'final', distance = 0) => {
      scene.overrideMaterial = mode === 'normals' ? normal : mode === 'wireframe' ? wireframe : null
      camera.position.z = distance
      return {
        calls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        geometries: gl.info.memory.geometries,
        textures: gl.info.memory.textures,
        dpr: gl.getPixelRatio(),
        camera: camera.position.toArray(),
        postProcessing: false,
        shadowPasses: 0,
      }
    }
    return () => {
      delete target.inspectShootingRange
      scene.overrideMaterial = null
      normal.dispose()
      wireframe.dispose()
    }
  }, [camera, gl, scene])
  return null
}
