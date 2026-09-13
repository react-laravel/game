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
  it('renders a compact centered pause dialog without a left drawer', () => {
    render(<ShootingPauseOverlay {...baseProps} onChangeDrill={vi.fn()} />)

    expect(screen.getByTestId('shooting-pause-overlay')).toBeInTheDocument()
    expect(screen.getByTestId('shooting-pause-dialog')).toBeInTheDocument()
    expect(screen.queryByTestId('shooting-pause-menu')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '回到游戏' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '设置' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '退出游戏' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重新开始' })).toBeInTheDocument()
    expect(screen.queryByText('鼠标灵敏度')).not.toBeInTheDocument()
    expect(screen.queryByText('音效音量')).not.toBeInTheDocument()
    expect(screen.queryByText('动态效果')).not.toBeInTheDocument()
  })

  it('opens tabbed settings from the pause popup', () => {
    render(<ShootingPauseOverlay {...baseProps} onChangeDrill={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: '设置' }))

    expect(screen.getByTestId('shooting-pause-settings')).toBeInTheDocument()
    expect(screen.queryByTestId('shooting-pause-dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '准星' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '灵敏度' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '音量' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '其他' })).toBeInTheDocument()
    expect(screen.getByText('准星设置')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '灵敏度' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('tab', { name: '音量' })).toHaveAttribute('aria-selected', 'false')
  })

  it('wires resume and exit from the compact pause popup', () => {
    const onResume = vi.fn()
    const onExitTraining = vi.fn()
    render(
      <ShootingPauseOverlay
        {...baseProps}
        onResume={onResume}
        onExitTraining={onExitTraining}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: '回到游戏' }))
    expect(onResume).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: '退出游戏' }))
    expect(onExitTraining).toHaveBeenCalledOnce()
  })
})
