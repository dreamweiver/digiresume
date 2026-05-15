import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { EducationEditor } from '@/components/dashboard/editor/EducationEditor'
import type { EducationEntry } from '@/lib/portfolio-types'

const sampleEducation: EducationEntry[] = [
  { institution: 'MIT', degree: 'B.S. Computer Science', startDate: '2016', endDate: '2020' },
]

describe('EducationEditor', () => {
  it('renders existing education entries', () => {
    render(<EducationEditor education={sampleEducation} onChange={vi.fn()} />)
    expect(screen.getByDisplayValue('MIT')).toBeInTheDocument()
    expect(screen.getByDisplayValue('B.S. Computer Science')).toBeInTheDocument()
    expect(screen.getByText('Education 1')).toBeInTheDocument()
  })

  it('renders Remove button for existing entries', () => {
    render(<EducationEditor education={sampleEducation} onChange={vi.fn()} />)
    expect(screen.getByText('Remove')).toBeInTheDocument()
  })

  it('Remove button removes the entry', async () => {
    render(<EducationEditor education={sampleEducation} onChange={vi.fn()} />)
    const removeBtn = screen.getByText('Remove')
    fireEvent.click(removeBtn)
    await waitFor(() => {
      expect(screen.queryByText('Education 1')).not.toBeInTheDocument()
    })
  })

  it('+ Add Education button adds a new entry', async () => {
    render(<EducationEditor education={[]} onChange={vi.fn()} />)
    const addBtn = screen.getByText('+ Add Education')
    fireEvent.click(addBtn)
    await waitFor(() => {
      expect(screen.getByText('Education 1')).toBeInTheDocument()
    })
  })

  it('renders with empty education array and shows Add button', () => {
    render(<EducationEditor education={[]} onChange={vi.fn()} />)
    expect(screen.getByText('+ Add Education')).toBeInTheDocument()
    expect(screen.queryByText('Education 1')).not.toBeInTheDocument()
  })

  it('calls onChange on mount', async () => {
    const onChange = vi.fn()
    render(<EducationEditor education={sampleEducation} onChange={onChange} />)
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
    })
  })

  it('calls onChange when editing institution field', async () => {
    const onChange = vi.fn()
    render(<EducationEditor education={sampleEducation} onChange={onChange} />)
    const institutionInput = screen.getByDisplayValue('MIT')
    fireEvent.change(institutionInput, { target: { value: 'Stanford' } })
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
    })
  })

  it('renders Institution and Degree labels', () => {
    render(<EducationEditor education={sampleEducation} onChange={vi.fn()} />)
    expect(screen.getByText('Institution')).toBeInTheDocument()
    expect(screen.getByText('Degree')).toBeInTheDocument()
  })

  it('shows institution validation error when institution field is blurred empty', async () => {
    render(
      <EducationEditor
        education={[{ institution: '', degree: '', startDate: '', endDate: '' }]}
        onChange={vi.fn()}
      />,
    )
    const inputs = screen.getAllByRole('textbox')
    fireEvent.blur(inputs[0])
    await waitFor(() => {
      expect(screen.getByText('Institution is required')).toBeInTheDocument()
    })
  })

  it('shows degree validation error when degree field is blurred empty', async () => {
    render(
      <EducationEditor
        education={[{ institution: '', degree: '', startDate: '', endDate: '' }]}
        onChange={vi.fn()}
      />,
    )
    const inputs = screen.getAllByRole('textbox')
    fireEvent.blur(inputs[1])
    await waitFor(() => {
      expect(screen.getByText('Degree is required')).toBeInTheDocument()
    })
  })
})
