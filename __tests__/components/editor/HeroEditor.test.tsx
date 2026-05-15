import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { HeroEditor } from '@/components/dashboard/editor/HeroEditor'
import type { HeroData } from '@/lib/portfolio-types'

const emptyHero: HeroData = { name: '', title: '', bio: '', profilePhoto: null }
const filledHero: HeroData = {
  name: 'Jane Doe',
  title: 'Engineer',
  bio: 'My bio',
  profilePhoto: null,
}

describe('HeroEditor', () => {
  it('renders with initial values', () => {
    render(<HeroEditor hero={filledHero} onChange={vi.fn()} />)
    expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Engineer')).toBeInTheDocument()
    expect(screen.getByDisplayValue('My bio')).toBeInTheDocument()
  })

  it('renders all labels', () => {
    render(<HeroEditor hero={emptyHero} onChange={vi.fn()} />)
    expect(screen.getByText('Full Name')).toBeInTheDocument()
    expect(screen.getByText('Professional Title')).toBeInTheDocument()
    expect(screen.getByText('Bio')).toBeInTheDocument()
  })

  it('calls onChange when name is changed', async () => {
    const onChange = vi.fn()
    render(<HeroEditor hero={filledHero} onChange={onChange} />)
    const nameInput = screen.getByDisplayValue('Jane Doe')
    fireEvent.change(nameInput, { target: { value: 'New Name' } })
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
    })
  })

  it('shows name validation error when name is blurred empty', async () => {
    render(<HeroEditor hero={emptyHero} onChange={vi.fn()} />)
    const inputs = screen.getAllByRole('textbox')
    fireEvent.blur(inputs[0])
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })
  })

  it('shows title validation error when title is blurred empty', async () => {
    render(<HeroEditor hero={emptyHero} onChange={vi.fn()} />)
    const inputs = screen.getAllByRole('textbox')
    fireEvent.blur(inputs[1])
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })
  })

  it('shows bio validation error when bio is blurred empty', async () => {
    render(<HeroEditor hero={emptyHero} onChange={vi.fn()} />)
    const inputs = screen.getAllByRole('textbox')
    // bio is the last input (textarea)
    fireEvent.blur(inputs[inputs.length - 1])
    await waitFor(() => {
      expect(screen.getByText('Bio is required')).toBeInTheDocument()
    })
  })

  it('calls onChange on mount', async () => {
    const onChange = vi.fn()
    render(<HeroEditor hero={filledHero} onChange={onChange} />)
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
    })
  })
})
