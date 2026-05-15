import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { EducationSection } from '@/components/portfolio/sections/EducationSection'

describe('EducationSection', () => {
  it('returns null when education array is empty', () => {
    const { container } = render(<EducationSection education={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders grade when provided', () => {
    render(
      <EducationSection
        education={[
          {
            institution: 'MIT',
            degree: 'B.S. Computer Science',
            startDate: '2016',
            endDate: '2020',
            grade: '3.9 GPA',
          },
        ]}
      />,
    )
    expect(screen.getByText('3.9 GPA')).toBeInTheDocument()
  })

  it('does not render grade element when grade is absent', () => {
    render(
      <EducationSection
        education={[
          {
            institution: 'MIT',
            degree: 'B.S. Computer Science',
            startDate: '2016',
            endDate: '2020',
          },
        ]}
      />,
    )
    expect(screen.queryByText(/GPA|CGPA|%/)).not.toBeInTheDocument()
  })
})
