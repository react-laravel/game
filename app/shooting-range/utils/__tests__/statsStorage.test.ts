import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearSessionHistory,
  createSessionRecord,
  loadSessionHistory,
  saveSessionRecord,
  SHOOTING_HISTORY_KEY,
} from '../statsStorage'

describe('statsStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('creates and persists session records', () => {
    const record = createSessionRecord(
      { difficulty: 'easy', mapId: 'indoor', modeId: 'moving' },
      {
        score: 120,
        hits: 12,
        misses: 3,
        shots: 15,
        accuracy: 80,
        shotsPerMinute: 45,
        bestStreak: 4,
        avgReactionMs: 320,
      },
      60
    )

    const saved = saveSessionRecord(record)
    expect(saved).toHaveLength(1)
    expect(loadSessionHistory()).toEqual([record])
    expect(localStorage.getItem(SHOOTING_HISTORY_KEY)).toContain('"score":120')
  })

  it('caps history length and clears storage', () => {
    for (let index = 0; index < 205; index += 1) {
      saveSessionRecord(
        createSessionRecord(
          { difficulty: 'easy', mapId: 'indoor', modeId: 'moving' },
          {
            score: index,
            hits: 1,
            misses: 0,
            shots: 1,
            accuracy: 100,
            shotsPerMinute: 10,
            bestStreak: 1,
            avgReactionMs: null,
          },
          60
        )
      )
    }

    expect(loadSessionHistory()).toHaveLength(200)
    clearSessionHistory()
    expect(loadSessionHistory()).toEqual([])
  })
})
