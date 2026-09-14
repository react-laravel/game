import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RecoilControl } from '../RecoilControl'

describe('RecoilControl', () => {
  it('toggles upward recoil on and off', () => {
    const onChange = vi.fn()
    render(<RecoilControl enabled onChange={onChange} />)

    expect(screen.getByRole('button', { name: /开火向上抬枪/ })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: /准星保持稳定/ })).toHaveAttribute(
      'aria-pressed',
      'false'
    )

    fireEvent.click(screen.getByRole('button', { name: /准星保持稳定/ }))
    expect(onChange).toHaveBeenCalledWith(false)
  })
})
