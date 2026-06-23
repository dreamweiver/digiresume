import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SkillsSection } from '@/components/portfolio/sections/SkillsSection'

describe('SkillsSection', () => {
  it('renders all skills as pills', () => {
    render(<SkillsSection skills={['TypeScript', 'React', 'Node.js']} />)
    expect(screen.getByRole('heading', { name: 'Skills' })).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
  })

  it('renders nothing when skills is empty', () => {
    const { container } = render(<SkillsSection skills={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('uses each skill string as the React key (no duplicate render)', () => {
    render(<SkillsSection skills={['Go']} />)
    expect(screen.getAllByText('Go')).toHaveLength(1)
  })
})
