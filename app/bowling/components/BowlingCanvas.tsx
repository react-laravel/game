'use client'

/* eslint-disable react-hooks/immutability -- the physics loop intentionally coordinates mutable Three/Cannon refs */

import { useRef, useEffect } from 'react'
import { useBowlingStore } from '../store'
import { GameControls } from './GameControls'
import { useBowlingControls } from '../hooks/useBowlingControls'
import { useBowlingScene } from '../hooks/useBowlingScene'
import { useBowlingAnimation } from '../hooks/useBowlingAnimation'
import { useBowlingGameState } from '../hooks/useBowlingGameState'

export function BowlingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { aimAngle, power, gyroSupported, gyroPermission, pinResetVersion, pinsStanding } =
    useBowlingStore()

  const { refs, gameState, handleResultProcessed, resetProcessingState, setMounted } =
    useBowlingGameState()

  const {
    sceneRef,
    isMounted,
    resetBall,
    resetPins,
    resetScene,
    throwBall,
    calculateKnockedDownPins,
    updateAimGuide,
  } = useBowlingScene(canvasRef)

  const {
    isCharging,
    chargePower,
    currentAimAngle,
    isDragging,
    startCharging,
    endCharging,
    updateManualAngle,
  } = useBowlingControls()

  const onResultProcessed = () => {
    const totalDown = calculateKnockedDownPins()
    const alreadyDown = 10 - useBowlingStore.getState().pinsStanding
    handleResultProcessed(Math.max(0, totalDown - alreadyDown))
  }

  useBowlingAnimation({
    sceneRef,
    showingResult: gameState.showingResult,
    ballThrownRef: refs.ballThrownRef,
    isProcessingResultRef: refs.isProcessingResultRef,
    onResultProcessed,
  })

  useEffect(() => {
    updateAimGuide(currentAimAngle, gameState.canThrow && !gameState.ballThrown)
  }, [currentAimAngle, gameState.canThrow, gameState.ballThrown, updateAimGuide])

  useEffect(() => {
    if (!isDragging || !isCharging) return

    const handleMouseMove = (event: MouseEvent) => {
      if (canvasRef.current) {
        updateManualAngle(event, canvasRef.current)
      }
    }

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault()
      if (canvasRef.current) {
        updateManualAngle(event, canvasRef.current)
      }
    }

    const handleMouseUp = () => endCharging()
    const handleTouchEnd = () => endCharging()

    if (!gyroSupported || !gyroPermission) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, isCharging, gyroSupported, gyroPermission, updateManualAngle, endCharging])

  useEffect(() => {
    if (isMounted.current) {
      resetScene()
      resetProcessingState()
    }
  }, [gameState.currentFrame, resetScene, resetProcessingState, isMounted])

  useEffect(() => {
    if (isMounted.current && gameState.currentThrow >= 2 && !gameState.showingResult) {
      resetBall()
      resetProcessingState()
    }
  }, [
    gameState.currentThrow,
    resetBall,
    resetProcessingState,
    gameState.showingResult,
    isMounted,
  ])

  useEffect(() => {
    if (pinResetVersion > 0 && pinsStanding === 10) {
      resetPins()
    }
  }, [pinResetVersion, pinsStanding, resetPins])

  useEffect(() => {
    if (!gameState.ballThrown || !sceneRef.current?.ball) return

    refs.ballThrownRef.current = true
    throwBall(aimAngle, power)
  }, [gameState.ballThrown, aimAngle, power, throwBall, refs.ballThrownRef, sceneRef])

  useEffect(() => {
    if (sceneRef.current) {
      setMounted()
    }
  }, [sceneRef, setMounted])

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden bg-zinc-950">
      <canvas
        ref={canvasRef}
        className="h-full w-full touch-none"
        style={{ display: 'block' }}
        onMouseDown={e => startCharging(e, canvasRef.current || undefined)}
        onMouseUp={endCharging}
        onMouseLeave={endCharging}
        onTouchStart={e => {
          e.preventDefault()
          startCharging(e, canvasRef.current || undefined)
        }}
        onTouchEnd={e => {
          e.preventDefault()
          endCharging()
        }}
        onTouchCancel={e => {
          e.preventDefault()
          endCharging()
        }}
      />

      <GameControls
        canThrow={gameState.canThrow}
        ballThrown={gameState.ballThrown}
        isCharging={isCharging}
        chargePower={chargePower}
        currentAimAngle={currentAimAngle}
        gyroEnabled={Boolean(gyroSupported && gyroPermission)}
        onChargeStart={() => startCharging(undefined, canvasRef.current || undefined)}
        onChargeEnd={endCharging}
      />
    </div>
  )
}
