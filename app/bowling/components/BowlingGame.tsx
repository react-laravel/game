'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { GameRulesDialog } from '@/components/ui/game-rules-dialog'
import { useBowlingStore } from '../store'
import { buildScorecard } from '../utils/scoring'
import { BowlingCanvas } from './BowlingCanvas'
import { BowlingScorecard } from './BowlingScorecard'
import { GameOverOverlay, GyroPermissionDialog, ThrowResultOverlay } from './BowlingOverlays'
import { useBowlingSounds } from '../hooks/useBowlingSounds'

export function BowlingGame() {
  const {
    gameStarted,
    gameFinished,
    gyroSupported,
    gyroPermission,
    startGame,
    detectGyroSupport,
    requestGyroPermission,
    showingResult,
    lastResultKind,
    lastKnockedDown,
    frames,
    currentFrame,
    totalScore,
    ballThrown,
  } = useBowlingStore()

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const [showPermissionDialog, setShowPermissionDialog] = useState(false)
  const { play } = useBowlingSounds()

  useEffect(() => {
    const init = async () => {
      await detectGyroSupport()
      if (!useBowlingStore.getState().gameStarted) {
        startGame()
      }
    }
    void init()
  }, [detectGyroSupport, startGame])

  useEffect(() => {
    if (isMounted && gyroSupported && !gyroPermission) {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
      if (isMobile) {
        const timer = window.setTimeout(() => setShowPermissionDialog(true), 400)
        return () => window.clearTimeout(timer)
      }
    }
  }, [isMounted, gyroSupported, gyroPermission])

  useEffect(() => {
    if (!isMounted || !gyroSupported || !gyroPermission) return

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { beta, gamma } = event
      if (beta !== null && gamma !== null) {
        const normalizedX = Math.max(-1, Math.min(1, gamma / 45))
        const normalizedY = Math.max(-1, Math.min(1, beta / 45))
        useBowlingStore.getState().updateTilt(normalizedX, normalizedY)
      }
    }

    window.addEventListener('deviceorientation', handleOrientation)
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [gyroSupported, gyroPermission, isMounted])

  useEffect(() => {
    if (ballThrown) play('throw')
  }, [ballThrown, play])

  useEffect(() => {
    if (!showingResult || !lastResultKind) return
    if (lastResultKind === 'strike') play('strike')
    else if (lastResultKind === 'spare') play('spare')
    else if (lastResultKind === 'gutter') play('gutter')
    else play('pins')
  }, [showingResult, lastResultKind, play])

  useEffect(() => {
    const gameWindow = window as Window & { render_game_to_text?: () => string }
    gameWindow.render_game_to_text = () =>
      JSON.stringify({
        coordinateSystem: 'lane origin center; +x right, +y up, -z toward pins',
        mode: gameFinished ? 'gameOver' : showingResult ? 'result' : ballThrown ? 'rolling' : 'aiming',
        currentFrame,
        currentThrow: useBowlingStore.getState().currentThrow,
        totalScore,
        pinsStanding: useBowlingStore.getState().pinsStanding,
        frames,
        lastResultKind,
      })
    return () => {
      delete gameWindow.render_game_to_text
    }
  }, [gameFinished, showingResult, ballThrown, currentFrame, totalScore, frames, lastResultKind])

  const scorecard = buildScorecard(frames)

  return (
    <div className="relative flex h-dvh min-h-0 flex-col overflow-hidden bg-zinc-950 text-white">
      <div className="absolute top-3 right-3 z-40 sm:top-4 sm:right-4">
        <GameRulesDialog
          title="保龄球规则"
          rules={[
            '一共十局，每局最多两球；第十局全中或补中可加投',
            '按住投球键蓄力，松手出球',
            '手机可倾斜瞄准；桌面用拖动、A / D 或方向键瞄准，空格蓄力',
            '全中（Strike）得 10 分加后面两球，补中（Spare）加下一球',
            '打完十局后可再来一局',
          ]}
        />
      </div>

      {showPermissionDialog && (
        <GyroPermissionDialog
          onEnable={() => {
            void requestGyroPermission()
            setShowPermissionDialog(false)
          }}
          onSkip={() => setShowPermissionDialog(false)}
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center px-3">
        <BowlingScorecard
          frames={scorecard}
          currentFrame={currentFrame}
          totalScore={totalScore}
          gameFinished={gameFinished}
        />
      </div>

      <div className="min-h-0 flex-1">
        {gameStarted && <BowlingCanvas />}
      </div>

      {showingResult && lastResultKind && (
        <ThrowResultOverlay kind={lastResultKind} knockedDown={lastKnockedDown} />
      )}

      {gameFinished && (
        <GameOverOverlay totalScore={totalScore} onReplay={startGame} />
      )}
    </div>
  )
}
