import type { SessionRecord, SessionStats, TrainingModeId } from '../types'
import { trainingModes } from './trainingModes'

export type SessionGrade = 'S' | 'A' | 'B' | 'C' | 'D'

export interface PersonalBestComparison {
  previous: SessionRecord | null
  isNewBest: boolean
  scoreDelta: number | null
  accuracyDelta: number | null
  reactionDelta: number | null
}

export function computeSessionGrade(
  stats: SessionStats,
  modeId: TrainingModeId
): SessionGrade {
  const { accuracy, shots, shotsPerMinute, avgReactionMs, bestStreak } = stats
  const mode = trainingModes[modeId]

  let score = 0
  if (accuracy >= 92) score += 3
  else if (accuracy >= 82) score += 2
  else if (accuracy >= 70) score += 1

  if (modeId === 'flick' || modeId === 'precision') {
    if (avgReactionMs !== null && avgReactionMs <= 320) score += 3
    else if (avgReactionMs !== null && avgReactionMs <= 450) score += 2
    else if (avgReactionMs !== null && avgReactionMs <= 600) score += 1
  } else if (modeId === 'timed' || modeId === 'moving') {
    if (shotsPerMinute >= 55) score += 2
    else if (shotsPerMinute >= 38) score += 1
  } else {
    if (bestStreak >= 8) score += 2
    else if (bestStreak >= 4) score += 1
  }

  if (mode.movement === 'orbit' && accuracy >= 78) score += 1
  if (shots >= 5 && accuracy < 45) score -= 2

  if (score >= 6) return 'S'
  if (score >= 4) return 'A'
  if (score >= 2) return 'B'
  if (score >= 1) return 'C'
  return 'D'
}

export function gradeColor(grade: SessionGrade): string {
  switch (grade) {
    case 'S':
      return 'text-amber-300'
    case 'A':
      return 'text-emerald-300'
    case 'B':
      return 'text-cyan-300'
    case 'C':
      return 'text-slate-300'
    default:
      return 'text-rose-300'
  }
}

export function filterHistoryByMode(
  history: SessionRecord[],
  modeId: TrainingModeId
): SessionRecord[] {
  return history.filter(record => record.modeId === modeId)
}

export function getPersonalBest(
  history: SessionRecord[],
  modeId: TrainingModeId
): SessionRecord | null {
  const modeHistory = filterHistoryByMode(history, modeId)
  if (modeHistory.length === 0) return null
  return modeHistory.reduce((best, record) => (record.score > best.score ? record : best))
}

export function compareToPersonalBest(
  stats: SessionStats,
  modeId: TrainingModeId,
  history: SessionRecord[],
  excludeLatest = true
): PersonalBestComparison {
  const modeHistory = filterHistoryByMode(history, modeId)
  const pool = excludeLatest && modeHistory.length > 0 ? modeHistory.slice(1) : modeHistory
  const previous = pool.length > 0
    ? pool.reduce((best, record) => (record.score > best.score ? record : best))
    : null

  if (!previous) {
    return {
      previous: null,
      isNewBest: stats.score > 0,
      scoreDelta: null,
      accuracyDelta: null,
      reactionDelta: null,
    }
  }

  const isNewBest = stats.score > previous.score
  return {
    previous,
    isNewBest,
    scoreDelta: stats.score - previous.score,
    accuracyDelta: stats.accuracy - previous.accuracy,
    reactionDelta:
      stats.avgReactionMs !== null && previous.avgReactionMs !== null
        ? stats.avgReactionMs - previous.avgReactionMs
        : null,
  }
}

export interface ModeSummary {
  modeId: TrainingModeId
  sessions: number
  bestScore: number
  avgAccuracy: number
  bestReactionMs: number | null
}

export function summarizeByMode(history: SessionRecord[]): ModeSummary[] {
  const buckets = new Map<TrainingModeId, SessionRecord[]>()
  for (const record of history) {
    const list = buckets.get(record.modeId) ?? []
    list.push(record)
    buckets.set(record.modeId, list)
  }

  return Object.keys(trainingModes).map(modeId => {
    const records = buckets.get(modeId as TrainingModeId) ?? []
    const best = records.length > 0
      ? records.reduce((a, b) => (a.score > b.score ? a : b))
      : null
    const reactions = records
      .map(r => r.avgReactionMs)
      .filter((v): v is number => v !== null)
    return {
      modeId: modeId as TrainingModeId,
      sessions: records.length,
      bestScore: best?.score ?? 0,
      avgAccuracy:
        records.length > 0
          ? Math.round(records.reduce((sum, r) => sum + r.accuracy, 0) / records.length)
          : 0,
      bestReactionMs: reactions.length > 0 ? Math.min(...reactions) : null,
    }
  })
}
