import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GameHud, GameResultOverlay, GameStage, GameStat } from '../GameStage'

vi.mock('@/components/ui/game-rules-dialog', () => ({
  GameRulesDialog: ({ title, rules }: { title: string; rules: string[] }) => (
    <div data-testid="game-rules-dialog" data-title={title}>
      {rules.join(' ')}
    </div>
  ),
}))

describe('GameStage', () => {
  it('renders title, rules, and hud stats', () => {
    render(
      <GameStage title="贪吃蛇" rules={['不能撞墙']} actions={<button type="button">重置</button>}>
        <GameHud>
          <GameStat label="当前分数" value={120} />
        </GameHud>
      </GameStage>
    )

    expect(screen.getByRole('heading', { name: '贪吃蛇' })).toBeInTheDocument()
    expect(screen.getByTestId('game-rules-dialog')).toHaveAttribute(
      'data-title',
      '贪吃蛇游戏规则'
    )
    expect(screen.getByText('当前分数')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重置' })).toBeInTheDocument()
  })

  it('hides the result overlay until it is open', () => {
    const { rerender } = render(<GameResultOverlay open={false} title="游戏结束" />)
    expect(screen.queryByText('游戏结束')).not.toBeInTheDocument()

    rerender(
      <GameResultOverlay open title="游戏结束">
        <p>最终分数: 90</p>
      </GameResultOverlay>
    )

    expect(screen.getByText('游戏结束')).toBeInTheDocument()
    expect(screen.getByText('最终分数: 90')).toBeInTheDocument()
  })
})
