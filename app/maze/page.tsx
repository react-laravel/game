'use client'

import { GameRulesDialog } from '@/components/ui/game-rules-dialog'
import MazeGame from './components/MazeGame'

export default function MazePage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">迷宫</h1>
          <GameRulesDialog
            title="迷宫游戏说明"
            rules={[
              '点击迷宫中的任意位置，小球会自动寻路到达',
              '移动过程中可以随时点击其他位置来中断并重新导航',
              '使用方向键或 WASD 键控制小球移动（会中断自动移动）',
              '将蓝色小球移动到右下角的红色终点即可获胜',
              '绿色方块是起点，红色方块是终点',
            ]}
          />
        </div>

        <MazeGame />
      </div>
    </div>
  )
}
