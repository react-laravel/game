import { Button } from '@/components/ui/button'
import { GameHud, GameStat } from '@/components/game'

interface Game2048HeaderProps {
  score: number
  bestScore: number
  canUndo: boolean
  gameOver: boolean
  showGyroscope: boolean
  gyroscopeEnabled: boolean
  onUndo: () => void
  onReset: () => void
  onToggleGyroscope: () => void
}

export const GAME_2048_RULES = [
  '滑动屏幕或使用方向键移动方块',
  '移动设备可启用陀螺仪，倾斜设备来控制',
  '相同数字的方块会合并成更大的数字',
  '目标：合并出2048方块！',
  '可使用按钮手动控制或自动运行',
  '支持撤销上一步操作',
  '游戏结束条件：棋盘填满且无法合并',
]

export function Game2048Header({
  score,
  bestScore,
  canUndo,
  gameOver,
  showGyroscope,
  gyroscopeEnabled,
  onUndo,
  onReset,
  onToggleGyroscope,
}: Game2048HeaderProps) {
  return (
    <GameHud className="mb-4">
      <div className="mb-3 grid grid-cols-2 gap-4">
        <GameStat label="当前分数" value={score} />
        <GameStat label="最高分" value={bestScore} />
      </div>

      <div className="flex items-center justify-end space-x-2">
        {showGyroscope && (
          <Button
            variant={gyroscopeEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={onToggleGyroscope}
            disabled={gameOver}
            className={
              gyroscopeEnabled ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''
            }
          >
            {gyroscopeEnabled ? '陀螺仪已启用' : '陀螺仪'}
          </Button>
        )}
        <Button onClick={onUndo} variant="outline" size="sm" disabled={!canUndo}>
          撤销
        </Button>
        <Button onClick={onReset} size="sm">
          重新开始
        </Button>
      </div>
    </GameHud>
  )
}
