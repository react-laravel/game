'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { GameHud, GameResultOverlay, GameStage, GameStat } from '@/components/game'
import { SnakeBoard } from './components/SnakeBoard'
import { useSnakeGameStore } from './store'
import {
  canChangeToDirection,
  directionFromKey,
  OPPOSITE_DIRECTIONS,
} from './utils/controls'
import type { Direction, Position } from './utils/snakePath'

const SNAKE_RULES = [
  '控制蛇移动吃食物',
  '每个食物+10分',
  '不能撞墙或撞自己',
  '使用方向键或滑动控制',
  '按空格键暂停/开始游戏',
  '游戏结束后可以重新开始',
]

const BOARD_SIZE = 20
const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
]
const INITIAL_FOOD = { x: 15, y: 15 }
const GAME_SPEED = 150
const MIN_SWIPE_DISTANCE = 30

// 方向映射
const DIRECTION_MAP = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
} as const

export default function SnakeGame() {
  const { bestScore, setBestScore, incrementGamesPlayed, addFoodEaten } = useSnakeGameStore()

  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE)
  const [food, setFood] = useState<Position>(INITIAL_FOOD)
  const [direction, setDirection] = useState<Direction>('RIGHT')
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartRef = useRef<{ x: number; y: number; id: number } | null>(null)

  // 使用 ref 存储最新的状态值，避免闭包问题
  const snakeRef = useRef<Position[]>(INITIAL_SNAKE)
  const directionRef = useRef<Direction>('RIGHT')
  const foodRef = useRef<Position>(INITIAL_FOOD)
  const gameOverRef = useRef(false)
  const gameStartedRef = useRef(false)
  const directionQueueRef = useRef<Direction[]>([])
  const resetGameRef = useRef<() => void>(() => {})

  // 同步 ref 值
  useEffect(() => {
    directionRef.current = direction
  }, [direction])

  useEffect(() => {
    foodRef.current = food
  }, [food])

  useEffect(() => {
    gameOverRef.current = gameOver
  }, [gameOver])

  useEffect(() => {
    gameStartedRef.current = gameStarted
  }, [gameStarted])

  // 生成随机食物位置
  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      }
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [])

  // 检查碰撞
  const checkCollision = useCallback((head: Position, body: Position[]): boolean => {
    // 撞墙
    if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
      return true
    }
    // 撞自己
    return body.some(segment => segment.x === head.x && segment.y === head.y)
  }, [])

  // Tick effects happen outside React updaters so StrictMode cannot replay them.
  const gameLoop = useCallback(() => {
    if (gameOverRef.current || !gameStartedRef.current) return
    const currentSnake = snakeRef.current

    const nextDirection = directionQueueRef.current.shift()
    if (nextDirection && OPPOSITE_DIRECTIONS[directionRef.current] !== nextDirection) {
      directionRef.current = nextDirection
      setDirection(nextDirection)
    }

    const movement = DIRECTION_MAP[directionRef.current]
    const head = {
      x: currentSnake[0].x + movement.x,
      y: currentSnake[0].y + movement.y,
    }
    const willGrow = head.x === foodRef.current.x && head.y === foodRef.current.y
    // The tail vacates its cell in the same tick unless the snake is growing.
    const collisionBody = willGrow ? currentSnake : currentSnake.slice(0, -1)
    if (checkCollision(head, collisionBody)) {
      gameOverRef.current = true
      gameStartedRef.current = false
      directionQueueRef.current = []
      setGameOver(true)
      setGameStarted(false)
      incrementGamesPlayed()
      toast.error('游戏结束！')
      return
    }

    const newSnake = [head, ...currentSnake]
    if (willGrow) {
      setScore(prev => prev + 10)
      addFoodEaten(1)
      const newFood = generateFood(newSnake)
      foodRef.current = newFood
      setFood(newFood)
    } else {
      newSnake.pop()
    }
    snakeRef.current = newSnake
    setSnake(newSnake)
  }, [checkCollision, generateFood, addFoodEaten, incrementGamesPlayed])

  const startGameWithDirection = useCallback(
    (newDirection: Direction) => {
      if (gameOverRef.current) {
        resetGameRef.current()
      }

      gameStartedRef.current = true
      setGameStarted(true)

      if (canChangeToDirection(directionRef.current, newDirection)) {
        directionRef.current = newDirection
        setDirection(newDirection)
      }

      directionQueueRef.current = []
    },
    []
  )

  // 方向控制
  const changeDirection = useCallback((newDirection: Direction) => {
    if (!gameStartedRef.current || gameOverRef.current) return

    const queuedDirection = directionQueueRef.current.at(-1) ?? directionRef.current
    if (!canChangeToDirection(queuedDirection, newDirection)) return

    // 将方向变化加入队列，避免快速按键时丢失
    if (directionQueueRef.current.length < 2) {
      directionQueueRef.current.push(newDirection)
    }
  }, [])

  // 游戏循环
  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameLoopRef.current = setInterval(gameLoop, GAME_SPEED)
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [gameLoop, gameStarted, gameOver])

  // 键盘控制
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.defaultPrevented || e.isComposing || e.ctrlKey || e.metaKey || e.altKey ||
        (e.target instanceof Element && e.target.closest(
          'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="dialog"], [role="alertdialog"], [role="slider"], [role="menu"], [role="listbox"], [role="combobox"]'
        )) ||
        ((e.key === ' ' || e.key === 'Enter') && e.target instanceof Element &&
          e.target.closest('button, a, [role="button"]'))
      ) return

      const nextDirection = directionFromKey(e.key)
      if (nextDirection) {
        e.preventDefault()

        if (e.repeat) return

        if (!gameStartedRef.current || gameOverRef.current) {
          startGameWithDirection(nextDirection)
          return
        }

        changeDirection(nextDirection)
      } else if (e.key === ' ') {
        e.preventDefault()
        if (e.repeat) return
        if (gameOverRef.current) {
          resetGameRef.current()
        } else {
          gameStartedRef.current = !gameStartedRef.current
          setGameStarted(gameStartedRef.current)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [changeDirection, startGameWithDirection])

  // 触摸控制
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = null
      if (
        e.touches.length !== 1 || !(e.target instanceof Element) ||
        !e.target.closest('[data-snake-board]')
      ) return
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        id: e.touches[0].identifier,
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const start = touchStartRef.current
      touchStartRef.current = null
      if (!start || e.changedTouches.length !== 1 || e.touches.length !== 0) return
      if (e.changedTouches[0].identifier !== start.id) return

      const { x: startX, y: startY } = start

      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY

      const diffX = startX - endX
      const diffY = startY - endY

      if (Math.max(Math.abs(diffX), Math.abs(diffY)) <= MIN_SWIPE_DISTANCE) return
      const nextDirection = Math.abs(diffX) > Math.abs(diffY)
        ? diffX > 0 ? 'LEFT' : 'RIGHT'
        : diffY > 0 ? 'UP' : 'DOWN'
      if (!gameStartedRef.current || gameOverRef.current) startGameWithDirection(nextDirection)
      else changeDirection(nextDirection)
    }
    const cancelTouch = () => { touchStartRef.current = null }

    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchend', handleTouchEnd)
    document.addEventListener('touchcancel', cancelTouch)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
      document.removeEventListener('touchcancel', cancelTouch)
    }
  }, [changeDirection, startGameWithDirection])

  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden || !gameStartedRef.current) return
      gameStartedRef.current = false
      directionQueueRef.current = []
      touchStartRef.current = null
      setGameStarted(false)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // 更新最高分
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score)
    }
  }, [score, bestScore, setBestScore])

  // 重置游戏
  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE)
    setFood(INITIAL_FOOD)
    setDirection('RIGHT')
    setGameOver(false)
    setGameStarted(false)
    setScore(0)

    // 重置 ref 值
    snakeRef.current = INITIAL_SNAKE
    directionRef.current = 'RIGHT'
    foodRef.current = INITIAL_FOOD
    gameOverRef.current = false
    gameStartedRef.current = false
    directionQueueRef.current = []
    touchStartRef.current = null
  }, [])

  // 同步 resetGame ref
  useEffect(() => {
    resetGameRef.current = resetGame
  }, [resetGame])

  // 开始/暂停游戏
  const toggleGame = useCallback(() => {
    if (gameOver) {
      resetGame()
    } else {
      gameStartedRef.current = !gameStartedRef.current
      setGameStarted(gameStartedRef.current)
    }
  }, [gameOver, resetGame])

  const renderControlButton = useCallback(
    (direction: Direction, symbol: string, className?: string) => (
      <Button
        variant="outline"
        size="sm"
        onClick={() => changeDirection(direction)}
        disabled={!gameStarted || gameOver}
        className={`h-12 w-12 rounded-xl border-white/15 bg-white/5 text-lg font-black text-white hover:bg-white/10 ${className || ''}`}
      >
        {symbol}
      </Button>
    ),
    [changeDirection, gameStarted, gameOver]
  )

  return (
    <GameStage
      title="贪吃蛇"
      rules={SNAKE_RULES}
      fill
      className="bg-zinc-950 text-white"
      onContextMenu={e => e.preventDefault()}
    >
      <div className="mx-auto flex w-full max-w-lg min-h-0 flex-1 flex-col">
        <GameHud className="mb-3 border-white/10 bg-white/5 text-white [&_.uppercase]:text-white/50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-1 justify-around">
              <GameStat label="当前分数" value={score} />
              <GameStat label="最高分" value={bestScore} />
            </div>
            <div className="flex shrink-0 gap-2">
              <Button onClick={toggleGame} size="sm" className="bg-amber-400 font-bold text-zinc-950 hover:bg-amber-300">
                {gameOver ? '重新开始' : gameStarted ? '暂停' : '开始'}
              </Button>
              <Button
                onClick={resetGame}
                variant="outline"
                size="sm"
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                重置
              </Button>
            </div>
          </div>
        </GameHud>

        <div className="relative mx-auto flex min-h-0 w-full max-w-[min(100%,calc(100dvh-15rem))] flex-1 items-center">
          <div
            className="w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            data-snake-board
            style={{ touchAction: 'none' }}
          >
            <SnakeBoard snake={snake} food={food} direction={direction} boardSize={BOARD_SIZE} />
          </div>
          <GameResultOverlay open={gameOver} title="游戏结束">
            <p className="mt-3 text-sm text-white/55">本局分数 {score}</p>
            <Button
              className="mt-6 w-full bg-amber-400 py-5 font-bold text-zinc-950 hover:bg-amber-300"
              onClick={resetGame}
            >
              重新开始
            </Button>
          </GameResultOverlay>
        </div>

        <div className="mt-3 shrink-0 pb-1">
          <div className="mb-2 flex justify-center">{renderControlButton('UP', '↑')}</div>
          <div className="mb-2 flex justify-center space-x-4">
            {renderControlButton('LEFT', '←')}
            {renderControlButton('RIGHT', '→')}
          </div>
          <div className="flex justify-center">{renderControlButton('DOWN', '↓')}</div>
        </div>
      </div>
    </GameStage>
  )
}
