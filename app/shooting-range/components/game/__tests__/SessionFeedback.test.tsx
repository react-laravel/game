import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SessionFeedback } from '../SessionFeedback'

describe('SessionFeedback', () => {
  it('renders a prominent headshot badge and accessible label for head hits', () => {
    render(
      <SessionFeedback
        hitPulse={{ id: 1, points: 20, streak: 1, hitZone: 'head', zoneLabel: '头部' }}
        streakToast={null}
      />
    )

    expect(screen.getByText('+20')).toBeInTheDocument()
    expect(screen.getByText('爆头!')).toBeInTheDocument()
    expect(screen.queryByText('头部')).not.toBeInTheDocument()
    expect(screen.getByLabelText('爆头，加 20 分')).toBeInTheDocument()
  })

  it('renders zone label for non-head humanoid hits', () => {
    render(
      <SessionFeedback
        hitPulse={{ id: 2, points: 10, streak: 2, hitZone: 'body', zoneLabel: '躯干' }}
        streakToast={null}
      />
    )

    expect(screen.getByText('+10')).toBeInTheDocument()
    expect(screen.getByText('躯干')).toBeInTheDocument()
    expect(screen.queryByText('爆头!')).not.toBeInTheDocument()
  })

  it('renders streak milestone toast', () => {
    render(
      <SessionFeedback hitPulse={null} streakToast={{ id: 3, streak: 5 }} />
    )

    expect(screen.getByText('5 连击')).toBeInTheDocument()
  })

  it('uses static headshot classes when reduced motion is enabled', () => {
    const { container } = render(
      <SessionFeedback
        hitPulse={{ id: 4, points: 20, streak: 1, hitZone: 'head', zoneLabel: '头部' }}
        streakToast={null}
        reducedMotion
      />
    )

    expect(container.querySelector('.headshot-pop-static')).toBeInTheDocument()
    expect(container.querySelector('.animate-headshot-pop')).not.toBeInTheDocument()
  })
})
