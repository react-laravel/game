import * as THREE from 'three'

function canvasTexture(width: number, height: number, paint: (context: CanvasRenderingContext2D) => void): THREE.CanvasTexture | null {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) return null
  paint(context)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

/** Small, deterministic woven tiles, without large distracting floor graphics. */
export function createLoungeCarpetTexture(): THREE.CanvasTexture | null {
  const texture = canvasTexture(256, 256, context => {
    context.fillStyle = '#384345'
    context.fillRect(0, 0, 256, 256)
    for (let y = 0; y < 256; y += 4) {
      for (let x = 0; x < 256; x += 4) {
        const shade = (x * 17 + y * 31) % 29
        context.fillStyle = `rgba(215, 204, 177, ${0.025 + shade / 440})`
        context.fillRect(x, y, 3, 1)
        context.fillStyle = 'rgba(8, 20, 22, 0.15)'
        context.fillRect(x + 1, y + 2, 1, 2)
      }
    }
    context.strokeStyle = 'rgba(213, 191, 143, 0.09)'
    context.lineWidth = 1
    context.strokeRect(1, 1, 254, 254)
  })
  if (texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(18, 25)
  }
  return texture
}

export function createWalnutTexture(): THREE.CanvasTexture | null {
  const texture = canvasTexture(128, 512, context => {
    context.fillStyle = '#75523a'
    context.fillRect(0, 0, 128, 512)
    for (let x = 0; x < 128; x++) {
      const shade = Math.sin(x * 0.13) * 0.04 + Math.sin(x * 0.83) * 0.025
      context.strokeStyle = `rgba(33, 20, 10, ${0.06 + shade})`
      context.lineWidth = 1
      context.beginPath()
      context.moveTo(x, 0)
      context.bezierCurveTo(x + 4, 150, x - 4, 340, x + 2, 512)
      context.stroke()
    }
  })
  if (texture) texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return texture
}

export function createClubMuralTexture(): THREE.CanvasTexture | null {
  return canvasTexture(2048, 256, context => {
    context.fillStyle = '#263d40'
    context.fillRect(0, 0, 2048, 256)
    context.strokeStyle = '#56706b'
    context.lineWidth = 2
    for (const centerX of [218, 1830]) {
      for (const radius of [60, 86, 113, 143]) {
        context.beginPath()
        context.arc(centerX, 132, radius, -Math.PI * 0.75, Math.PI * 0.75)
        context.stroke()
      }
      context.fillStyle = '#bc9356'
      context.beginPath()
      context.arc(centerX, 132, 33, 0, Math.PI * 2)
      context.fill()
      context.fillStyle = '#263d40'
      for (const [dx, dy] of [[-8, -8], [7, -8], [0, 6]]) {
        context.beginPath()
        context.arc(centerX + dx, 132 + dy, 3.5, 0, Math.PI * 2)
        context.fill()
      }
    }
    context.fillStyle = '#c7a46b'
    context.textAlign = 'center'
    context.font = '500 20px Arial, sans-serif'
    context.fillText('THE LANES  /  THE LOUNGE', 1024, 45)
    context.fillStyle = '#f3e9d5'
    context.font = '600 108px Georgia, serif'
    context.fillText('BOWL CLUB', 1024, 160)
    context.fillStyle = '#c7bca6'
    context.font = '500 19px Arial, sans-serif'
    context.fillText('GOOD TIMES. GREAT ROLLS.', 1024, 218)
    context.strokeStyle = '#b99056'
    context.beginPath()
    context.moveTo(615, 207)
    context.lineTo(785, 207)
    context.moveTo(1263, 207)
    context.lineTo(1433, 207)
    context.stroke()
  })
}

/** Five fascia labels share one atlas and one material/draw call. */
export function createLaneNumberTexture(): THREE.CanvasTexture | null {
  return canvasTexture(4000, 200, context => {
    context.fillStyle = '#30484a'
    context.fillRect(0, 0, 4000, 200)
    for (let lane = 0; lane < 5; lane++) {
      const x = lane * 800
      context.fillStyle = '#cba972'
      context.font = '500 19px Arial, sans-serif'
      context.fillText('LANE', x + 60, 52)
      context.fillStyle = '#f3e9d5'
      context.font = '600 92px Georgia, serif'
      context.fillText(String(lane + 1).padStart(2, '0'), x + 54, 143)
      context.strokeStyle = '#708380'
      context.lineWidth = 1
      context.beginPath()
      context.moveTo(x + 350, 36)
      context.lineTo(x + 350, 159)
      context.stroke()
      context.strokeStyle = '#b68e55'
      context.lineWidth = 3
      for (const offset of [0, 70, 140]) {
        context.beginPath()
        context.moveTo(x + 450 + offset, 78)
        context.lineTo(x + 485 + offset, 100)
        context.lineTo(x + 450 + offset, 122)
        context.stroke()
      }
    }
  })
}
