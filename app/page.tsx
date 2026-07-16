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
    <main className="bg-background min-h-dvh">
      <PageContainer maxWidth="7xl" className="py-8 sm:py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">DogeOW 游戏中心</h1>
          <p className="text-muted-foreground mt-2 text-base">选择一个游戏开始挑战。</p>
        </header>
        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] sm:gap-4"
          role="grid"
          aria-label="游戏列表"
        >
          {GAMES.map(game => (
            <Link
              key={game.id}
              href={`/${game.id}`}
              className={`group flex ${'hideOnMobile' in game && game.hideOnMobile ? 'hidden md:flex' : ''}`}
            >
              <Card className="flex h-56 w-full flex-col items-center justify-center rounded-2xl p-4 text-center transition duration-200 group-hover:-translate-y-1 group-hover:border-primary/45 group-hover:shadow-lg">
                <span className="mb-5 text-4xl" role="img" aria-label={game.name}>
                  {game.icon}
                </span>
                <h2 className="text-lg font-bold">{game.name}</h2>
                <p className="text-muted-foreground mt-4 flex min-h-10 items-center justify-center text-sm leading-5">
                  {game.description}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </PageContainer>
    </main>
  )
}
