'use client'

import { GameRulesDialog } from '@/components/ui/game-rules-dialog'
import MazeGame from './components/MazeGame'

export default function MazePage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <h1 className="text-xl font-bold">迷宫</h1>
          <GameRulesDialog
            title="迷宫游戏说明"
            rules={[
              '拖动滑块调整迷宫大小，格子越多越难',
              '可切换正方形，或适合 A4 竖版打印纸的长方形',
              '点击「打印迷宫」可用打印机打印出来，用笔从「起」走到「终」',
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
