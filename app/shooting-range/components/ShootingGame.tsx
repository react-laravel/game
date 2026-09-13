'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CircleHelp, LogOut, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { primeShootingAudio, setShootingSfxSettings } from '../utils/audioUtils'
import { useFpsMeter } from '../hooks/useFpsMeter'
import { usePointerLock } from '../hooks/usePointerLock'
import { useShootingDebugBridge } from '../hooks/useShootingDebugBridge'
import { useShootingSession } from '../hooks/useShootingSession'
import type { CrosshairConfig } from '../utils/crosshairConfig'
import { drillLabelForConfig } from '../utils/drillPresets'
import {
  compareToPersonalBest,
  computeSessionGrade,
} from '../utils/sessionInsights'
import { loadSessionHistory } from '../utils/statsStorage'
import type { ShootingDifficulty, ShootingMapId, TrainingModeId } from '../types'
import { useMotionPreference } from '../hooks/useMotionPreference'
import { CrosshairSettingsSheet } from './CrosshairSettingsSheet'
import { ShootingHelpSheet } from './ShootingHelpSheet'
import { Crosshair } from './game/Crosshair'
import { GameUI } from './game/GameUI'
import { SessionFeedback } from './game/SessionFeedback'
import type { ShootingSceneSnapshot } from './game/GameScene'
import { ShootingGameCanvas } from './ShootingGameCanvas'
import {
  ShootingPauseOverlay,
  ShootingPointerLockError,
  ShootingReadyOverlay,
  UnsupportedShootingDevice,
} from './ShootingGameOverlays'

interface ShootingGameProps {
  difficulty: ShootingDifficulty
  mapId: ShootingMapId
  modeId: TrainingModeId
  lookSensitivity: number
  sfxVolume: number
  sfxMuted: boolean
  onLookSensitivityChange: (value: number) => void
  onSfxVolumeChange: (value: number) => void
  onSfxMutedChange: (muted: boolean) => void
  crosshairConfig: CrosshairConfig
  onCrosshairChange: (patch: Partial<CrosshairConfig>) => void
  onCrosshairReset: () => void
  onCrosshairApply: (config: CrosshairConfig) => void
  setGameStarted?: (started: boolean) => void
  onViewHistory?: () => void
  onChangeDrill?: () => void
}

export default function ShootingGame({
  difficulty,
  mapId,
  modeId,
  lookSensitivity,
  sfxVolume,
  sfxMuted,
  onLookSensitivityChange,
  onSfxVolumeChange,
  onSfxMutedChange,
  crosshairConfig,
  onCrosshairChange,
  onCrosshairReset,
  onCrosshairApply,
  setGameStarted,
  onViewHistory,
  onChangeDrill,
}: ShootingGameProps) {
  const [showCrosshairSettings, setShowCrosshairSettings] = useState(false)
  const [showHelpSheet, setShowHelpSheet] = useState(false)
  const [showTutorialTip, setShowTutorialTip] = useState(true)
  const { preference: motionPreference, reducedMotion, setPreference: setMotionPreference } =
    useMotionPreference()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneSnapshot = useRef<ShootingSceneSnapshot>({
    camera: { yaw: 0, pitch: 0 },
    targets: [],
  })
  const config = { difficulty, mapId, modeId }
  const { displayFps, reportFps } = useFpsMeter()
  const {
    timeLeft,
    durationSeconds,
    gameOver,
    gameStarted,
    showStartOverlay,
    hitMarker,
    missMarker,
    hitPulse,
    streakToast,
    sessionStats,
    recordShot,
    showHitFeedback,
    beginTraining,
    restartTraining,
    returnToSettings,
    endSessionEarly,
    injectSessionStats,
  } = useShootingSession(config, setGameStarted)
  const {
    browserSupport,
    pointerLockError,
    isPointerLocked,
    requestPointerLock,
    enableFallbackControls,
    releasePointerLock,
  } = usePointerLock(canvasRef)

  const forcePauseOverlay =
    typeof window !== 'undefined' &&
    Boolean((window as Window & { __SHOOTING_QA_FORCE_PAUSE__?: boolean }).__SHOOTING_QA_FORCE_PAUSE__)

  const needsPointerLock =
    gameStarted &&
    !gameOver &&
    !browserSupport.useFallback &&
    !isPointerLocked &&
    !pointerLockError

  const showPauseOverlay =
    (needsPointerLock && !showStartOverlay) || (forcePauseOverlay && gameStarted && !gameOver)

  useShootingDebugBridge({
    canvasRef,
    sceneSnapshot,
    difficulty,
    mapId,
    modeId,
    gameOver,
    gameStarted,
    stats: sessionStats,
    timeLeft,
    onEndSession: endSessionEarly,
    onInjectStats: injectSessionStats,
  })

  useEffect(() => {
    setShootingSfxSettings({ volume: sfxVolume, muted: sfxMuted })
  }, [sfxMuted, sfxVolume])

  const startGame = useCallback(() => {
    setShootingSfxSettings({ volume: sfxVolume, muted: sfxMuted })
    primeShootingAudio()
    setShowTutorialTip(true)
    beginTraining()
    requestPointerLock()
  }, [beginTraining, requestPointerLock, sfxMuted, sfxVolume])

  const resumePointerLock = useCallback(() => {
    requestPointerLock()
  }, [requestPointerLock])

  const handleShotResult = useCallback(
    (didHit: boolean, reactionMs?: number) => {
      recordShot(didHit, reactionMs)
      if (didHit) setShowTutorialTip(false)
    },
    [recordShot]
  )

  const handleRestart = useCallback(() => {
    setShowTutorialTip(true)
    restartTraining()
    requestPointerLock()
  }, [requestPointerLock, restartTraining])

  const handlePauseChangeDrill = useCallback(() => {
    releasePointerLock()
    onChangeDrill?.()
  }, [onChangeDrill, releasePointerLock])

  const handleOpenHelp = useCallback(() => {
    releasePointerLock()
    setShowHelpSheet(true)
  }, [releasePointerLock])

  const handleCloseHelp = useCallback(() => {
    setShowHelpSheet(false)
    if (gameStarted && !gameOver && !browserSupport.useFallback) {
      requestPointerLock()
    }
  }, [browserSupport.useFallback, gameOver, gameStarted, requestPointerLock])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') event.preventDefault()
      if (
        (event.code === 'Enter' || event.code === 'Space') &&
        !gameStarted &&
        !gameOver
      ) {
        event.preventDefault()
        startGame()
      }
      if (
        (event.code === 'Enter' || event.code === 'Space') &&
        needsPointerLock &&
        !showStartOverlay &&
        !pointerLockError &&
        !showHelpSheet &&
        !showCrosshairSettings &&
        !showPauseOverlay
      ) {
        event.preventDefault()
        resumePointerLock()
      }
      if (event.key === '?' && gameStarted && !gameOver) {
        event.preventDefault()
        if (showHelpSheet) {
          handleCloseHelp()
        } else {
          handleOpenHelp()
        }
      }
      if (event.code === 'Escape' && showHelpSheet) {
        event.preventDefault()
        handleCloseHelp()
      }
    }

    window.addEventListener('keydown', handleKeyDown, { passive: false })
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    gameOver,
    gameStarted,
    needsPointerLock,
    pointerLockError,
    resumePointerLock,
    showStartOverlay,
    showHelpSheet,
    showCrosshairSettings,
    showPauseOverlay,
    handleCloseHelp,
    handleOpenHelp,
    startGame,
  ])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || browserSupport.useFallback) return

    const handleCanvasClick = () => {
      if (gameStarted && !gameOver && !isPointerLocked) {
        requestPointerLock()
      }
    }

    canvas.addEventListener('click', handleCanvasClick)
    return () => canvas.removeEventListener('click', handleCanvasClick)
  }, [
    browserSupport.useFallback,
    gameOver,
    gameStarted,
    isPointerLocked,
    requestPointerLock,
  ])

  const handleBackToSettings = useCallback(() => {
    releasePointerLock()
    returnToSettings()
  }, [releasePointerLock, returnToSettings])

  const drillLabel = drillLabelForConfig(modeId, mapId, difficulty)
  const sessionGrade = useMemo(
    () => (gameOver ? computeSessionGrade(sessionStats, modeId) : null),
    [gameOver, modeId, sessionStats]
  )
  const personalBestComparison = useMemo(
    () =>
      gameOver ? compareToPersonalBest(sessionStats, modeId, loadSessionHistory()) : null,
    [gameOver, modeId, sessionStats]
  )

  if (!browserSupport.supported && !browserSupport.useFallback) {
    return <UnsupportedShootingDevice message={browserSupport.message} />
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-slate-950 shadow-2xl ring-1 ring-white/10">
      <ShootingGameCanvas
        canvasRef={canvasRef}
        sceneSnapshot={sceneSnapshot}
        difficulty={difficulty}
        mapId={mapId}
        modeId={modeId}
        lookSensitivity={lookSensitivity}
        reducedMotion={reducedMotion}
        gameStarted={gameStarted}
        gameOver={gameOver}
        useFallbackControls={browserSupport.useFallback}
        onShotResult={handleShotResult}
        onHitFeedback={showHitFeedback}
        onFpsReport={reportFps}
      />

      {gameStarted && !gameOver && isPointerLocked && (
        <>
          <Crosshair config={crosshairConfig} hit={hitMarker} miss={missMarker} />
          <SessionFeedback
            hitPulse={hitPulse}
            streakToast={streakToast}
            reducedMotion={reducedMotion}
          />
        </>
      )}

      {gameStarted && !gameOver && browserSupport.useFallback && (
        <SessionFeedback
          hitPulse={hitPulse}
          streakToast={streakToast}
          reducedMotion={reducedMotion}
        />
      )}

      {gameStarted && !showPauseOverlay && (
        <div className="absolute top-5 left-5 z-40 flex gap-2">
          <Button
            variant="ghost"
            className="border border-white/10 bg-slate-950/70 text-white shadow-xl backdrop-blur-md hover:bg-slate-900 hover:text-white"
            onClick={handleBackToSettings}
          >
            <LogOut className="h-4 w-4" />
            结束训练
          </Button>
          <Button
            variant="ghost"
            className="border border-white/10 bg-slate-950/70 text-white shadow-xl backdrop-blur-md hover:bg-slate-900 hover:text-white"
            onClick={() => {
              releasePointerLock()
              setShowCrosshairSettings(true)
            }}
            aria-label="准星设置"
          >
            <Settings2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="border border-white/10 bg-slate-950/70 text-white shadow-xl backdrop-blur-md hover:bg-slate-900 hover:text-white"
            onClick={handleOpenHelp}
            aria-label="操作说明"
          >
            <CircleHelp className="h-4 w-4" />
          </Button>
        </div>
      )}

      <GameUI
        stats={sessionStats}
        timeLeft={timeLeft}
        durationSeconds={durationSeconds}
        displayFps={displayFps}
        gameOver={gameOver}
        modeId={modeId}
        drillLabel={drillLabel}
        grade={sessionGrade}
        comparison={personalBestComparison}
        showTutorialTip={showTutorialTip && gameStarted && !gameOver}
        onRestart={handleRestart}
        onViewHistory={onViewHistory}
        onChangeDrill={onChangeDrill}
      />

      {showStartOverlay && !gameOver && !pointerLockError && (
        <ShootingReadyOverlay onStart={startGame} />
      )}

      {showPauseOverlay && (
        <ShootingPauseOverlay
          drillLabel={drillLabel}
          lookSensitivity={lookSensitivity}
          sfxVolume={sfxVolume}
          sfxMuted={sfxMuted}
          crosshairConfig={crosshairConfig}
          onCrosshairChange={onCrosshairChange}
          onCrosshairReset={onCrosshairReset}
          onResume={resumePointerLock}
          onRestart={handleRestart}
          onExitTraining={handleBackToSettings}
          onChangeDrill={onChangeDrill ? handlePauseChangeDrill : undefined}
          motionPreference={motionPreference}
          onSensitivityChange={onLookSensitivityChange}
          onSfxVolumeChange={onSfxVolumeChange}
          onSfxMutedChange={onSfxMutedChange}
          onMotionPreferenceChange={setMotionPreference}
        />
      )}

      {showHelpSheet && <ShootingHelpSheet onClose={handleCloseHelp} />}

      {pointerLockError && (
        <ShootingPointerLockError
          message={pointerLockError}
          onRetry={resumePointerLock}
          onFallback={enableFallbackControls}
        />
      )}

      {showCrosshairSettings && !showPauseOverlay && (
        <CrosshairSettingsSheet
          variant="ingame"
          applyLabel="应用并继续"
          config={crosshairConfig}
          onApply={onCrosshairApply}
          onClose={() => {
            setShowCrosshairSettings(false)
            if (gameStarted && !gameOver && !browserSupport.useFallback) {
              requestPointerLock()
            }
          }}
        />
      )}
    </div>
  )
}
