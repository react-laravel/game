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

function formatUtcDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function formatUtcMonthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

/** Bucket keys use UTC so they match persisted `record.date` values across timezones. */
export function aggregateDailyRecords(
  records: SessionRecord[],
  days = 14,
  now = Date.now()
): ChartBucket[] {
  const anchor = new Date(now)
  const endYear = anchor.getUTCFullYear()
  const endMonth = anchor.getUTCMonth()
  const endDay = anchor.getUTCDate()
  const startMs = Date.UTC(endYear, endMonth, endDay - (days - 1))

  const recent = records.filter(record => record.timestamp >= startMs)
  const groups = bucketRecords(recent, record => record.date)

  const buckets: ChartBucket[] = []
  for (let offset = 0; offset < days; offset += 1) {
    const dayMs = startMs + offset * 86_400_000
    const day = new Date(dayMs)
    const key = formatUtcDateKey(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate())
    const sessions = groups.get(key) ?? []

    buckets.push({
      key,
      label: `${day.getUTCMonth() + 1}/${day.getUTCDate()}`,
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
  const endYear = anchor.getUTCFullYear()
  const endMonth = anchor.getUTCMonth()
  const startMs = Date.UTC(endYear, endMonth - (months - 1), 1)

  const recent = records.filter(record => record.timestamp >= startMs)
  const groups = bucketRecords(recent, record => record.date.slice(0, 7))

  const buckets: ChartBucket[] = []
  for (let offset = 0; offset < months; offset += 1) {
    const monthMs = Date.UTC(endYear, endMonth - (months - 1) + offset, 1)
    const month = new Date(monthMs)
    const key = formatUtcMonthKey(month.getUTCFullYear(), month.getUTCMonth())
    const sessions = groups.get(key) ?? []

    buckets.push({
      key,
      label: `${month.getUTCFullYear()}/${month.getUTCMonth() + 1}`,
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
