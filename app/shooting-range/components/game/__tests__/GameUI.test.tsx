import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GameUI } from '../GameUI'

const baseStats = {
  score: 0,
  hits: 0,
  misses: 0,
  shots: 0,
  accuracy: 100,
  shotsPerMinute: 0,
  bestStreak: 0,
  avgReactionMs: null,
  zoneHits: { head: 0, body: 0, limb: 0 },
}

const baseProps = {
  stats: baseStats,
  timeLeft: 60,
  durationSeconds: 60,
  displayFps: 60,
  gameOver: false,
  modeId: 'moving' as const,
  drillLabel: '动态追踪',
  grade: null,
  comparison: null,
  onRestart: () => {},
}

describe('GameUI', () => {
  it('should render without crashing', () => {
    const result = GameUI(baseProps)
    expect(result).toBeDefined()
  })

  it('should display score, fps, and richer stats', () => {
    const result = GameUI({
      ...baseProps,
      stats: {
        ...baseStats,
        score: 150,
        hits: 15,
        misses: 2,
        shots: 17,
        accuracy: 88,
        shotsPerMinute: 42,
        bestStreak: 5,
        avgReactionMs: 280,
      },
      timeLeft: 45.5,
      displayFps: 118,
      modeId: 'flick',
    })
    expect(result).toBeDefined()
  })

  it('shows the first-shot tutorial tip while training is active', () => {
    render(<GameUI {...baseProps} showTutorialTip />)
    expect(screen.getByText(/新手提示/)).toBeInTheDocument()
    expect(screen.getByText(/命中后此提示会自动淡出/)).toBeInTheDocument()
  })

  it('should show game over summary with grade and comparison', () => {
    const onRestart = vi.fn()
    const result = GameUI({
      ...baseProps,
      stats: {
        ...baseStats,
        score: 999,
        hits: 80,
        misses: 10,
        shots: 90,
        accuracy: 89,
        shotsPerMinute: 55,
        bestStreak: 8,
        avgReactionMs: 240,
      },
      timeLeft: 0,
      gameOver: true,
      grade: 'A',
      comparison: {
        previous: null,
        isNewBest: true,
        scoreDelta: null,
        accuracyDelta: null,
        reactionDelta: null,
      },
      onRestart,
    })
    expect(result).toBeDefined()
  })
})
