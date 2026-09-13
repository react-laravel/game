import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ShootingPauseOverlay } from '../ShootingGameOverlays'

describe('ShootingPauseOverlay', () => {
  it('uses a scrollable outer shell so controls stay reachable on short viewports', () => {
    render(
      <ShootingPauseOverlay
        drillLabel="户外 · 移动靶"
        lookSensitivity={1}
        sfxVolume={0.7}
        sfxMuted={false}
        motionPreference="system"
        onResume={vi.fn()}
        onRestart={vi.fn()}
        onSensitivityChange={vi.fn()}
        onSfxVolumeChange={vi.fn()}
        onSfxMutedChange={vi.fn()}
        onMotionPreferenceChange={vi.fn()}
      />
    )

    const overlay = screen.getByTestId('shooting-pause-overlay')
    expect(overlay).toHaveClass('overflow-y-auto')
    expect(screen.getByText('动态效果')).toBeInTheDocument()
  })
})
