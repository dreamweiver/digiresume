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

  it('renders a delete icon for each entry', () => {
    render(<ExperienceEditor experience={sampleExperience} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Delete experience 1')).toBeInTheDocument()
  })

  it('delete icon removes the entry', async () => {
    render(<ExperienceEditor experience={sampleExperience} onChange={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Delete experience 1'))
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

  it('flags overlapping date ranges across entries', async () => {
    render(
      <ExperienceEditor
        experience={[
          {
            company: 'A',
            role: 'Eng',
            startDate: 'January 2020',
            endDate: 'January 2023',
            description: '',
          },
          {
            company: 'B',
            role: 'Eng',
            startDate: 'January 2022',
            endDate: 'January 2024',
            description: '',
          },
        ]}
        onChange={vi.fn()}
      />,
    )
    await waitFor(() => {
      expect(screen.getByText(/overlaps with Experience 2/)).toBeInTheDocument()
      expect(screen.getByText(/overlaps with Experience 1/)).toBeInTheDocument()
    })
  })

  it('does NOT flag back-to-back entries (one ends the same month the next starts)', async () => {
    render(
      <ExperienceEditor
        experience={[
          {
            company: 'A',
            role: 'Eng',
            startDate: 'January 2020',
            endDate: 'January 2022',
            description: '',
          },
          {
            company: 'B',
            role: 'Eng',
            startDate: 'January 2022',
            endDate: 'January 2024',
            description: '',
          },
        ]}
        onChange={vi.fn()}
      />,
    )
    // Wait a tick for live validation to settle, then assert no overlap message.
    await waitFor(() => {
      expect(screen.getAllByText(/Experience \d/)).toBeTruthy()
    })
    expect(screen.queryByText(/overlaps with Experience/)).not.toBeInTheDocument()
  })
})
