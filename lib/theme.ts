export const GAME_THEME_STORAGE_KEY = 'game-theme-mode'

export type GameTheme = 'light' | 'dark'

export function isGameTheme(value: unknown): value is GameTheme {
  return value === 'light' || value === 'dark'
}
