'use client'

const TRANSLATIONS: Record<string, string> = {
  'game.tictactoe.stats.title': '游戏统计',
  'game.tictactoe.stats.total_games': '总局数',
  'game.tictactoe.stats.win_rate_x': 'X 胜率',
  'game.tictactoe.stats.player_x_wins': '玩家 X 胜利',
  'game.tictactoe.stats.player_o_wins': '胜利',
  'game.tictactoe.stats.draws': '平局',
  'game.tictactoe.achievement': '已完成 {count} 局，继续保持！',
}

export function useTranslation() {
  return {
    t: (key: string, fallback?: string) => TRANSLATIONS[key] ?? fallback ?? key,
  }
}

