import * as THREE from 'three'
import { LANE_END_Z, LANE_LENGTH } from './layout'

/** Fixed plank layout; color and surface response follow the same grain and joints. */
export function createLaneTextures(markings: boolean) {
  const colorCanvas = document.createElement('canvas')
  const roughnessCanvas = document.createElement('canvas')
  colorCanvas.width = roughnessCanvas.width = 512
  colorCanvas.height = roughnessCanvas.height = 2048
  const color = colorCanvas.getContext('2d')
  const roughness = roughnessCanvas.getContext('2d')
  if (!color || !roughness) return { colorMap: null, roughnessMap: null }

  const plankColors = ['#cdb28b', '#d7bd96', '#c7aa80', '#d0b58e', '#dcc39d']
  const plankWidth = colorCanvas.width / 10
  for (let plank = 0; plank < 10; plank++) {
    const x = plank * plankWidth
    color.fillStyle = plankColors[plank % plankColors.length]
    color.fillRect(x, 0, plankWidth, colorCanvas.height)
    roughness.fillStyle = `rgb(${145 + (plank % 4) * 5}, ${145 + (plank % 4) * 5}, ${145 + (plank % 4) * 5})`
    roughness.fillRect(x, 0, plankWidth, roughnessCanvas.height)

    // Long, low-contrast fibers are resolved by mipmaps at the far end of the lane.
    for (let fiber = 0; fiber < 8; fiber++) {
      const fiberX = x + 4 + fiber * 6
      color.beginPath()
      roughness.beginPath()
      for (let y = 0; y <= colorCanvas.height; y += 8) {
        const bend = Math.sin(y * 0.004 + plank * 1.7 + fiber) * 1.3
        if (y === 0) {
          color.moveTo(fiberX + bend, y)
          roughness.moveTo(fiberX + bend, y)
        } else {
          color.lineTo(fiberX + bend, y)
          roughness.lineTo(fiberX + bend, y)
        }
      }
      color.strokeStyle = 'rgba(97, 68, 41, 0.055)'
      color.lineWidth = 1
      color.stroke()
      roughness.strokeStyle = 'rgb(164, 164, 164)'
      roughness.lineWidth = 1
      roughness.stroke()
    }

    color.fillStyle = 'rgba(71, 50, 33, 0.14)'
    color.fillRect(x, 0, 1, colorCanvas.height)
    roughness.fillStyle = 'rgb(185, 185, 185)'
    roughness.fillRect(x, 0, 1, roughnessCanvas.height)
    for (let y = 180 + ((plank * 137) % 380); y < colorCanvas.height; y += 560) {
      color.fillRect(x, y, plankWidth, 1)
      roughness.fillRect(x, y, plankWidth, 1)
    }
  }

  if (markings) {
    const imageY = (z: number) => ((z - LANE_END_Z) / LANE_LENGTH) * colorCanvas.height
    color.fillStyle = '#514738'
    color.fillRect(0, imageY(8.7), colorCanvas.width, 8)
    for (let index = -3; index <= 3; index++) {
      const x = colorCanvas.width / 2 + index * 58
      const y = imageY(2.8 - Math.abs(index) * 0.35)
      color.beginPath()
      color.moveTo(x, y - 18)
      color.lineTo(x - 7, y + 9)
      color.lineTo(x + 7, y + 9)
      color.closePath()
      color.fill()
      color.beginPath()
      color.arc(x, imageY(6.5), 3, 0, Math.PI * 2)
      color.fill()
    }
  }

  const colorMap = new THREE.CanvasTexture(colorCanvas)
  colorMap.colorSpace = THREE.SRGBColorSpace
  const roughnessMap = new THREE.CanvasTexture(roughnessCanvas)
  for (const texture of [colorMap, roughnessMap]) {
    texture.anisotropy = 8
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
  }
  return { colorMap, roughnessMap }
}
