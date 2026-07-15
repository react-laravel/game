import { useState, useEffect, useCallback, useRef } from 'react'
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

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const lastDropTime = useRef<number>(0)
  const softDropRef = useRef<NodeJS.Timeout | null>(null)
  const [isSoftDropping, setIsSoftDropping] = useState(false)

  // 客户端挂载后初始化游戏
  // 必要场景：随机方块只能在客户端生成（保证 SSR 水合一致），而随机数不允许出现在渲染期

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 客户端随机初始化，无法移入渲染期
    setGameState(prev => ({
      ...prev,
      isClient: true,
      currentPiece: generateRandomTetromino(),
      nextPiece: generateRandomTetromino(),
    }))
    lastDropTime.current = Date.now()
  }, [])

  // 确保 nextPiece 始终有值（仅在客户端）

  useEffect(() => {
    if (gameState.isClient && !gameState.nextPiece) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 客户端随机生成方块，无法移入渲染期
      setGameState(prev => ({
        ...prev,
        nextPiece: generateRandomTetromino(),
      }))
    }
  }, [gameState.isClient, gameState.nextPiece])

  // 移动方块
  const movePiece = useCallback(
    (direction: 'left' | 'right' | 'down'): boolean => {
      if (!gameState.currentPiece || gameState.gameOver || gameState.paused) return false

      const newPosition: Position = { ...gameState.currentPiece.position }

      switch (direction) {
        case 'left':
          newPosition.x -= 1
          break
        case 'right':
          newPosition.x += 1
          break
        case 'down':
          newPosition.y += 1
          break
      }

      if (isValidPosition(gameState.board, gameState.currentPiece, newPosition)) {
        setGameState(prev => ({
          ...prev,
          currentPiece: prev.currentPiece ? { ...prev.currentPiece, position: newPosition } : null,
        }))
        if (direction === 'left' || direction === 'right') playSound('move')
        return true
      }

      return false
    },
    [gameState.currentPiece, gameState.board, gameState.gameOver, gameState.paused, playSound]
  )

  // 旋转方块
  const rotatePiece = useCallback(() => {
    if (!gameState.currentPiece || gameState.gameOver || gameState.paused) return

    const rotated = rotateTetromino(gameState.currentPiece)

    if (isValidPosition(gameState.board, rotated, rotated.position)) {
      setGameState(prev => ({
        ...prev,
        currentPiece: rotated,
      }))
      playSound('rotate')
    }
  }, [gameState.currentPiece, gameState.board, gameState.gameOver, gameState.paused, playSound])

  const lockPiece = useCallback(
    (landedPiece: Tetromino, scoreBonus = 0, landingSound: TetrisSound = 'lock') => {
      const newBoard = placeTetromino(gameState.board, landedPiece)
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard)
      const newLines = gameState.lines + linesCleared
      const newLevel = calculateLevel(newLines)
      const newScore =
        gameState.score + scoreBonus + calculateScore(linesCleared, gameState.level)
      const newPiece = gameState.nextPiece || generateRandomTetromino()
      const nextNewPiece = generateRandomTetromino()
      const gameOver = !isValidPosition(clearedBoard, newPiece, newPiece.position)

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

      setGameState(prev => ({
        ...prev,
        board: clearedBoard,
        currentPiece: gameOver ? null : newPiece,
        nextPiece: gameOver ? prev.nextPiece : nextNewPiece,
        score: newScore,
        lines: newLines,
        level: newLevel,
        gameOver,
      }))
      lastDropTime.current = Date.now()
    },
    [
      addLinesCleared,
      bestScore,
      gameState.board,
      gameState.level,
      gameState.lines,
      gameState.nextPiece,
      gameState.score,
      incrementGamesPlayed,
      playSound,
      setBestScore,
    ]
  )

  // 硬降
  const hardDrop = useCallback(() => {
    if (!gameState.currentPiece || gameState.gameOver || gameState.paused) return

    const dropDistance = calculateHardDropDistance(gameState.board, gameState.currentPiece)

    const landedPiece = {
      ...gameState.currentPiece,
      position: {
        ...gameState.currentPiece.position,
        y: gameState.currentPiece.position.y + dropDistance,
      },
    }

    lockPiece(landedPiece, dropDistance * SCORING.HARD_DROP_BONUS, 'drop')
  }, [gameState.currentPiece, gameState.board, gameState.gameOver, gameState.paused, lockPiece])

  // 开始软降
  const startSoftDrop = useCallback(() => {
    if (isSoftDropping || gameState.gameOver || gameState.paused) return

    setIsSoftDropping(true)

    const softDropLoop = () => {
      if (!gameState.currentPiece || gameState.gameOver || gameState.paused) return

      const newPosition = { ...gameState.currentPiece.position }
      newPosition.y += 1

      if (isValidPosition(gameState.board, gameState.currentPiece, newPosition)) {
        setGameState(prev => ({
          ...prev,
          currentPiece: prev.currentPiece ? { ...prev.currentPiece, position: newPosition } : null,
          score: prev.score + SCORING.SOFT_DROP_BONUS,
        }))
        softDropRef.current = setTimeout(softDropLoop, GAME_SPEED.SOFT_DROP)
      } else {
        setIsSoftDropping(false)
      }
    }

    softDropLoop()
  }, [
    isSoftDropping,
    gameState.gameOver,
    gameState.paused,
    gameState.currentPiece,
    gameState.board,
  ])

  // 停止软降
  const stopSoftDrop = useCallback(() => {
    if (softDropRef.current) {
      clearTimeout(softDropRef.current)
      softDropRef.current = null
    }
    setIsSoftDropping(false)
  }, [])

  // 游戏循环
  useEffect(() => {
    if (!gameState.isClient || gameState.gameOver || gameState.paused || !gameState.currentPiece)
      return

    const dropSpeed = getDropSpeed(gameState.level)

    const gameLoop = () => {
      const now = Date.now()
      if (now - lastDropTime.current >= dropSpeed) {
        if (!movePiece('down')) {
          lockPiece(gameState.currentPiece!)
        }
        lastDropTime.current = now
      }
    }

    gameLoopRef.current = setInterval(gameLoop, GAME_SPEED.NORMAL_DROP)

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [gameState, movePiece, lockPiece])

  // 重置游戏
  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      board: createEmptyBoard(),
      currentPiece: generateRandomTetromino(),
      nextPiece: generateRandomTetromino(),
      score: 0,
      lines: 0,
      level: 1,
      gameOver: false,
      paused: false,
    }))
    setIsSoftDropping(false)
    if (softDropRef.current) {
      clearTimeout(softDropRef.current)
      softDropRef.current = null
    }
    lastDropTime.current = Date.now()
  }, [])

  // 暂停/继续游戏
  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      paused: !prev.paused,
    }))
  }, [])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (softDropRef.current) {
        clearTimeout(softDropRef.current)
      }
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [])

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
