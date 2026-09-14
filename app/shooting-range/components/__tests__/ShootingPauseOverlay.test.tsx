import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_CROSSHAIR_CONFIG } from '../../utils/crosshairConfig'
import { ShootingPauseOverlay } from '../ShootingGameOverlays'

const baseProps = {
  drillLabel: '户外 · 移动靶',
  lookSensitivity: 1,
  recoilEnabled: true,
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
  onRecoilEnabledChange: vi.fn(),
  onSfxVolumeChange: vi.fn(),
  onSfxMutedChange: vi.fn(),
  onMotionPreferenceChange: vi.fn(),
  targetShape: 'circle' as const,
  onTargetShapeChange: vi.fn(),
  mapId: 'outdoor' as const,
  outdoorTimeOfDay: 'day' as const,
  onOutdoorTimeOfDayChange: vi.fn(),
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

  it('keeps pause and settings clicks from bubbling to the game window', () => {
    const onWindowMouseDown = vi.fn()
    window.addEventListener('mousedown', onWindowMouseDown)
    render(<ShootingPauseOverlay {...baseProps} onChangeDrill={vi.fn()} />)

    fireEvent.mouseDown(screen.getByRole('button', { name: '设置' }))
    fireEvent.click(screen.getByRole('button', { name: '设置' }))
    fireEvent.mouseDown(screen.getByRole('tab', { name: '准星' }))

    expect(onWindowMouseDown).not.toHaveBeenCalled()
    window.removeEventListener('mousedown', onWindowMouseDown)
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

    fireEvent.pointerDown(screen.getByRole('button', { name: '回到游戏' }))
    expect(onResume).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: '退出游戏' }))
    expect(onExitTraining).toHaveBeenCalledOnce()
  })

  it('returns to the compact pause dialog from settings via back arrow or Escape', () => {
    render(<ShootingPauseOverlay {...baseProps} onChangeDrill={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: '设置' }))
    expect(screen.getByTestId('shooting-pause-settings')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '返回暂停菜单' }))
    expect(screen.getByTestId('shooting-pause-dialog')).toBeInTheDocument()
    expect(screen.queryByTestId('shooting-pause-settings')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '设置' }))
    fireEvent.keyDown(window, { code: 'Escape' })
    expect(screen.getByTestId('shooting-pause-dialog')).toBeInTheDocument()
  })

  it('resumes from the pause menu with Enter or Space after leaving settings', () => {
    const onResume = vi.fn()
    render(<ShootingPauseOverlay {...baseProps} onResume={onResume} onChangeDrill={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: '设置' }))
    fireEvent.click(screen.getByRole('button', { name: '返回暂停菜单' }))

    fireEvent.keyDown(window, { code: 'Enter' })
    expect(onResume).toHaveBeenCalledOnce()

    onResume.mockClear()
    fireEvent.click(screen.getByRole('button', { name: '设置' }))
    fireEvent.click(screen.getByRole('button', { name: '返回暂停菜单' }))
    fireEvent.keyDown(window, { code: 'Space' })
    expect(onResume).toHaveBeenCalledOnce()
  })

  it('does not resume with Enter or Space while settings are open', () => {
    const onResume = vi.fn()
    render(<ShootingPauseOverlay {...baseProps} onResume={onResume} onChangeDrill={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: '设置' }))
    fireEvent.keyDown(window, { code: 'Enter' })
    fireEvent.keyDown(window, { code: 'Space' })

    expect(onResume).not.toHaveBeenCalled()
  })

  it('shows framed sensitivity and volume tab content with previews', async () => {
    const user = userEvent.setup()
    render(<ShootingPauseOverlay {...baseProps} onChangeDrill={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: '设置' }))
    await user.click(screen.getByRole('tab', { name: '灵敏度' }))

    const sensitivityPanel = screen.getByRole('tabpanel', { hidden: false })
    expect(sensitivityPanel).toHaveTextContent('实时预览 · 转向幅度')
    expect(sensitivityPanel).toHaveTextContent('精细瞄准')
    expect(sensitivityPanel).toHaveTextContent('快速甩枪')

    await user.click(screen.getByRole('tab', { name: '音量' }))
    const volumePanel = screen.getByRole('tabpanel', { hidden: false })
    expect(volumePanel).toHaveTextContent('实时预览 · 音量幅度')
    expect(volumePanel).toHaveTextContent('夜间练习')

    await user.click(screen.getByRole('tab', { name: '其他' }))
    const otherPanel = screen.getByRole('tabpanel', { hidden: false })
    expect(otherPanel).toHaveTextContent('快速参考')
    expect(otherPanel).toHaveTextContent('后坐力')
    expect(otherPanel).toHaveTextContent('显示强度')
    expect(otherPanel).toHaveTextContent('户外时段')
  })
})
