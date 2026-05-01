import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AboutEditor } from '@/components/dashboard/editor/AboutEditor'

describe('AboutEditor', () => {
  it('renders textarea with initial value', () => {
    render(<AboutEditor about="Initial about text" onChange={vi.fn()} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveValue('Initial about text')
  })

  it('calls onChange when user types', async () => {
    const onChange = vi.fn()
    render(<AboutEditor about="" onChange={onChange} />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Hello world' } })
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
    })
  })

  it('shows error message when text exceeds 2000 characters', async () => {
    const onChange = vi.fn()
    render(<AboutEditor about="" onChange={onChange} />)
    const textarea = screen.getByRole('textbox')
    const longText = 'a'.repeat(2001)
    fireEvent.change(textarea, { target: { value: longText } })
    fireEvent.blur(textarea)
    await waitFor(() => {
      expect(screen.getByText('About section cannot exceed 2000 characters')).toBeInTheDocument()
    })
  })

  it('does not show error for text within 2000 characters', async () => {
    render(<AboutEditor about="Short text" onChange={vi.fn()} />)
    const textarea = screen.getByRole('textbox')
    fireEvent.blur(textarea)
    await waitFor(() => {
      expect(screen.queryByText('About section cannot exceed 2000 characters')).not.toBeInTheDocument()
    })
  })

  it('renders the About Me label', () => {
    render(<AboutEditor about="" onChange={vi.fn()} />)
    expect(screen.getByText('About Me')).toBeInTheDocument()
  })
})
