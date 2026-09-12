import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SnakeBoard } from '../SnakeBoard'

describe('SnakeBoard', () => {
  it('用 round join 折线画蛇身，转弯跟随路径角度', () => {
    const { getByTestId } = render(
      <SnakeBoard
        boardSize={20}
        direction="DOWN"
        food={{ x: 8, y: 8 }}
        snake={[
          { x: 4, y: 3 },
          { x: 4, y: 2 },
          { x: 3, y: 2 },
        ]}
      />
    )

    const path = getByTestId('snake-path')
    expect(path).toHaveAttribute('stroke-linejoin', 'round')
    expect(path).toHaveAttribute('stroke-linecap', 'round')
    expect(path).toHaveAttribute('points', '4.5,3.5 4.5,2.5 3.5,2.5')
  })

  it('蛇头旋转朝向前进方向，而不是对着身体', () => {
    const { getByTestId } = render(
      <SnakeBoard
        boardSize={20}
        direction="RIGHT"
        food={{ x: 1, y: 1 }}
        snake={[
          { x: 5, y: 4 },
          { x: 4, y: 4 },
        ]}
      />
    )

    const head = getByTestId('snake-head')
    expect(head).toHaveAttribute('data-heading', '0')
    expect(head.getAttribute('transform')).toContain('rotate(0)')
  })

  it('向左走时蛇头旋转 180 度', () => {
    const { getByTestId } = render(
      <SnakeBoard
        boardSize={20}
        direction="LEFT"
        food={{ x: 1, y: 1 }}
        snake={[
          { x: 3, y: 4 },
          { x: 4, y: 4 },
        ]}
      />
    )

    expect(getByTestId('snake-head').getAttribute('transform')).toContain('rotate(180)')
  })
})
