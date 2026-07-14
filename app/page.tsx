import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { PageContainer } from '@/components/layout'

const GAMES = [
  {
    id: 'monopoly',
    name: '地产棋局',
    description: '实时多人地产棋盘游戏',
    icon: '🏙️',
  },
  { id: 'moon-dice', name: '月饼骰子', description: '博饼规则的双人骰子游戏', icon: '🎲' },
  { id: 'sliding-puzzle', name: '滑块拼图', description: '经典数字滑块拼图', icon: '🧩' },
  { id: 'picture-puzzle', name: '图片拼图', description: '将打乱的图片重新拼合', icon: '🖼️' },
  { id: 'jigsaw-puzzle', name: '传统拼图', description: '拖拽拼图块完成图片', icon: '🧩' },
  {
    id: 'shooting-range',
    name: '射击训练场',
    description: '第一人称 3D 射击训练',
    icon: '🎯',
    hideOnMobile: true,
  },
  { id: 'maze', name: '迷宫', description: '控制小球走出迷宫', icon: '🌀' },
  { id: 'bowling', name: '保龄球', description: '物理模拟保龄球', icon: '🎳' },
  { id: 'tetris', name: '俄罗斯方块', description: '经典俄罗斯方块', icon: '🧱' },
  { id: '2048', name: '2048', description: '合并数字挑战 2048', icon: '🔢' },
  { id: 'snake', name: '贪吃蛇', description: '经典贪吃蛇', icon: '🐍' },
  { id: 'minesweeper', name: '扫雷', description: '通过数字提示找出地雷', icon: '💣' },
  { id: 'tic-tac-toe', name: '井字棋', description: '双人或人机三子连线', icon: '⭕' },
] as const

export default function HomePage() {
  return (
    <PageContainer maxWidth="7xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">DogeOW 游戏中心</h1>
        <p className="text-muted-foreground mt-1 text-sm">选择一个游戏开始挑战。</p>
      </header>
      <div className="flex flex-wrap gap-3 sm:gap-4" role="grid" aria-label="游戏列表">
        {GAMES.map(game => (
          <Link
            key={game.id}
            href={`/${game.id}`}
            className={`w-28 sm:w-32 ${'hideOnMobile' in game && game.hideOnMobile ? 'hidden md:block' : ''}`}
          >
            <Card className="flex aspect-square flex-col items-center justify-center p-3 text-center transition hover:-translate-y-1 hover:shadow-md">
              <span className="mb-2 text-3xl" role="img" aria-label={game.name}>
                {game.icon}
              </span>
              <h2 className="font-medium">{game.name}</h2>
              <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{game.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </PageContainer>
  )
}

