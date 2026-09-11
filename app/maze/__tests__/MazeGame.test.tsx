import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import MazeGame from '../components/MazeGame'
import { useMazeStore } from '../store'

describe('MazeGame controls', () => {
  beforeEach(() => {
    useMazeStore.getState().resetGame()
    useMazeStore.setState({ mazeSize: 15 })
    useMazeStore.getState().startGame()
  })

  afterEach(() => {
    useMazeStore.getState().resetGame()
  })

  it('shows the size slider and print action', () => {
    render(<MazeGame />)

    expect(screen.getByText('迷宫难度')).toBeInTheDocument()
    expect(screen.getByText('15×15')).toBeInTheDocument()
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
})
