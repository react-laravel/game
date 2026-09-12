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

  if (shots === 0) return 'D'

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

export function gradeLabel(grade: SessionGrade): string {
  switch (grade) {
    case 'S':
      return '精英表现'
    case 'A':
      return '稳定发挥'
    case 'B':
      return '继续提升'
    case 'C':
      return '需要练习'
    default:
      return '重新热身'
  }
}

export interface PerformanceHighlight {
  label: string
  value: string
  percent: number
  accent: 'emerald' | 'cyan' | 'amber' | 'rose'
}

export function buildPerformanceHighlights(
  stats: SessionStats,
  modeId: TrainingModeId
): PerformanceHighlight[] {
  const { accuracy, shots, shotsPerMinute, avgReactionMs, bestStreak } = stats

  if (shots === 0) {
    const emptySecondary =
      modeId === 'flick' || modeId === 'precision'
        ? { label: '反应速度', value: '—' }
        : modeId === 'timed' || modeId === 'moving'
          ? { label: '射速', value: '—' }
          : { label: '最高连击', value: '0' }

    return [
      { label: '精准度', value: '—', percent: 6, accent: 'rose' },
      { label: emptySecondary.label, value: emptySecondary.value, percent: 6, accent: 'amber' },
    ]
  }

  const highlights: PerformanceHighlight[] = [
    {
      label: '精准度',
      value: `${accuracy}%`,
      percent: Math.max(8, Math.min(100, accuracy)),
      accent: accuracy >= 85 ? 'emerald' : accuracy >= 65 ? 'cyan' : 'rose',
    },
  ]

  if (modeId === 'flick' || modeId === 'precision') {
    const reaction = avgReactionMs ?? 650
    const reactionScore = Math.max(8, Math.min(100, Math.round(100 - (reaction - 220) / 4.5)))
    highlights.push({
      label: '反应速度',
      value: avgReactionMs !== null ? `${avgReactionMs}ms` : '—',
      percent: reactionScore,
      accent: reaction <= 320 ? 'emerald' : reaction <= 450 ? 'cyan' : 'amber',
    })
  } else if (modeId === 'timed' || modeId === 'moving') {
    highlights.push({
      label: '射速',
      value: `${shotsPerMinute}/分`,
      percent: Math.max(8, Math.min(100, Math.round((shotsPerMinute / 70) * 100))),
      accent: shotsPerMinute >= 55 ? 'emerald' : shotsPerMinute >= 38 ? 'cyan' : 'amber',
    })
  } else {
    highlights.push({
      label: '最高连击',
      value: `${bestStreak}`,
      percent: Math.max(8, Math.min(100, Math.round((bestStreak / 12) * 100))),
      accent: bestStreak >= 8 ? 'emerald' : bestStreak >= 4 ? 'cyan' : 'amber',
    })
  }

  return highlights
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
