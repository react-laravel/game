export type ShootingDifficulty = 'easy' | 'medium' | 'hard'

export type ShootingMapId = 'indoor' | 'outdoor' | 'warehouse'

export type TrainingModeId =
  | 'static'
  | 'moving'
  | 'flick'
  | 'tracking'
  | 'timed'
  | 'precision'

export type SpawnPattern = 'random' | 'grid' | 'wall'

export type TargetShape = 'circle' | 'humanoid'

export type OutdoorTimeOfDay = 'day' | 'noon' | 'dusk' | 'night'

export type HitZone = 'head' | 'body' | 'limb'

export interface ZoneHitStats {
  head: number
  body: number
  limb: number
}

export interface ShootingBrowserSupport {
  supported: boolean
  message: string
  useFallback: boolean
}

export interface SessionStats {
  score: number
  hits: number
  misses: number
  shots: number
  accuracy: number
  shotsPerMinute: number
  bestStreak: number
  avgReactionMs: number | null
  zoneHits: ZoneHitStats
}

export interface SessionRecord extends SessionStats {
  id: string
  timestamp: number
  date: string
  difficulty: ShootingDifficulty
  mapId: ShootingMapId
  modeId: TrainingModeId
  durationSeconds: number
}

export interface ShootingSetupConfig {
  difficulty: ShootingDifficulty
  mapId: ShootingMapId
  modeId: TrainingModeId
  lookSensitivity?: number
  sfxVolume?: number
  sfxMuted?: boolean
  targetShape?: TargetShape
  outdoorTimeOfDay?: OutdoorTimeOfDay
}
