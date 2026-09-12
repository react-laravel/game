import { describe, expect, it } from 'vitest'
import { aggregateDailyRecords, aggregateMonthlyRecords } from '../chartAggregation'
import type { SessionRecord } from '../../types'

function makeRecord(overrides: Partial<SessionRecord>): SessionRecord {
  return {
    id: 'test',
    timestamp: Date.now(),
    date: '2026-09-12',
    difficulty: 'easy',
    mapId: 'indoor',
    modeId: 'moving',
    durationSeconds: 60,
    score: 100,
    hits: 10,
    misses: 2,
    shots: 12,
    accuracy: 83,
    shotsPerMinute: 40,
    bestStreak: 3,
    avgReactionMs: 250,
    ...overrides,
  }
}

describe('chartAggregation', () => {
  it('aggregates daily buckets for the requested window', () => {
    const now = new Date('2026-09-12T12:00:00Z').getTime()
    const records = [
      makeRecord({ timestamp: now, date: '2026-09-12', accuracy: 80, score: 120 }),
      makeRecord({ timestamp: now - 86_400_000, date: '2026-09-11', accuracy: 60, score: 80 }),
    ]

    const buckets = aggregateDailyRecords(records, 3, now)
    expect(buckets).toHaveLength(3)
    expect(buckets[2].sessions).toBe(1)
    expect(buckets[2].avgAccuracy).toBe(80)
    expect(buckets[1].avgScore).toBe(80)
  })

  it('aggregates monthly buckets', () => {
    const now = new Date('2026-09-12T12:00:00Z').getTime()
    const records = [
      makeRecord({ timestamp: now, date: '2026-09-05', score: 90 }),
      makeRecord({ timestamp: new Date('2026-08-15T12:00:00Z').getTime(), date: '2026-08-15', score: 70 }),
    ]

    const buckets = aggregateMonthlyRecords(records, 2, now)
    expect(buckets).toHaveLength(2)
    expect(buckets[0].avgScore).toBe(70)
    expect(buckets[1].avgScore).toBe(90)
  })

  it('uses UTC bucket keys so grouping matches persisted record dates', () => {
    const previousTz = process.env.TZ
    process.env.TZ = 'Asia/Tokyo'

    try {
      const now = new Date('2026-09-12T12:00:00Z').getTime()
      const records = [
        makeRecord({ timestamp: now, date: '2026-09-12', accuracy: 80, score: 120 }),
        makeRecord({ timestamp: now - 86_400_000, date: '2026-09-11', accuracy: 60, score: 80 }),
      ]

      const daily = aggregateDailyRecords(records, 3, now)
      expect(daily[2].key).toBe('2026-09-12')
      expect(daily[2].avgAccuracy).toBe(80)

      const monthly = aggregateMonthlyRecords(
        [
          makeRecord({ timestamp: now, date: '2026-09-05', score: 90 }),
          makeRecord({
            timestamp: new Date('2026-08-15T12:00:00Z').getTime(),
            date: '2026-08-15',
            score: 70,
          }),
        ],
        2,
        now
      )
      expect(monthly[0].avgScore).toBe(70)
      expect(monthly[1].avgScore).toBe(90)
    } finally {
      process.env.TZ = previousTz
    }
  })
})
