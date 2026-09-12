import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BowlingScorecard } from '../components/BowlingScorecard'
import { emptyFrames, buildScorecard } from '../utils/scoring'

describe('BowlingScorecard', () => {
  it('renders ten frames and the running total', () => {
    const frames = emptyFrames()
    frames[0] = [4, 5]
    render(
      <BowlingScorecard
        frames={buildScorecard(frames)}
        currentFrame={2}
        totalScore={9}
        gameFinished={false}
      />
    )

    expect(screen.getByText('总分')).toBeInTheDocument()
    expect(screen.getAllByText('9').length).toBeGreaterThan(0)
    expect(screen.getByText('第 2 局')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })
})
