// src/test/components/ui/Button.test.tsx

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../../../components/ui/Button'

describe('Button', () => {
  it('renders the label text', () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>,
    )

    const button = screen.getByRole('button', { name: /disabled/i })
    expect(button).toBeDisabled()

    await user.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('supports different variants and sizes without crashing', () => {
    const { rerender } = render(
      <Button variant="primary" size="sm">
        Primary
      </Button>,
    )

    expect(screen.getByRole('button', { name: /primary/i })).toBeInTheDocument()

    rerender(
      <Button variant="outline" size="md">
        Outline
      </Button>,
    )

    expect(screen.getByRole('button', { name: /outline/i })).toBeInTheDocument()
  })
})
