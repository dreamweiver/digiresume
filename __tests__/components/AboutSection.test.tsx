import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AboutSection } from '@/components/portfolio/sections/AboutSection'

describe('AboutSection', () => {
  it('renders the heading and bio when about text is provided', () => {
    render(<AboutSection about="I love building emerald aurora UIs." />)
    expect(screen.getByRole('heading', { name: 'About Me' })).toBeInTheDocument()
    expect(screen.getByText('I love building emerald aurora UIs.')).toBeInTheDocument()
  })

  it('renders nothing when about is an empty string', () => {
    const { container } = render(<AboutSection about="" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when about is whitespace only', () => {
    const { container } = render(<AboutSection about={'   \n\t  '} />)
    expect(container).toBeEmptyDOMElement()
  })
})
