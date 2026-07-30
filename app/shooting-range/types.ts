export type ShootingDifficulty = 'easy' | 'medium' | 'hard'

export interface ShootingBrowserSupport {
  supported: boolean
  message: string
  useFallback: boolean
}
