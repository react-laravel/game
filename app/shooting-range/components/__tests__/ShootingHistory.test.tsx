import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ShootingHistory } from '../ShootingHistory'
import { saveSessionRecord, createSessionRecord } from '../../utils/statsStorage'

const baseConfig = {
  difficulty: 'medium' as const,
  mapId: 'outdoor' as const,
  modeId: 'moving' as const,
}

const baseStats = {
  score: 120,
  hits: 6,
  misses: 2,
  shots: 8,
  accuracy: 75,
  shotsPerMinute: 42,
  bestStreak: 3,
  avgReactionMs: null,
}

describe('ShootingHistory', () => {
  beforeEach(() => {
    localStorage.clear()
    saveSessionRecord(createSessionRecord(baseConfig, baseStats, 60))
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('highlights the latest session row when opened from results', () => {
    render(<ShootingHistory highlightLatestSession onClose={() => {}} />)

    expect(screen.getByTestId('highlighted-session-row')).toBeInTheDocument()
    expect(screen.getByTestId('highlighted-session-row')).toHaveClass('shooting-session-highlight')
  })

  it('does not highlight when opened from setup', () => {
    render(<ShootingHistory onClose={() => {}} />)

    expect(screen.queryByTestId('highlighted-session-row')).not.toBeInTheDocument()
  })

  it('shows encouragement when only a few sessions exist', () => {
    render(<ShootingHistory onClose={() => {}} />)

    expect(screen.getByText(/继续加油/)).toBeInTheDocument()
  })

  it('shows session grade badges in the recent table', () => {
    render(<ShootingHistory onClose={() => {}} />)

    expect(screen.getByTitle('评级 B')).toBeInTheDocument()
  })
})
