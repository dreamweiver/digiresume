import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ExperienceEditor } from '@/components/dashboard/editor/ExperienceEditor'
import type { ExperienceEntry } from '@/lib/portfolio-types'

const sampleExperience: ExperienceEntry[] = [
  {
    company: 'Acme Corp',
    role: 'Engineer',
    startDate: '2020-01',
    endDate: '2022-01',
    description: 'Built things',
  },
]

describe('ExperienceEditor', () => {
  it('renders existing experience entries', () => {
    render(<ExperienceEditor experience={sampleExperience} onChange={vi.fn()} />)
    expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Engineer')).toBeInTheDocument()
    expect(screen.getByText('Experience 1')).toBeInTheDocument()
  })

  it('renders Remove button for existing entries', () => {
    render(<ExperienceEditor experience={sampleExperience} onChange={vi.fn()} />)
    expect(screen.getByText('Remove')).toBeInTheDocument()
  })

  it('Remove button removes entry', async () => {
    render(<ExperienceEditor experience={sampleExperience} onChange={vi.fn()} />)
    const removeBtn = screen.getByText('Remove')
    fireEvent.click(removeBtn)
    await waitFor(() => {
      expect(screen.queryByText('Experience 1')).not.toBeInTheDocument()
    })
  })

  it('+ Add Experience button adds a new entry', async () => {
    render(<ExperienceEditor experience={[]} onChange={vi.fn()} />)
    const addBtn = screen.getByText('+ Add Experience')
    fireEvent.click(addBtn)
    await waitFor(() => {
      expect(screen.getByText('Experience 1')).toBeInTheDocument()
    })
  })

  it('calls onChange when editing company field', async () => {
    const onChange = vi.fn()
    render(<ExperienceEditor experience={sampleExperience} onChange={onChange} />)
    const companyInput = screen.getByDisplayValue('Acme Corp')
    fireEvent.change(companyInput, { target: { value: 'New Company' } })
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
    })
  })

  it('renders with empty experience array and shows Add button', () => {
    render(<ExperienceEditor experience={[]} onChange={vi.fn()} />)
    expect(screen.getByText('+ Add Experience')).toBeInTheDocument()
    expect(screen.queryByText('Experience 1')).not.toBeInTheDocument()
  })

  it('calls onChange on mount', async () => {
    const onChange = vi.fn()
    render(<ExperienceEditor experience={sampleExperience} onChange={onChange} />)
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
    })
  })

  it('shows company validation error when company field is blurred empty', async () => {
    render(
      <ExperienceEditor
        experience={[{ company: '', role: '', startDate: '', endDate: '', description: '' }]}
        onChange={vi.fn()}
      />,
    )
    const companyInputs = screen.getAllByRole('textbox')
    // company is first input
    fireEvent.blur(companyInputs[0])
    await waitFor(() => {
      expect(screen.getByText('Company is required')).toBeInTheDocument()
    })
  })

  it('shows role validation error when role field is blurred empty', async () => {
    render(
      <ExperienceEditor
        experience={[{ company: '', role: '', startDate: '', endDate: '', description: '' }]}
        onChange={vi.fn()}
      />,
    )
    const companyInputs = screen.getAllByRole('textbox')
    // role is second input
    fireEvent.blur(companyInputs[1])
    await waitFor(() => {
      expect(screen.getByText('Role is required')).toBeInTheDocument()
    })
  })
})
