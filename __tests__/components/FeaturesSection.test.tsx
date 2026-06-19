import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { FeaturesSection } from '@/components/landing/FeaturesSection'

describe('FeaturesSection', () => {
  it('renders the section heading', () => {
    render(<FeaturesSection />)
    expect(screen.getByText(/Everything you need/)).toBeInTheDocument()
  })

  it('renders all three feature cards with their titles', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('AI-Powered Parsing')).toBeInTheDocument()
    expect(screen.getByText('Instant Portfolio')).toBeInTheDocument()
    expect(screen.getByText('Always Up to Date')).toBeInTheDocument()
  })

  it('renders the numbered prefix for each feature', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText('03')).toBeInTheDocument()
  })
})
