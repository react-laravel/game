import { useState, useEffect, useEffectEvent, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { useTetrisStore } from '../store'
import type { GameState, Position, Tetromino } from '../types'
import {
  createEmptyBoard,
  generateRandomTetromino,
  isValidPosition,
  rotateTetromino,
  placeTetromino,
  clearLines,
  calculateScore,
  calculateLevel,
  getDropSpeed,
  calculateHardDropDistance,
} from '../utils'
import { SCORING, GAME_SPEED } from '../constants'
import { useTetrisSounds, type TetrisSound } from './useTetrisSounds'

export function useTetrisGame() {
  const { bestScore, setBestScore, incrementGamesPlayed, addLinesCleared } = useTetrisStore()
  const { muted: soundMuted, playSound, toggleMuted: toggleSound } = useTetrisSounds()

  const [gameState, setGameState] = useState<GameState>(() => ({
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: null,
    score: 0,
    lines: 0,
    level: 1,
    gameOver: false,
    paused: false,
    isClient: false,
  }))
  const gameStateRef = useRef(gameState)
  const lastDropTime = useRef<number>(0)
  const softDropRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const softDroppingRef = useRef(false)
  const [isSoftDropping, setIsSoftDropping] = useState(false)

  // Commit once per action; timers and consecutive inputs always read the latest piece.
  const updateGameState = useCallback((nextState: GameState) => {
    gameStateRef.current = nextState
    setGameState(nextState)
  }, [])

  useEffect(() => {
    updateGameState({
      ...gameStateRef.current,
      isClient: true,
      currentPiece: generateRandomTetromino(),
      nextPiece: generateRandomTetromino(),
    })
    lastDropTime.current = Date.now()
  }, [updateGameState])

  const stopSoftDrop = useCallback(() => {
    if (softDropRef.current !== null) {
      clearTimeout(softDropRef.current)
      softDropRef.current = null
    }
    softDroppingRef.current = false
    setIsSoftDropping(false)
  }, [])

  const movePiece = useCallback(
    (direction: 'left' | 'right' | 'down'): boolean => {
      const state = gameStateRef.current
      if (!state.currentPiece || state.gameOver || state.paused) return false

      const newPosition: Position = { ...state.currentPiece.position }
      if (direction === 'left') newPosition.x -= 1
      else if (direction === 'right') newPosition.x += 1
      else newPosition.y += 1

      if (!isValidPosition(state.board, state.currentPiece, newPosition)) return false

      updateGameState({
        ...state,
        currentPiece: { ...state.currentPiece, position: newPosition },
      })
      if (direction === 'left' || direction === 'right') playSound('move')
      return true
    },
    [playSound, updateGameState]
  )

  const rotatePiece = useCallback(() => {
    const state = gameStateRef.current
    if (!state.currentPiece || state.gameOver || state.paused) return

    const rotated = rotateTetromino(state.currentPiece)
    if (!isValidPosition(state.board, rotated, rotated.position)) return

    updateGameState({ ...state, currentPiece: rotated })
    playSound('rotate')
  }, [playSound, updateGameState])

  const lockPiece = useCallback(
    (landedPiece: Tetromino, scoreBonus = 0, landingSound: TetrisSound = 'lock') => {
      const state = gameStateRef.current
      const newBoard = placeTetromino(state.board, landedPiece)
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard)
      const newLines = state.lines + linesCleared
      const newLevel = calculateLevel(newLines)
      const newScore = state.score + scoreBonus + calculateScore(linesCleared, state.level)
      const newPiece = state.nextPiece || generateRandomTetromino()
      const nextNewPiece = generateRandomTetromino()
      const gameOver = !isValidPosition(clearedBoard, newPiece, newPiece.position)

      stopSoftDrop()
      updateGameState({
        ...state,
        board: clearedBoard,
        currentPiece: gameOver ? null : newPiece,
        nextPiece: gameOver ? state.nextPiece : nextNewPiece,
        score: newScore,
        lines: newLines,
        level: newLevel,
        gameOver,
      })
      lastDropTime.current = Date.now()

      if (linesCleared > 0) {
        addLinesCleared(linesCleared)
        toast.success(`消除了 ${linesCleared} 行！`)
      }
      if (newScore > bestScore) setBestScore(newScore)
      if (gameOver) {
        incrementGamesPlayed()
        toast.error('游戏结束！')
        playSound('gameOver')
      } else if (linesCleared > 0) {
        playSound('clear')
      } else {
        playSound(landingSound)
      }
    },
    [addLinesCleared, bestScore, incrementGamesPlayed, playSound, setBestScore, stopSoftDrop, updateGameState]
  )

  const hardDrop = useCallback(() => {
    const state = gameStateRef.current
    if (!state.currentPiece || state.gameOver || state.paused) return

    const dropDistance = calculateHardDropDistance(state.board, state.currentPiece)
    const landedPiece = {
      ...state.currentPiece,
      position: {
        ...state.currentPiece.position,
        y: state.currentPiece.position.y + dropDistance,
      },
    }
    lockPiece(landedPiece, dropDistance * SCORING.HARD_DROP_BONUS, 'drop')
  }, [lockPiece])

  const startSoftDrop = useCallback(() => {
    const state = gameStateRef.current
    if (softDroppingRef.current || !state.currentPiece || state.gameOver || state.paused) return

    softDroppingRef.current = true
    setIsSoftDropping(true)

    const softDropLoop = () => {
      const current = gameStateRef.current
      if (!softDroppingRef.current || !current.currentPiece || current.gameOver || current.paused) {
        stopSoftDrop()
        return
      }
      const newPosition = { ...current.currentPiece.position, y: current.currentPiece.position.y + 1 }
      if (!isValidPosition(current.board, current.currentPiece, newPosition)) {
        lockPiece(current.currentPiece)
        return
      }
      updateGameState({
        ...current,
        currentPiece: { ...current.currentPiece, position: newPosition },
        score: current.score + SCORING.SOFT_DROP_BONUS,
      })
      lastDropTime.current = Date.now()
      softDropRef.current = setTimeout(softDropLoop, GAME_SPEED.SOFT_DROP)
    }
    softDropLoop()
  }, [lockPiece, stopSoftDrop, updateGameState])

  const dropTick = useEffectEvent(() => {
    const state = gameStateRef.current
    const dropSpeed = getDropSpeed(state.level)
    if (!state.paused && !state.gameOver && state.currentPiece && !softDroppingRef.current) {
      if (Date.now() - lastDropTime.current >= dropSpeed) {
        if (!movePiece('down')) lockPiece(state.currentPiece)
        lastDropTime.current = Date.now()
      }
    }
    return Math.max(1, dropSpeed - (Date.now() - lastDropTime.current))
  })

  // Schedule the next actual drop instead of polling the board at 60 FPS.
  useEffect(() => {
    if (!gameState.isClient || gameState.gameOver || gameState.paused) return

    let timer: ReturnType<typeof setTimeout>
    const run = () => {
      timer = setTimeout(run, dropTick())
    }
    timer = setTimeout(run, getDropSpeed(gameState.level))
    return () => clearTimeout(timer)
  }, [gameState.isClient, gameState.gameOver, gameState.paused, gameState.level])

  const resetGame = useCallback(() => {
    stopSoftDrop()
    updateGameState({
      ...gameStateRef.current,
      board: createEmptyBoard(),
      currentPiece: generateRandomTetromino(),
      nextPiece: generateRandomTetromino(),
      score: 0,
      lines: 0,
      level: 1,
      gameOver: false,
      paused: false,
    })
    lastDropTime.current = Date.now()
  }, [stopSoftDrop, updateGameState])

  const togglePause = useCallback(() => {
    const state = gameStateRef.current
    if (state.gameOver) return
    stopSoftDrop()
    updateGameState({ ...state, paused: !state.paused })
    lastDropTime.current = Date.now()
  }, [stopSoftDrop, updateGameState])

  useEffect(() => {
    const handleVisibility = () => {
      const state = gameStateRef.current
      if (!document.hidden || state.gameOver || state.paused) return
      stopSoftDrop()
      updateGameState({ ...state, paused: true })
    }
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('blur', stopSoftDrop)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('blur', stopSoftDrop)
      if (softDropRef.current !== null) clearTimeout(softDropRef.current)
      softDroppingRef.current = false
    }
  }, [stopSoftDrop, updateGameState])

  return {
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
  }
}
