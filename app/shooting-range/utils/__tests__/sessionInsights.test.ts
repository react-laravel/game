import { describe, expect, it } from 'vitest'
import type { SessionRecord, SessionStats } from '../../types'
import {
  buildAccuracyBreakdown,
  buildPerformanceHighlights,
  compareToPersonalBest,
  computeSessionGrade,
  getPersonalBest,
  gradeLabel,
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
    expect(gradeLabel('S')).toBe('精英表现')
  })

  it('returns D when no shots were fired', () => {
    expect(computeSessionGrade({ ...baseStats, shots: 0, hits: 0, accuracy: 100 }, 'flick')).toBe(
      'D'
    )
  })

  it('builds accuracy breakdown with hit/miss split and coaching tip', () => {
    const breakdown = buildAccuracyBreakdown(baseStats)
    expect(breakdown.summary).toBe('命中 50 · 未中 5')
    expect(breakdown.hitPercent).toBe(91)
    expect(breakdown.missPercent).toBe(9)
    expect(breakdown.tip).toContain('精准度出色')

    const empty = buildAccuracyBreakdown({ ...baseStats, shots: 0, hits: 0, misses: 0 })
    expect(empty.summary).toBe('本场未开火')
    expect(empty.tip).toContain('下一局')
  })

  it('builds mode-specific performance highlights', () => {
    const flickHighlights = buildPerformanceHighlights(baseStats, 'flick')
    expect(flickHighlights).toHaveLength(2)
    expect(flickHighlights[1]?.label).toBe('反应速度')

    const movingHighlights = buildPerformanceHighlights(baseStats, 'moving')
    expect(movingHighlights[1]?.label).toBe('射速')

    const emptyHighlights = buildPerformanceHighlights({ ...baseStats, shots: 0, hits: 0 }, 'flick')
    expect(emptyHighlights[0]?.value).toBe('—')
    expect(emptyHighlights[1]?.value).toBe('—')
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
