import { fireEvent, render, screen } from '@testing-library/react'
import { GameRulesDialog } from '../ui/game-rules-dialog'

describe('GameRulesDialog', () => {
  it('长规则列表在弹窗内滚动，不撑出视口', () => {
    const rules = Array.from({ length: 18 }, (_, i) => `规则条目 ${i + 1}`)
    render(<GameRulesDialog title="21 点游戏规则" rules={rules} />)

    fireEvent.click(screen.getByRole('button', { name: '游戏规则' }))

    expect(screen.getByRole('dialog')).toHaveClass('max-h-[min(85dvh,calc(100dvh-2rem))]')
    expect(screen.getByRole('dialog')).toHaveClass('overflow-hidden')
    const scroller = screen.getByRole('list').parentElement
    expect(scroller).toHaveClass('overflow-y-auto')
    expect(screen.getByText('规则条目 18')).toBeInTheDocument()
  })
})
