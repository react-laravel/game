import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_CROSSHAIR_CONFIG } from '../../utils/crosshairConfig'
import { CrosshairSettingsSheet } from '../CrosshairSettingsSheet'

describe('CrosshairSettingsSheet', () => {
  it('applies draft changes only when the user confirms', () => {
    const onApply = vi.fn()
    const onClose = vi.fn()

    render(
      <CrosshairSettingsSheet
        config={DEFAULT_CROSSHAIR_CONFIG}
        onApply={onApply}
        onClose={onClose}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: '圆环' }))
    fireEvent.click(screen.getByRole('button', { name: '取消' }))

    expect(onApply).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('commits draft config on apply', () => {
    const onApply = vi.fn()
    const onClose = vi.fn()

    render(
      <CrosshairSettingsSheet
        config={DEFAULT_CROSSHAIR_CONFIG}
        onApply={onApply}
        onClose={onClose}
        applyLabel="应用并关闭"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: '圆环' }))
    fireEvent.click(screen.getByRole('button', { name: '应用并关闭' }))

    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ style: 'circle' })
    )
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows dual-background enhanced preview', () => {
    render(
      <CrosshairSettingsSheet
        config={DEFAULT_CROSSHAIR_CONFIG}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />
    )

    expect(screen.getByText('暗色场景')).toBeInTheDocument()
    expect(screen.getByText('亮色场景')).toBeInTheDocument()
    expect(screen.getByText(/双背景对比/)).toBeInTheDocument()
  })
})
