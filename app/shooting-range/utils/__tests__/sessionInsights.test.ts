import { describe, expect, it } from 'vitest'
import type { SessionRecord, SessionStats } from '../../types'
import {
  compareToPersonalBest,
  computeSessionGrade,
  getPersonalBest,
  summarizeByMode,
} from '../sessionInsights'

const baseStats: SessionStats = {
  score: 500,
  hits: 50,
  misses: 5,
  shots: 55,
  accuracy: 93,
  shotsPerMinute: 48,
  bestStreak: 9,
  avgReactionMs: 310,
}

function makeRecord(overrides: Partial<SessionRecord>): SessionRecord {
  return {
    id: '1',
    timestamp: 1,
    date: '2026-09-12',
    difficulty: 'medium',
    mapId: 'indoor',
    modeId: 'flick',
    durationSeconds: 60,
    ...baseStats,
    ...overrides,
  }
}

describe('sessionInsights', () => {
  it('grades high-accuracy flick runs highly', () => {
    expect(computeSessionGrade(baseStats, 'flick')).toBe('S')
  })

  it('finds personal best per mode', () => {
    const history = [
      makeRecord({ id: 'a', modeId: 'flick', score: 300 }),
      makeRecord({ id: 'b', modeId: 'flick', score: 600 }),
      makeRecord({ id: 'c', modeId: 'moving', score: 400 }),
    ]
    expect(getPersonalBest(history, 'flick')?.score).toBe(600)
    expect(getPersonalBest(history, 'moving')?.score).toBe(400)
  })

  it('compares against previous best excluding latest', () => {
    const history = [
      makeRecord({ id: 'latest', score: 550 }),
      makeRecord({ id: 'prev-best', score: 500 }),
      makeRecord({ id: 'older', score: 300 }),
    ]
    const comparison = compareToPersonalBest(
      { ...baseStats, score: 550 },
      'flick',
      history
    )
    expect(comparison.isNewBest).toBe(true)
    expect(comparison.scoreDelta).toBe(50)
  })

  it('summarizes per-mode stats', () => {
    const history = [
      makeRecord({ modeId: 'flick', score: 400, accuracy: 80 }),
      makeRecord({ modeId: 'flick', score: 600, accuracy: 90 }),
    ]
    const summaries = summarizeByMode(history)
    const flick = summaries.find(s => s.modeId === 'flick')
    expect(flick?.sessions).toBe(2)
    expect(flick?.bestScore).toBe(600)
    expect(flick?.avgAccuracy).toBe(85)
  })
})
