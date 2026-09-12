export type ShootingDifficulty = 'easy' | 'medium' | 'hard'

export type ShootingMapId = 'indoor' | 'outdoor' | 'warehouse'

export type TrainingModeId =
  | 'static'
  | 'moving'
  | 'flick'
  | 'tracking'
  | 'timed'
  | 'precision'

export type SpawnPattern = 'random' | 'grid'

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
}
