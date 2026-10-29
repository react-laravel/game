'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { createBoard, isSolved, isValidMove } from '../utils/board'

// 内联组件 - 计时器
function Timer({ startTime, completedAt }: { startTime: Date; completedAt: Date | null }) {
  const [time, setTime] = useState(0)

  useEffect(() => {
    const updateTime = () => {
      const now = completedAt ?? new Date()
      setTime(Math.floor((now.getTime() - startTime.getTime()) / 1000))
    }
    updateTime()
    if (completedAt) return
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [startTime, completedAt])

  const minutes = Math.floor(time / 60)
  const seconds = time % 60

  return (
    <div className="text-center font-mono">
      <div className="text-sm text-gray-500">用时</div>
      <div className="font-semibold">
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </div>
    </div>
  )
}

// 内联组件 - 移动次数
function MoveCounter({ moves }: { moves: number }) {
  return (
    <div className="text-center">
      <div className="text-sm text-gray-500">移动次数</div>
      <div className="font-semibold">{moves}</div>
    </div>
  )
}

// 主游戏组件
interface PuzzleProps {
  size: 3 | 4 | 5
  onComplete: () => void
}

export default function SlidingPuzzle({ size, onComplete }: PuzzleProps) {
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 游戏状态
  const [board, setBoard] = useState(() => createBoard(size))
  const [moves, setMoves] = useState(0)
  const [startTime] = useState(() => new Date())
  const [isComplete, setIsComplete] = useState(false)
  const [completedAt, setCompletedAt] = useState<Date | null>(null)

  // 移动方块
  const moveTile = useCallback(
    (index: number) => {
      if (isComplete) return

      const emptyIndex = board.indexOf(0)

      if (!isValidMove(index, board, size)) return

      // 移动方块
      const newBoard = [...board]
      ;[newBoard[index], newBoard[emptyIndex]] = [newBoard[emptyIndex], newBoard[index]]

      setBoard(newBoard)
      setMoves(prev => prev + 1)

      // 检查是否完成
      const completed = isSolved(newBoard)

      if (completed) {
        setIsComplete(true)
        setCompletedAt(new Date())
        if (completeTimerRef.current) {
          clearTimeout(completeTimerRef.current)
        }
        completeTimerRef.current = setTimeout(() => {
          onComplete()
          completeTimerRef.current = null
        }, 220)
      }
    },
    [board, isComplete, size, onComplete]
  )

  useEffect(() => {
    return () => {
      if (completeTimerRef.current) {
        clearTimeout(completeTimerRef.current)
      }
    }
  }, [])

  // 处理键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target instanceof Element ? e.target : null
      if (
        isComplete || e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey ||
        (target?.closest(
          'input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"]), [role="dialog"], [role="alertdialog"], [role="slider"], [role="menu"], [role="listbox"], [role="combobox"]'
        ) && !target.closest('[data-puzzle-tile]'))
      ) return

      if (!e.key.startsWith('Arrow')) return
      e.preventDefault()

      const emptyIndex = board.indexOf(0)

      let targetIndex = -1
      switch (e.key) {
        case 'ArrowUp':
          if (emptyIndex < board.length - size) {
            targetIndex = emptyIndex + size
          }
          break
        case 'ArrowDown':
          if (emptyIndex >= size) {
            targetIndex = emptyIndex - size
          }
          break
        case 'ArrowLeft':
          if (emptyIndex % size < size - 1) {
            targetIndex = emptyIndex + 1
          }
          break
        case 'ArrowRight':
          if (emptyIndex % size > 0) {
            targetIndex = emptyIndex - 1
          }
          break
      }

      if (targetIndex !== -1) {
        moveTile(targetIndex)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [board, isComplete, size, moveTile])

  return (
    <div className="w-full p-4">
      <div className="mb-4 flex items-center justify-between">
        <MoveCounter moves={moves} />
        <Timer startTime={startTime} completedAt={completedAt} />
      </div>

      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          aspectRatio: '1/1',
        }}
      >
        {board.map((value, index) => (
          <button
            type="button"
            data-puzzle-tile
            key={index}
            onClick={() => moveTile(index)}
            aria-label={value === 0 ? '空位' : `移动方块 ${value}`}
            disabled={isComplete || value === 0 || !isValidMove(index, board, size)}
            className={`flex items-center justify-center rounded-md transition-all select-none ${
              value === 0
                ? 'border-muted border border-dashed bg-transparent'
                : 'bg-primary text-primary-foreground enabled:hover:bg-primary/80 enabled:cursor-pointer shadow enabled:active:scale-95 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
            } ${isComplete ? 'border-green-400' : ''} `}
            style={{
              aspectRatio: '1/1',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
              fontSize: size > 3 ? '1rem' : '1.25rem',
              fontWeight: 'bold',
            }}
          >
            {value !== 0 && value}
          </button>
        ))}
      </div>
    </div>
  )
}
