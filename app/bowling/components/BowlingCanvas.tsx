'use client'

/* eslint-disable react-hooks/immutability -- the physics loop intentionally coordinates mutable Three/Cannon refs */

import { useRef, useEffect } from 'react'
import { useBowlingStore } from '../store'
import { GameControls } from './GameControls'
import { useBowlingControls } from '../hooks/useBowlingControls'
import { useBowlingScene } from '../hooks/useBowlingScene'
import { useBowlingAnimation } from '../hooks/useBowlingAnimation'
import { useBowlingGameState } from '../hooks/useBowlingGameState'
import { LANE_END_Z, LANE_SURFACE_Y, PIT_BACK_Z, PIT_FLOOR_Y, PIT_WIDTH } from '../utils/layout'

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

  useEffect(() => {
    const gameWindow = window as Window & { render_game_to_text?: () => string }
    const renderGameToText = () => {
      const state = useBowlingStore.getState()
      const ball = sceneRef.current?.ball?.body
      return JSON.stringify({
        coordinateSystem: 'lane origin center; +x right, +y up, -z toward pins',
        mode: state.gameFinished
          ? 'gameOver'
          : state.showingResult
            ? 'result'
            : state.ballThrown
              ? 'rolling'
              : 'aiming',
        currentFrame: state.currentFrame,
        currentThrow: state.currentThrow,
        totalScore: state.totalScore,
        pinsStanding: state.pinsStanding,
        frames: state.frames,
        lastResultKind: state.lastResultKind,
        ball: ball
          ? {
              ...ball.position,
              velocity: { ...ball.velocity },
              inPit: ball.position.z < LANE_END_Z && ball.position.y < LANE_SURFACE_Y,
            }
          : null,
        pins: sceneRef.current?.pins.map(pin => ({ ...pin.body.position })),
        pit: { entranceZ: LANE_END_Z, backZ: PIT_BACK_Z, floorY: PIT_FLOOR_Y, width: PIT_WIDTH },
      })
    }
    gameWindow.render_game_to_text = renderGameToText
    return () => {
      if (gameWindow.render_game_to_text === renderGameToText) delete gameWindow.render_game_to_text
    }
  }, [sceneRef])

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
          startCharging(e, canvasRef.current || undefined)
        }}
        onTouchEnd={endCharging}
        onTouchCancel={endCharging}
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
