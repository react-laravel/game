import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import MazeGame from '../components/MazeGame'
import { useMazeStore } from '../store'

describe('MazeGame controls', () => {
  beforeEach(() => {
    useMazeStore.getState().resetGame()
    useMazeStore.setState({ mazeSize: 15, mazeShape: 'square' })
    useMazeStore.getState().startGame()
  })

  afterEach(() => {
    useMazeStore.setState({ mazeSize: 15, mazeShape: 'square' })
    useMazeStore.getState().resetGame()
  })

  it('shows the size slider and print action', () => {
    render(<MazeGame />)

    expect(screen.getByText('迷宫难度')).toBeInTheDocument()
    expect(screen.getByText('15×15')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '正方形' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'A4 纸' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('slider', { name: '迷宫大小' })).toHaveValue('15')
    expect(screen.getByRole('button', { name: '打印迷宫' })).toBeInTheDocument()
    const printSheet = screen.getByTestId('maze-print-sheet')
    expect(printSheet).toBeInTheDocument()
    expect(within(printSheet).getByLabelText('可打印迷宫 15乘15')).toBeInTheDocument()
  })

  it('updates maze size when the slider moves', () => {
    render(<MazeGame />)

    fireEvent.change(screen.getByRole('slider', { name: '迷宫大小' }), {
      target: { value: '9' },
    })

    expect(useMazeStore.getState().mazeSize).toBe(9)
    expect(screen.getByText('9×9')).toBeInTheDocument()
    expect(useMazeStore.getState().maze).toHaveLength(9)
  })

  it('prints the current maze from the print button', () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    const raf = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(callback => {
        callback(0)
        return 1
      })

    render(<MazeGame />)
    fireEvent.click(screen.getByRole('button', { name: '打印迷宫' }))

    expect(print).toHaveBeenCalledOnce()
    raf.mockRestore()
    print.mockRestore()
  })

  it('keeps start and end marks in the printable sheet', () => {
    render(<MazeGame />)

    act(() => {
      useMazeStore.getState().setMazeSize(7)
    })

    const printSheet = screen.getByTestId('maze-print-sheet')
    expect(within(printSheet).getByText('起')).toBeInTheDocument()
    expect(within(printSheet).getByText('终')).toBeInTheDocument()
    expect(within(printSheet).getByText('迷宫 7 × 7')).toBeInTheDocument()
  })

  it('switches to an A4 rectangle that fills portrait paper', () => {
    render(<MazeGame />)

    fireEvent.click(screen.getByRole('button', { name: 'A4 纸' }))

    expect(useMazeStore.getState().mazeShape).toBe('a4')
    expect(screen.getByText('15×21')).toBeInTheDocument()
    expect(useMazeStore.getState().maze).toHaveLength(21)
    expect(useMazeStore.getState().maze[0]).toHaveLength(15)

    const printSheet = screen.getByTestId('maze-print-sheet')
    expect(within(printSheet).getByText('迷宫 15 × 21')).toBeInTheDocument()
    expect(within(printSheet).getByLabelText('可打印迷宫 15乘21')).toBeInTheDocument()
  })
})
