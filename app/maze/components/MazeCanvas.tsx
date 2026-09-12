'use client'

import { useEffect, useRef, forwardRef, useCallback } from 'react'
import { getMazeDimensions } from '../constants'
import { getMazeRenderLayout } from '../generateMaze'
import { useMazeStore } from '../store'

const MazeCanvas = forwardRef<HTMLCanvasElement>((_props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { maze, ball, mazeSize, mazeShape } = useMazeStore()
  const fallback = getMazeDimensions(mazeShape, mazeSize)
  const layoutHint = maze.length > 0 ? { cols: maze[0].length, rows: maze.length } : fallback

  const setRef = (element: HTMLCanvasElement | null) => {
    canvasRef.current = element
    if (typeof ref === 'function') {
      ref(element)
    } else if (ref) {
      ref.current = element
    }
  }

  const drawMaze = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const canvasWidth = rect.width
    const canvasHeight = rect.height
    const { cols, rows, cellSize, offsetX, offsetY } = getMazeRenderLayout(
      maze,
      canvasWidth,
      canvasHeight,
      getMazeDimensions(mazeShape, mazeSize)
    )

    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    const container = canvas.parentElement
    const backgroundColor = container ? getComputedStyle(container).backgroundColor : 'transparent'
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    if (maze.length === 0) {
      return
    }

    const rootStyles = getComputedStyle(document.documentElement)
    const resolveThemeColor = (variable: string, fallbackColor: string) => {
      const value = rootStyles.getPropertyValue(variable).trim()
      if (!value) return fallbackColor
      return value.includes('(') ? value : `hsl(${value})`
    }

    const wallColor = resolveThemeColor('--muted-foreground', '#666')
    const startColor = resolveThemeColor('--success', '#4ade80')
    const endColor = resolveThemeColor('--destructive', '#ef4444')

    ctx.strokeStyle = wallColor
    ctx.lineWidth = 2

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell = maze[y][x]
        const cellX = x * cellSize + offsetX
        const cellY = y * cellSize + offsetY

        ctx.beginPath()

        if (cell.top) {
          ctx.moveTo(cellX, cellY)
          ctx.lineTo(cellX + cellSize, cellY)
        }

        if (cell.right) {
          ctx.moveTo(cellX + cellSize, cellY)
          ctx.lineTo(cellX + cellSize, cellY + cellSize)
        }

        if (cell.bottom) {
          ctx.moveTo(cellX, cellY + cellSize)
          ctx.lineTo(cellX + cellSize, cellY + cellSize)
        }

        if (cell.left) {
          ctx.moveTo(cellX, cellY)
          ctx.lineTo(cellX, cellY + cellSize)
        }

        ctx.stroke()
      }
    }

    ctx.fillStyle = startColor
    ctx.fillRect(offsetX + cellSize * 0.1, offsetY + cellSize * 0.1, cellSize * 0.8, cellSize * 0.8)

    ctx.fillStyle = endColor
    const endX = (cols - 1) * cellSize + offsetX
    const endY = (rows - 1) * cellSize + offsetY
    ctx.fillRect(endX + cellSize * 0.1, endY + cellSize * 0.1, cellSize * 0.8, cellSize * 0.8)

    const ballGridX = ball.x
    const ballGridY = ball.z
    const ballX = ballGridX * cellSize + cellSize / 2 + offsetX
    const ballY = ballGridY * cellSize + cellSize / 2 + offsetY

    ctx.fillStyle = '#3b82f6'
    ctx.beginPath()
    ctx.arc(ballX, ballY, cellSize * 0.3, 0, 2 * Math.PI)
    ctx.fill()

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.beginPath()
    ctx.arc(ballX + 2, ballY + 2, cellSize * 0.3, 0, 2 * Math.PI)
    ctx.fill()

    ctx.fillStyle = '#3b82f6'
    ctx.beginPath()
    ctx.arc(ballX, ballY, cellSize * 0.3, 0, 2 * Math.PI)
    ctx.fill()

    ctx.fillStyle = '#60a5fa'
    ctx.beginPath()
    ctx.arc(ballX - cellSize * 0.1, ballY - cellSize * 0.1, cellSize * 0.1, 0, 2 * Math.PI)
    ctx.fill()
  }, [maze, ball, mazeShape, mazeSize])

  useEffect(() => {
    drawMaze()
  }, [drawMaze])

  useEffect(() => {
    const handleResize = () => {
      drawMaze()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [drawMaze])

  return (
    <div
      className="bg-background relative w-full overflow-hidden"
      style={{
        aspectRatio: `${layoutHint.cols} / ${layoutHint.rows}`,
        maxHeight: '70vh',
      }}
    >
      <canvas ref={setRef} className="h-full w-full cursor-pointer" style={{ display: 'block' }} />
    </div>
  )
})

MazeCanvas.displayName = 'MazeCanvas'

export default MazeCanvas
