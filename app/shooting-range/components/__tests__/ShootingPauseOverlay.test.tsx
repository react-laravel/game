import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_CROSSHAIR_CONFIG } from '../../utils/crosshairConfig'
import { ShootingPauseOverlay } from '../ShootingGameOverlays'

const baseProps = {
  drillLabel: '户外 · 移动靶',
  lookSensitivity: 1,
  sfxVolume: 0.7,
  sfxMuted: false,
  motionPreference: 'system' as const,
  crosshairConfig: DEFAULT_CROSSHAIR_CONFIG,
  onCrosshairChange: vi.fn(),
  onCrosshairReset: vi.fn(),
  onResume: vi.fn(),
  onRestart: vi.fn(),
  onExitTraining: vi.fn(),
  onSensitivityChange: vi.fn(),
  onSfxVolumeChange: vi.fn(),
  onSfxMutedChange: vi.fn(),
  onMotionPreferenceChange: vi.fn(),
}

describe('ShootingPauseOverlay', () => {
  it('renders an Overwatch-style left pause menu with reachable exit and settings', () => {
    render(<ShootingPauseOverlay {...baseProps} onChangeDrill={vi.fn()} />)

    const menu = screen.getByTestId('shooting-pause-menu')
    expect(menu).toBeInTheDocument()
    expect(screen.getByTestId('shooting-pause-overlay')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /继续训练/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '结束训练' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '换训练项' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '准星设置' })).toBeInTheDocument()
    expect(screen.getByText('动态效果')).toBeInTheDocument()
  })

  it('wires primary actions from the left menu', () => {
    const onResume = vi.fn()
    const onExitTraining = vi.fn()
    render(
      <ShootingPauseOverlay
        {...baseProps}
        onResume={onResume}
        onExitTraining={onExitTraining}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /继续训练/ }))
    expect(onResume).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: '结束训练' }))
    expect(onExitTraining).toHaveBeenCalledOnce()
  })
})
