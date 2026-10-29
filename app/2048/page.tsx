'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { isMobileDevice } from '@/lib/utils/userAgent'
import { AutoPlayControls } from './components/AutoPlayControls'
import { DirectionControls } from './components/DirectionControls'
import { GAME_2048_RULES, Game2048Header } from './components/Game2048Header'
import { GameBoard } from './components/GameBoard'
import { GameStatus } from './components/GameStatus'
import { GameStage } from '@/components/game'
import { DEFAULT_AUTO_PLAY_SPEED } from './config'
import {
  useAutoPlay,
  useGameSound,
  useGyroscopeControls,
  useKeyboardControls,
  useSwipeControls,
} from './hooks'
import { useGame2048Store } from './store'
import {
  type Board,
  type Direction,
  addRandomTile,
  initializeBoard,
  isGameOver,
  moveDown,
  moveLeft,
  moveRight,
  moveUp,
} from './utils/gameEngine'

interface GameSnapshot {
  board: Board
  score: number
  gameOver: boolean
  gameWon: boolean
  history: { board: Board; score: number }[]
}

const RANDOM_DIRECTION_DISPLAY_TIME = 500
const DIRECTIONS: Direction[] = ['up', 'right', 'down', 'left']
const MOVE_HANDLERS = {
  left: moveLeft,
  right: moveRight,
  up: moveUp,
  down: moveDown,
}

const getRandomDirection = (): Direction =>
  DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]

export default function Game2048() {
  const { bestScore, setBestScore, incrementGamesPlayed, incrementGamesWon } = useGame2048Store()
  const [gameState, setGameState] = useState<GameSnapshot>(() => ({
    board: initializeBoard(),
    score: 0,
    gameOver: false,
    gameWon: false,
    history: [],
  }))
  const { board, score, gameOver, gameWon, history } = gameState
  const gameStateRef = useRef(gameState)
  const updateGameState = useCallback((nextState: GameSnapshot) => {
    gameStateRef.current = nextState
    setGameState(nextState)
  }, [])
  const [showRandomDirection, setShowRandomDirection] = useState<Direction | null>(null)
  const [isMobile] = useState(() => isMobileDevice())
  const randomDirectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { playSound } = useGameSound()

  const handleMove = useCallback(
    (direction: Direction) => {
      const current = gameStateRef.current
      if (current.gameOver) return

      const result = MOVE_HANDLERS[direction](current.board)
      if (!result.moved) return

      // Randomness, audio and statistics belong to the action, not a replayable updater.
      const nextBoard = result.newBoard.map(row => [...row])
      addRandomTile(nextBoard)
      const nextWon = current.gameWon || nextBoard.some(row => row.includes(2048))
      const nextGameOver = isGameOver(nextBoard)
      updateGameState({
        board: nextBoard,
        score: current.score + result.scoreGained,
        gameWon: nextWon,
        gameOver: nextGameOver,
        history: [
          ...current.history.slice(-4),
          { board: current.board.map(row => [...row]), score: current.score },
        ],
      })
      void playSound()
      if (!current.gameWon && nextWon) incrementGamesWon()
      if (nextGameOver) {
        incrementGamesPlayed()
        toast.error('游戏结束！')
      }
    },
    [incrementGamesPlayed, incrementGamesWon, playSound, updateGameState]
  )

  const {
    isRunning: isAutoPlayRunning,
    isDirectional: isDirectionalRunning,
    isClockwise,
    speed,
    changeSpeed,
    stop: stopAutoPlay,
    reset: resetAutoPlay,
    toggleRandom,
    toggleClockwise,
    toggleCounterClockwise,
  } = useAutoPlay({
    onMove: handleMove,
    speed: DEFAULT_AUTO_PLAY_SPEED,
    enabled: !gameOver,
  })
  const isAutoRunning = isAutoPlayRunning && !isDirectionalRunning

  const {
    isSupported: isGyroscopeSupported,
    isEnabled: isGyroscopeEnabled,
    toggle: toggleGyroscope,
  } = useGyroscopeControls({ onMove: handleMove })

  useKeyboardControls({ onMove: handleMove, enabled: !gameOver })
  useSwipeControls({
    onMove: handleMove,
    enabled: !gameOver && !isGyroscopeEnabled,
  })

  const randomMoveOnce = useCallback(() => {
    if (gameOver || isAutoPlayRunning) return

    const direction = getRandomDirection()
    setShowRandomDirection(direction)
    handleMove(direction)

    if (randomDirectionTimeoutRef.current) {
      clearTimeout(randomDirectionTimeoutRef.current)
    }
    randomDirectionTimeoutRef.current = setTimeout(
      () => setShowRandomDirection(null),
      RANDOM_DIRECTION_DISPLAY_TIME
    )
  }, [gameOver, handleMove, isAutoPlayRunning])

  const resetGame = useCallback(() => {
    resetAutoPlay()
    updateGameState({
      board: initializeBoard(),
      score: 0,
      gameOver: false,
      gameWon: false,
      history: [],
    })
    if (randomDirectionTimeoutRef.current !== null) {
      clearTimeout(randomDirectionTimeoutRef.current)
      randomDirectionTimeoutRef.current = null
    }
    setShowRandomDirection(null)
  }, [resetAutoPlay, updateGameState])

  const undoMove = useCallback(() => {
    const current = gameStateRef.current
    const previous = current.history.at(-1)
    if (!previous) return

    stopAutoPlay()
    updateGameState({
      ...current,
      board: previous.board,
      score: previous.score,
      history: current.history.slice(0, -1),
      gameOver: false,
    })
    void playSound()
  }, [playSound, stopAutoPlay, updateGameState])

  useEffect(() => {
    if (score > 0) setBestScore(score)
  }, [score, setBestScore])

  useEffect(
    () => () => {
      if (randomDirectionTimeoutRef.current) {
        clearTimeout(randomDirectionTimeoutRef.current)
      }
    },
    []
  )

  useEffect(() => {
    const gameWindow = window as Window & {
      advanceTime?: (milliseconds: number) => void
      render_game_to_text?: () => string
    }

    gameWindow.render_game_to_text = () =>
      JSON.stringify({
        coordinateSystem: 'board[row][column], origin top-left',
        mode: gameOver ? 'game-over' : gameWon ? 'won' : 'playing',
        score,
        bestScore,
        autoPlay: isDirectionalRunning
          ? isClockwise
            ? 'clockwise'
            : 'counter-clockwise'
          : isAutoRunning
            ? 'random'
            : 'idle',
        board,
      })
    gameWindow.advanceTime = () => undefined

    return () => {
      delete gameWindow.render_game_to_text
      delete gameWindow.advanceTime
    }
  }, [bestScore, board, gameOver, gameWon, isAutoRunning, isClockwise, isDirectionalRunning, score])

  return (
    <GameStage
      title="2048"
      rules={GAME_2048_RULES}
      fill
      onContextMenu={e => e.preventDefault()}
      contentClassName="overflow-y-auto"
    >
      <div className="mx-auto flex w-full max-w-md flex-col">
        <Game2048Header
          score={score}
          bestScore={bestScore}
          canUndo={history.length > 0}
          gameOver={gameOver}
          showGyroscope={isMobile && isGyroscopeSupported}
          gyroscopeEnabled={isGyroscopeEnabled}
          onUndo={undoMove}
          onReset={resetGame}
          onToggleGyroscope={() => void toggleGyroscope()}
        />

        <GameBoard board={board} />
        <GameStatus gameWon={gameWon} gameOver={gameOver} score={score} />

        <DirectionControls
          onMove={handleMove}
          onRandomMove={randomMoveOnce}
          disabled={gameOver || isAutoPlayRunning}
          showRandomDirection={showRandomDirection}
        />

        <AutoPlayControls
          speed={speed}
          gameOver={gameOver}
          randomRunning={isAutoRunning}
          directionalRunning={isDirectionalRunning}
          clockwise={isClockwise}
          onSpeedChange={changeSpeed}
          onToggleRandom={toggleRandom}
          onToggleClockwise={toggleClockwise}
          onToggleCounterClockwise={toggleCounterClockwise}
        />
      </div>
    </GameStage>
  )
}
