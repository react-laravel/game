import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TetrisGame from '../page'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

function readGame() {
  const gameWindow = window as Window & { render_game_to_text: () => string }
  return JSON.parse(gameWindow.render_game_to_text()) as {
    mode: string
    score: number
    activePiece: { position: { x: number; y: number } }
    settledRows: string[]
  }
}

describe('Tetris gameplay keyboard focus', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    window.localStorage.clear()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('accepts P and movement after clicking Pause, leaving Space for button activation', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<TetrisGame />)
    await user.click(screen.getByRole('button', { name: 'PAUSE' }))
    expect(readGame().mode).toBe('paused')
    await user.keyboard('p')
    expect(readGame().mode).toBe('playing')
    const initialX = readGame().activePiece.position.x
    await user.keyboard('{ArrowLeft}')
    expect(readGame().activePiece.position.x).toBe(initialX - 1)
    await user.keyboard(' ')
    expect(readGame().mode).toBe('paused')
    expect(readGame().settledRows.every(row => !row.includes('#'))).toBe(true)
    act(() => vi.advanceTimersByTime(2000))
    expect(readGame().activePiece.position.y).toBe(0)
  })

  it('accepts movement after clicking the sound toggle', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<TetrisGame />)
    await user.click(screen.getByRole('button', { name: '关闭音效' }))
    const initialX = readGame().activePiece.position.x
    await user.keyboard('a')
    expect(readGame().activePiece.position.x).toBe(initialX - 1)
  })
})
