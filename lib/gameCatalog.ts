export const GAME_CATEGORIES = [
  { id: 'all', name: '全部游戏' },
  { id: 'puzzle', name: '益智解谜' },
  { id: 'arcade', name: '经典街机' },
  { id: 'table', name: '棋盘桌游' },
  { id: 'sports', name: '运动挑战' },
] as const

export type GameCategory = (typeof GAME_CATEGORIES)[number]['id']

export interface CatalogGame {
  id: string
  name: string
  description: string
  icon: string
  category: Exclude<GameCategory, 'all'>
  controls: string
  color: 'amber' | 'violet' | 'green' | 'blue' | 'rose'
  desktopOnly?: boolean
  keywords?: string
}

export const GAME_CATALOG: readonly CatalogGame[] = [
  { id: '2048', name: '2048', description: '滑动、合并，离下一个数字更近一点。', icon: '🔢', category: 'puzzle', controls: '方向键 / 滑动', color: 'amber' },
  { id: 'tetris', name: '俄罗斯方块', description: '找到空隙，让每一块都恰到好处。', icon: '🧱', category: 'arcade', controls: '键盘 / 触屏', color: 'violet', keywords: 'tetris' },
  { id: 'snake', name: '贪吃蛇', description: '多吃一口，也给自己留一条退路。', icon: '🐍', category: 'arcade', controls: '方向键 / 滑动', color: 'green', keywords: 'snake' },
  { id: 'minesweeper', name: '扫雷', description: '沿着数字线索，稳稳排除每一颗雷。', icon: '💣', category: 'puzzle', controls: '点击 / 触屏', color: 'blue', keywords: 'minesweeper' },
  { id: 'monopoly', name: '地产棋局', description: '掷骰、置业，与好友一起环游棋盘。', icon: '🏙️', category: 'table', controls: '实时多人', color: 'blue', keywords: 'monopoly 大富翁' },
  { id: 'blackjack', name: '21 点', description: '再来一张，还是见好就收？', icon: '🃏', category: 'table', controls: '点击 / 触屏', color: 'green', keywords: 'blackjack 二十一点' },
  { id: 'moon-dice', name: '月饼骰子', description: '六骰同摇，试试今天的博饼手气。', icon: '🎲', category: 'table', controls: '点击 / 触屏', color: 'rose', keywords: 'moon dice 博饼' },
  { id: 'tic-tac-toe', name: '井字棋', description: '三子连线，和朋友或 AI 过过招。', icon: '⭕', category: 'table', controls: '双人 / 人机', color: 'violet', keywords: 'tic tac toe' },
  { id: 'sliding-puzzle', name: '滑块拼图', description: '借一个空位，让数字各归其位。', icon: '🧩', category: 'puzzle', controls: '点击 / 触屏', color: 'amber', keywords: 'sliding puzzle 数字拼图' },
  { id: 'picture-puzzle', name: '图片拼图', description: '选一张喜欢的图片，重新拼出风景。', icon: '🖼️', category: 'puzzle', controls: '支持上传图片', color: 'rose', keywords: 'picture puzzle' },
  { id: 'jigsaw-puzzle', name: '传统拼图', description: '拖动碎片，让画面一点点完整。', icon: '🧩', category: 'puzzle', controls: '拖拽 / 自动吸附', color: 'violet', keywords: 'jigsaw puzzle' },
  { id: 'maze', name: '迷宫', description: '带着小球穿过曲折，找到出口。', icon: '🌀', category: 'puzzle', controls: '方向键 / 触屏', color: 'green', keywords: 'maze' },
  { id: 'bowling', name: '保龄球', description: '瞄准、蓄力，向全中发起挑战。', icon: '🎳', category: 'sports', controls: '3D 球馆', color: 'blue', keywords: 'bowling' },
  { id: 'shooting-range', name: '射击训练场', description: '练习瞄准、反应与稳定的命中。', icon: '🎯', category: 'sports', controls: '键盘 / 鼠标', color: 'rose', desktopOnly: true, keywords: 'shooting range 射击' },
]

export const GAME_BY_ID = new Map(GAME_CATALOG.map(game => [game.id, game]))

export function filterGames(category: GameCategory, query: string, favorites?: readonly string[]) {
  const normalized = query.trim().toLocaleLowerCase()
  return GAME_CATALOG.filter(game =>
    (category === 'all' || game.category === category) &&
    (!favorites || favorites.includes(game.id)) &&
    (!normalized || `${game.name} ${game.id} ${game.description} ${game.keywords ?? ''}`.toLocaleLowerCase().includes(normalized))
  )
}
