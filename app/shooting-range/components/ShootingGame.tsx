'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { primeShootingAudio, setShootingSfxSettings } from '../utils/audioUtils'
import { useFpsMeter } from '../hooks/useFpsMeter'
import { usePointerLock } from '../hooks/usePointerLock'
import { useWeaponControls } from '../hooks/useWeaponControls'
import { useShootingDebugBridge } from '../hooks/useShootingDebugBridge'
import { useShootingSession } from '../hooks/useShootingSession'
import type { CrosshairConfig } from '../utils/crosshairConfig'
import { drillLabelForConfig } from '../utils/drillPresets'
import {
  dismissTutorialTip,
  isTutorialTipDismissed,
} from '../utils/tutorialTipStorage'
import {
  compareToPersonalBest,
  computeSessionGrade,
} from '../utils/sessionInsights'
import { loadSessionHistory } from '../utils/statsStorage'
import type { HitZone, OutdoorTimeOfDay, ShootingDifficulty, ShootingMapId, TargetShape, TrainingModeId } from '../types'
import { useMotionPreference } from '../hooks/useMotionPreference'
import { ShootingHelpSheet } from './ShootingHelpSheet'
import { Crosshair } from './game/Crosshair'
import { GameUI } from './game/GameUI'
import { SessionFeedback } from './game/SessionFeedback'
import { ScopeOverlay, WeaponStatus } from './game/ScopeOverlay'
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
  targetShape: TargetShape
  onTargetShapeChange: (value: TargetShape) => void
  outdoorTimeOfDay: OutdoorTimeOfDay
  onOutdoorTimeOfDayChange: (value: OutdoorTimeOfDay) => void
  lookSensitivity: number
  recoilEnabled: boolean
  sfxVolume: number
  sfxMuted: boolean
  onLookSensitivityChange: (value: number) => void
  onRecoilEnabledChange: (enabled: boolean) => void
  onSfxVolumeChange: (value: number) => void
  onSfxMutedChange: (muted: boolean) => void
  crosshairConfig: CrosshairConfig
  onCrosshairChange: (patch: Partial<CrosshairConfig>) => void
  onCrosshairReset: () => void
  setGameStarted?: (started: boolean) => void
  onViewHistory?: () => void
  onChangeDrill?: () => void
}

export default function ShootingGame({
  difficulty,
  mapId,
  modeId,
  targetShape,
  onTargetShapeChange,
  outdoorTimeOfDay,
  onOutdoorTimeOfDayChange,
  lookSensitivity,
  recoilEnabled,
  sfxVolume,
  sfxMuted,
  onLookSensitivityChange,
  onRecoilEnabledChange,
  onSfxVolumeChange,
  onSfxMutedChange,
  crosshairConfig,
  onCrosshairChange,
  onCrosshairReset,
  setGameStarted,
  onViewHistory,
  onChangeDrill,
}: ShootingGameProps) {
  const [fallbackPaused, setFallbackPaused] = useState(false)
  const [showHelpSheet, setShowHelpSheet] = useState(false)
  const [showTutorialTip, setShowTutorialTip] = useState(() => !isTutorialTipDismissed(modeId))
  const { preference: motionPreference, reducedMotion, setPreference: setMotionPreference } =
    useMotionPreference()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneSnapshot = useRef<ShootingSceneSnapshot>({
    camera: { yaw: 0, pitch: 0 },
    targets: [],
  })
  const config = { difficulty, mapId, modeId, targetShape, outdoorTimeOfDay }
  const { displayFps, reportFps } = useFpsMeter()
  const {
    timeLeft,
    durationSeconds,
    gameOver,
    gameStarted,
    showStartOverlay,
    hitMarker,
    headshotMarker,
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
    (needsPointerLock && !showStartOverlay) ||
    ((fallbackPaused || forcePauseOverlay) && gameStarted && !gameOver)

  const inputActive = gameStarted && !gameOver && !showPauseOverlay && !showHelpSheet &&
    !showStartOverlay && !pointerLockError && (isPointerLocked || browserSupport.useFallback)
  const { weaponId, isAiming, isScoped } = useWeaponControls(canvasRef, inputActive, browserSupport.useFallback)

  useShootingDebugBridge({
    canvasRef,
    sceneSnapshot,
    difficulty,
    mapId,
    modeId,
    targetShape,
    weaponId,
    isAiming,
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

  useEffect(() => {
    if (!gameOver) return
    releasePointerLock()
  }, [gameOver, releasePointerLock])

  useEffect(() => {
    if (!showTutorialTip || !gameStarted || gameOver) return
    const timer = window.setTimeout(() => setShowTutorialTip(false), 9000)
    return () => window.clearTimeout(timer)
  }, [gameOver, gameStarted, modeId, showTutorialTip])

  const dismissTutorial = useCallback(() => {
    dismissTutorialTip(modeId)
    setShowTutorialTip(false)
  }, [modeId])

  const startGame = useCallback(() => {
    setShootingSfxSettings({ volume: sfxVolume, muted: sfxMuted })
    primeShootingAudio()
    setShowTutorialTip(!isTutorialTipDismissed(modeId))
    beginTraining()
    requestPointerLock()
  }, [beginTraining, modeId, requestPointerLock, sfxMuted, sfxVolume])

  const resumePointerLock = useCallback(() => {
    setFallbackPaused(false)
    requestPointerLock()
    window.requestAnimationFrame(() => {
      requestPointerLock()
    })
  }, [requestPointerLock])

  const showHitFeedbackRef = useRef(showHitFeedback)
  useEffect(() => {
    showHitFeedbackRef.current = showHitFeedback
  }, [showHitFeedback])

  const handleShotResult = useCallback(
    (didHit: boolean, reactionMs?: number, hitZone?: HitZone) => {
      recordShot(didHit, reactionMs, hitZone)
      if (didHit) {
        dismissTutorialTip(modeId)
        setShowTutorialTip(false)
      }
    },
    [modeId, recordShot]
  )

  const handleHitFeedback = useCallback((hitZone?: HitZone) => {
    showHitFeedbackRef.current(hitZone)
  }, [])

  const handleRestart = useCallback(() => {
    setFallbackPaused(false)
    primeShootingAudio()
    setShowTutorialTip(!isTutorialTipDismissed(modeId))
    restartTraining()
    releasePointerLock()
    resumePointerLock()
  }, [modeId, releasePointerLock, restartTraining, resumePointerLock])

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
      if (
        event.code === 'Escape' &&
        browserSupport.useFallback &&
        gameStarted &&
        !gameOver &&
        !showPauseOverlay &&
        !showHelpSheet
      ) {
        event.preventDefault()
        setFallbackPaused(true)
      }
      if (event.code === 'Escape' && showHelpSheet) {
        event.preventDefault()
        handleCloseHelp()
      }
    }

    window.addEventListener('keydown', handleKeyDown, { passive: false })
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    browserSupport.useFallback,
    gameOver,
    gameStarted,
    needsPointerLock,
    pointerLockError,
    resumePointerLock,
    showStartOverlay,
    showHelpSheet,
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
    setFallbackPaused(false)
    releasePointerLock()
    returnToSettings()
  }, [releasePointerLock, returnToSettings])

  const drillLabel = drillLabelForConfig(modeId, mapId, difficulty, targetShape)
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
    <div className="relative h-full w-full overflow-hidden bg-[#202b29]">
      <ShootingGameCanvas
        canvasRef={canvasRef}
        sceneSnapshot={sceneSnapshot}
        difficulty={difficulty}
        mapId={mapId}
        modeId={modeId}
        targetShape={targetShape}
        outdoorTimeOfDay={outdoorTimeOfDay}
        lookSensitivity={lookSensitivity}
        reducedMotion={reducedMotion}
        recoilEnabled={recoilEnabled}
        weaponId={weaponId}
        isAiming={isAiming}
        gameStarted={gameStarted && !showPauseOverlay && !showHelpSheet}
        gameOver={gameOver}
        useFallbackControls={browserSupport.useFallback}
        onShotResult={handleShotResult}
        onHitFeedback={handleHitFeedback}
        onFpsReport={reportFps}
      />

      {gameStarted && !gameOver && !showPauseOverlay && (isPointerLocked || browserSupport.useFallback) && (
        <>
          {!isScoped && <Crosshair
            config={crosshairConfig}
            hit={hitMarker}
            headshot={headshotMarker}
            miss={missMarker}
          />}
          {!isScoped && <SessionFeedback
            hitPulse={hitPulse}
            streakToast={streakToast}
            reducedMotion={reducedMotion}
          />}
        </>
      )}

      {inputActive && !isScoped && <WeaponStatus weaponId={weaponId} isAiming={isAiming} />}
      {isScoped && <ScopeOverlay hit={hitMarker || headshotMarker} />}

      {!isScoped && <GameUI
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
        onDismissTutorialTip={dismissTutorial}
        onRestart={handleRestart}
        onViewHistory={onViewHistory}
        onChangeDrill={onChangeDrill}
      />}

      {showStartOverlay && !gameOver && !pointerLockError && (
        <ShootingReadyOverlay onStart={startGame} />
      )}

      {showPauseOverlay && (
        <ShootingPauseOverlay
          drillLabel={drillLabel}
          lookSensitivity={lookSensitivity}
          recoilEnabled={recoilEnabled}
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
          onRecoilEnabledChange={onRecoilEnabledChange}
          onSfxVolumeChange={onSfxVolumeChange}
          onSfxMutedChange={onSfxMutedChange}
          onMotionPreferenceChange={setMotionPreference}
          targetShape={targetShape}
          onTargetShapeChange={onTargetShapeChange}
          mapId={mapId}
          outdoorTimeOfDay={outdoorTimeOfDay}
          onOutdoorTimeOfDayChange={onOutdoorTimeOfDayChange}
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
    </div>
  )
}
