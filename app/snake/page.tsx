'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { GameHud, GameResultOverlay, GameStage, GameStat } from '@/components/game'
import { SnakeBoard } from './components/SnakeBoard'
import { useSnakeGameStore } from './store'
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

// 相反方向映射
const OPPOSITE_DIRECTIONS = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
} as const

// 键盘映射
const KEY_DIRECTION_MAP = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
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
  const touchStartRef = useRef({ x: 0, y: 0 })

  // 使用 ref 存储最新的状态值，避免闭包问题
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

  // 游戏主循环
  const gameLoop = useCallback(() => {
    setSnake(currentSnake => {
      if (gameOverRef.current || !gameStartedRef.current) return currentSnake

      // 处理方向队列
      if (directionQueueRef.current.length > 0) {
        const nextDirection = directionQueueRef.current.shift()!
        // 防止反向移动
        if (OPPOSITE_DIRECTIONS[directionRef.current] !== nextDirection) {
          directionRef.current = nextDirection
          setDirection(nextDirection)
        }
      }

      const newSnake = [...currentSnake]
      const head = { ...newSnake[0] }
      const movement = DIRECTION_MAP[directionRef.current]

      head.x += movement.x
      head.y += movement.y

      // 检查碰撞
      if (checkCollision(head, newSnake)) {
        if (!gameOverRef.current) {
          setGameOver(true)
          setGameStarted(false)
          // 使用 setTimeout 将状态更新延迟到下一个事件循环
          setTimeout(() => {
            incrementGamesPlayed()
          }, 0)
          toast.error('游戏结束！')
        }
        return currentSnake
      }

      newSnake.unshift(head)

      // 检查是否吃到食物
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        setScore(prev => prev + 10)
        // 使用 setTimeout 将状态更新延迟到下一个事件循环
        setTimeout(() => {
          addFoodEaten(1)
        }, 0)
        setFood(generateFood(newSnake))
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }, [checkCollision, generateFood, addFoodEaten, incrementGamesPlayed])

  // 方向控制
  const changeDirection = useCallback((newDirection: Direction) => {
    if (!gameStartedRef.current || gameOverRef.current) return

    // 防止反向移动和重复方向
    if (
      OPPOSITE_DIRECTIONS[directionRef.current] === newDirection ||
      directionRef.current === newDirection
    ) {
      return
    }

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
      if (e.key in KEY_DIRECTION_MAP) {
        e.preventDefault()
        changeDirection(KEY_DIRECTION_MAP[e.key as keyof typeof KEY_DIRECTION_MAP] as Direction)
      } else if (e.key === ' ') {
        e.preventDefault()
        if (gameOverRef.current) {
          resetGameRef.current()
        } else {
          setGameStarted(prev => !prev)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [changeDirection])

  // 触摸控制
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!gameStartedRef.current || gameOverRef.current) return

      const { x: startX, y: startY } = touchStartRef.current
      if (!startX || !startY) return

      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY

      const diffX = startX - endX
      const diffY = startY - endY

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > MIN_SWIPE_DISTANCE) {
          changeDirection(diffX > 0 ? 'LEFT' : 'RIGHT')
        }
      } else {
        if (Math.abs(diffY) > MIN_SWIPE_DISTANCE) {
          changeDirection(diffY > 0 ? 'UP' : 'DOWN')
        }
      }

      touchStartRef.current = { x: 0, y: 0 }
    }

    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [changeDirection])

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
    directionRef.current = 'RIGHT'
    foodRef.current = INITIAL_FOOD
    gameOverRef.current = false
    gameStartedRef.current = false
    directionQueueRef.current = []
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
      setGameStarted(prev => !prev)
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
