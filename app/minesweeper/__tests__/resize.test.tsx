import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MinesweeperGame from '../page'
import { StrictMode } from 'react'

vi.mock('@/components/game', () => ({
  GameStage: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  GameHud: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  GameStat: ({ label, value }: { label: string; value: React.ReactNode }) => <div>{label}{value}</div>,
  GameResultOverlay: () => null,
}))

const resizeTo = (width: number, height: number) => {
  window.innerWidth = width
  window.innerHeight = height
  fireEvent(window, new Event('resize'))
}

const gameWindow = window as Window & { render_game_to_text?: () => string }
const snapshot = () => JSON.parse(gameWindow.render_game_to_text?.() ?? '{}')

describe('minesweeper resize preservation', () => {
  const originalWidth = window.innerWidth
  const originalHeight = window.innerHeight

  beforeEach(() => {
    vi.useFakeTimers()
    let seed = 37
    vi.spyOn(Math, 'random').mockImplementation(() => {
      seed = (1664525 * seed + 1013904223) >>> 0
      return seed / 0x100000000
    })
    window.innerWidth = 1024
    window.innerHeight = 768
  })

  afterEach(() => {
    window.innerWidth = originalWidth
    window.innerHeight = originalHeight
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('preserves flags and revealed cells when the viewport changes during play', () => {
    render(<MinesweeperGame />)
    fireEvent.contextMenu(screen.getByLabelText('扫雷格子 1-1'))
    fireEvent.click(screen.getByLabelText('扫雷格子 5-5'))
    act(() => vi.advanceTimersByTime(2000))
    const before = snapshot()

    resizeTo(390, 844)
    expect(snapshot()).toEqual(before)
    expect(screen.getByLabelText('扫雷格子 1-1，已插旗')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(1000))
    expect(snapshot().timer).toBe(3)
  })

  it('counts a flag once when React replays state updaters in StrictMode', () => {
    render(<StrictMode><MinesweeperGame /></StrictMode>)
    const cell = screen.getByLabelText('扫雷格子 1-1')
    fireEvent.contextMenu(cell)
    expect(snapshot().remainingMines).toBe(9)
    fireEvent.contextMenu(cell)
    expect(snapshot().remainingMines).toBe(10)
  })

  it('preserves marks before the first reveal, even when dimensions would change', () => {
    render(<MinesweeperGame />)
    fireEvent.contextMenu(screen.getByLabelText('扫雷格子 1-1'))
    const before = snapshot()
    resizeTo(390, 844)
    expect(snapshot()).toEqual(before)
  })

  it('preserves progress when only the browser height changes', () => {
    render(<MinesweeperGame />)
    fireEvent.contextMenu(screen.getByLabelText('扫雷格子 1-1'))
    const before = snapshot()
    resizeTo(1024, 700)
    expect(snapshot()).toEqual(before)
  })

  it('applies the current viewport dimensions when explicitly starting a new round', () => {
    render(<MinesweeperGame />)
    expect(snapshot().rows).toBe(9)
    resizeTo(390, 844)
    fireEvent.click(screen.getByRole('button', { name: '重新开始' }))
    expect(snapshot().rows).toBe(8)
    expect(snapshot().columns).toBe(8)
  })
})
