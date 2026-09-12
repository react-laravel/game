import { Button } from '@/components/ui/button'
import { GameHud, GameStat } from '@/components/game'
import { DIFFICULTY_LABELS } from '../config'
import type { Difficulty, MinesweeperGameState } from '../types'

interface MinesweeperHeaderProps {
  difficulty: Difficulty
  timer: number
  mineCount: number
  gameState: MinesweeperGameState
  onDifficultyChange: (difficulty: Difficulty) => void
  onReset: () => void
}

export const MINESWEEPER_RULES = [
  '找出所有地雷位置而不踩雷',
  '数字表示周围8个格子的地雷数量',
  '左键点击揭示格子，右键循环标记：旗帜 → 问号 → 取消',
  '手机端可长按格子进行同样的标记循环',
  '问号格子可以左键翻开，旗帜格子不会被翻开',
  '揭示所有非地雷格子即可获胜',
  '点到地雷就失败了',
]

export function MinesweeperHeader({
  difficulty,
  timer,
  mineCount,
  gameState,
  onDifficultyChange,
  onReset,
}: MinesweeperHeaderProps) {
  return (
    <GameHud className="w-full max-w-xl">
      <div className="flex flex-wrap justify-center gap-2">
        {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map(option => (
          <Button
            key={option}
            variant={difficulty === option ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDifficultyChange(option)}
            className="text-xs"
          >
            {DIFFICULTY_LABELS[option]}
          </Button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <GameStat label="时间" value={`${timer}s`} />
        <GameStat label="地雷" value={mineCount} />
        <GameStat
          label="状态"
          value={gameState === 'playing' ? '🙂' : gameState === 'won' ? '😎' : '😵'}
        />
      </div>

      <div className="mt-4 flex justify-center">
        <Button onClick={onReset} variant="outline" size="sm">
          重新开始
        </Button>
      </div>
    </GameHud>
  )
}
