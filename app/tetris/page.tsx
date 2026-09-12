'use client'

import { useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GameResultOverlay, GameStage } from '@/components/game'
import { useTetrisGame } from './hooks/useTetrisGame'
import { useKeyboardControls } from './hooks/useKeyboardControls'
import { GameBoard } from './components/GameBoard'
import { NextPieceDisplay } from './components/NextPieceDisplay'
import { GameInfo } from './components/GameInfo'
import { MobileControls } from './components/MobileControls'

const TETRIS_RULES = [
  '使用方向键移动和旋转方块',
  '空格键硬降，下方向键软降',
  'P键暂停游戏',
  '填满一行会自动消除并得分',
  '消除多行可获得更高分数',
  '方块堆到顶部游戏结束',
]

export default function TetrisGame() {
  const {
    gameState,
    isSoftDropping,
    movePiece,
    rotatePiece,
    hardDrop,
    startSoftDrop,
    stopSoftDrop,
    resetGame,
    togglePause,
    bestScore,
    soundMuted,
    toggleSound,
  } = useTetrisGame()

  useEffect(() => {
    const gameWindow = window as Window & {
      render_game_to_text?: () => string
    }

    gameWindow.render_game_to_text = () =>
      JSON.stringify({
        mode: gameState.gameOver ? 'gameOver' : gameState.paused ? 'paused' : 'playing',
        coordinateSystem: 'board origin top-left; x increases right; y increases down',
        score: gameState.score,
        lines: gameState.lines,
        level: gameState.level,
        soundMuted,
        activePiece: gameState.currentPiece
          ? {
              type: gameState.currentPiece.type,
              position: gameState.currentPiece.position,
              shape: gameState.currentPiece.shape,
            }
          : null,
        settledRows: gameState.board.map(row => row.map(cell => (cell ? '#' : '.')).join('')),
      })

    return () => {
      delete gameWindow.render_game_to_text
    }
  }, [gameState, soundMuted])

  useKeyboardControls({
    movePiece,
    rotatePiece,
    hardDrop,
    togglePause,
    gameOver: gameState.gameOver,
  })

  return (
    <GameStage
      title="俄罗斯方块"
      rules={TETRIS_RULES}
      fill
      className="bg-zinc-950 text-white"
      actions={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={toggleSound}
          aria-label={soundMuted ? '开启音效' : '关闭音效'}
          title={soundMuted ? '开启音效' : '关闭音效'}
        >
          {soundMuted ? <VolumeX /> : <Volume2 />}
        </Button>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-300/10 to-transparent" />
            <div className="relative z-10 flex gap-4">
              <div className="flex flex-col">
                <GameBoard board={gameState.board} currentPiece={gameState.currentPiece} />
              </div>
              <div className="flex w-32 flex-col gap-3 sm:w-40">
                <NextPieceDisplay nextPiece={gameState.nextPiece} isClient={gameState.isClient} />
                <GameInfo
                  score={gameState.score}
                  lines={gameState.lines}
                  level={gameState.level}
                  bestScore={bestScore}
                />
                {!gameState.gameOver && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-8 border-white/15 bg-white/5 font-mono text-[10px] text-white hover:bg-white/10 ${
                      gameState.paused ? 'bg-amber-500/15 text-amber-200' : ''
                    }`}
                    onClick={togglePause}
                  >
                    PAUSE
                  </Button>
                )}
              </div>
            </div>
          </div>
          <GameResultOverlay open={gameState.gameOver} eyebrow="GAME OVER" title="游戏结束">
            <p className="mt-3 text-sm text-white/55">得分 {gameState.score.toLocaleString()}</p>
            <Button
              className="mt-6 w-full bg-amber-400 py-5 font-bold text-zinc-950 hover:bg-amber-300"
              onClick={resetGame}
            >
              重新开始
            </Button>
          </GameResultOverlay>
        </div>

        <MobileControls
          movePiece={movePiece}
          rotatePiece={rotatePiece}
          hardDrop={hardDrop}
          startSoftDrop={startSoftDrop}
          stopSoftDrop={stopSoftDrop}
          isSoftDropping={isSoftDropping}
        />
      </div>
    </GameStage>
  )
}
