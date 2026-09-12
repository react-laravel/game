import type { SessionRecord } from '../types'

export interface ChartBucket {
  key: string
  label: string
  sessions: number
  avgAccuracy: number
  avgScore: number
  totalShots: number
  avgReactionMs: number | null
}

function average(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function averageNullable(values: Array<number | null>) {
  const filtered = values.filter((value): value is number => value !== null)
  if (filtered.length === 0) return null
  return average(filtered)
}

function bucketRecords(records: SessionRecord[], keyFn: (record: SessionRecord) => string) {
  const groups = new Map<string, SessionRecord[]>()
  for (const record of records) {
    const key = keyFn(record)
    const group = groups.get(key)
    if (group) group.push(record)
    else groups.set(key, [record])
  }
  return groups
}

export function aggregateDailyRecords(
  records: SessionRecord[],
  days = 14,
  now = Date.now()
): ChartBucket[] {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (days - 1))

  const recent = records.filter(record => record.timestamp >= start.getTime())
  const groups = bucketRecords(recent, record => record.date)

  const buckets: ChartBucket[] = []
  for (let offset = 0; offset < days; offset += 1) {
    const day = new Date(start)
    day.setDate(start.getDate() + offset)
    const key = day.toISOString().slice(0, 10)
    const sessions = groups.get(key) ?? []

    buckets.push({
      key,
      label: `${day.getMonth() + 1}/${day.getDate()}`,
      sessions: sessions.length,
      avgAccuracy: average(sessions.map(session => session.accuracy)),
      avgScore: average(sessions.map(session => session.score)),
      totalShots: sessions.reduce((sum, session) => sum + session.shots, 0),
      avgReactionMs: averageNullable(sessions.map(session => session.avgReactionMs)),
    })
  }

  return buckets
}

export function aggregateMonthlyRecords(
  records: SessionRecord[],
  months = 6,
  now = Date.now()
): ChartBucket[] {
  const anchor = new Date(now)
  anchor.setDate(1)
  anchor.setHours(0, 0, 0, 0)

  const start = new Date(anchor)
  start.setMonth(anchor.getMonth() - (months - 1))

  const recent = records.filter(record => record.timestamp >= start.getTime())
  const groups = bucketRecords(recent, record => record.date.slice(0, 7))

  const buckets: ChartBucket[] = []
  for (let offset = 0; offset < months; offset += 1) {
    const month = new Date(start)
    month.setMonth(start.getMonth() + offset)
    const key = month.toISOString().slice(0, 7)
    const sessions = groups.get(key) ?? []

    buckets.push({
      key,
      label: `${month.getFullYear()}/${month.getMonth() + 1}`,
      sessions: sessions.length,
      avgAccuracy: average(sessions.map(session => session.accuracy)),
      avgScore: average(sessions.map(session => session.score)),
      totalShots: sessions.reduce((sum, session) => sum + session.shots, 0),
      avgReactionMs: averageNullable(sessions.map(session => session.avgReactionMs)),
    })
  }

  return buckets
}

export function maxBucketValue(buckets: ChartBucket[], field: keyof ChartBucket) {
  return buckets.reduce((max, bucket) => {
    const value = bucket[field]
    if (typeof value !== 'number') return max
    return Math.max(max, value)
  }, 0)
}
