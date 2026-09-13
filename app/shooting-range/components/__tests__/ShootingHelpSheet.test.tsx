import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShootingHelpSheet } from '../ShootingHelpSheet'

describe('ShootingHelpSheet', () => {
  it('renders compact Chinese help and closes on button click', async () => {
    const onClose = vi.fn()
    render(<ShootingHelpSheet onClose={onClose} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('射击训练帮助')).toBeInTheDocument()
    expect(screen.getByText('基本操作')).toBeInTheDocument()
    expect(screen.getByText(/按 ESC 暂停/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: '知道了' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
