import type { PuzzlePiece, PuzzleSlot } from '../../utils/puzzleUtils'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import JigsawPuzzle from '../JigsawPuzzle'

const { updateStats } = vi.hoisted(() => ({ updateStats: vi.fn() }))
vi.mock('../../hooks/useJigsawStats', () => ({
  useJigsawStats: () => ({
    stats: { gamesCompleted: 0, bestTime: null, totalPiecesPlaced: 0 }, updateStats,
  }),
}))
vi.mock('../../utils/imageUtils', async importOriginal => ({
  ...await importOriginal<typeof import('../../utils/imageUtils')>(),
  loadImage: () => Promise.resolve({ width: 400, height: 400 }),
}))
vi.mock('../puzzle', () => ({
  GameInfoCard: ({ onReset }: { onReset: () => void }) => <button onClick={onReset}>重新开始</button>,
  FloatingReference: () => null,
  GameStats: () => null,
  CompletionMessage: () => <div role="status">拼图完成</div>,
  PuzzleBoard: ({ slots, onSlotClick }: { slots: PuzzleSlot[]; onSlotClick: (id: number) => void }) => (
    <div>{slots.map(slot => <button key={slot.id} onClick={() => onSlotClick(slot.id)}>槽位 {slot.id}</button>)}</div>
  ),
  PieceSelectionArea: ({ pieces, onPieceClick }: { pieces: PuzzlePiece[]; onPieceClick: (id: number) => void }) => (
    <div>{pieces.filter(piece => !piece.isPlaced).map(piece => <button key={piece.id} onClick={() => onPieceClick(piece.id)}>拼图块 {piece.id}</button>)}</div>
  ),
}))

describe('JigsawPuzzle completion statistics', () => {
  it('reports a completed round once, then allows a new round to complete', async () => {
    const onComplete = vi.fn()
    const { rerender } = render(<JigsawPuzzle imageUrl="/example.jpg" size={2} onComplete={onComplete} />)
    await screen.findByRole('button', { name: '拼图块 0' })

    for (let id = 0; id < 4; id++) {
      fireEvent.click(screen.getByRole('button', { name: `拼图块 ${id}` }))
      fireEvent.click(screen.getByRole('button', { name: `槽位 ${id}` }))
    }
    expect(screen.getByRole('status')).toHaveTextContent('拼图完成')
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(updateStats).toHaveBeenCalledTimes(1)
    expect(updateStats).toHaveBeenCalledWith(expect.any(Number), 4)

    rerender(<JigsawPuzzle imageUrl="/example.jpg" size={2} onComplete={() => onComplete()} />)
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(updateStats).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: '重新开始' }))
    for (let id = 0; id < 4; id++) {
      fireEvent.click(screen.getByRole('button', { name: `拼图块 ${id}` }))
      fireEvent.click(screen.getByRole('button', { name: `槽位 ${id}` }))
    }
    expect(onComplete).toHaveBeenCalledTimes(2)
    expect(updateStats).toHaveBeenCalledTimes(2)
  })
})
