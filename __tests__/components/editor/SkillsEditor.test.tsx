import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SkillsEditor } from '@/components/dashboard/editor/SkillsEditor'

describe('SkillsEditor', () => {
  it('renders existing skill chips', () => {
    render(<SkillsEditor skills={['TypeScript', 'React']} onChange={vi.fn()} />)
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('renders the Skills label and Add button', () => {
    render(<SkillsEditor skills={[]} onChange={vi.fn()} />)
    expect(screen.getByText('Skills')).toBeInTheDocument()
    expect(screen.getByText('Add')).toBeInTheDocument()
  })

  it('renders the input placeholder', () => {
    render(<SkillsEditor skills={[]} onChange={vi.fn()} />)
    expect(screen.getByPlaceholderText('Type a skill and press Enter')).toBeInTheDocument()
  })

  it('calls onChange with new skill when Add button is clicked', async () => {
    const onChange = vi.fn()
    render(<SkillsEditor skills={[]} onChange={onChange} />)
    const input = screen.getByPlaceholderText('Type a skill and press Enter')
    fireEvent.change(input, { target: { value: 'Node.js' } })
    fireEvent.click(screen.getByText('Add'))
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(['Node.js'])
    })
  })

  it('calls onChange when Enter key is pressed in input', async () => {
    const onChange = vi.fn()
    render(<SkillsEditor skills={[]} onChange={onChange} />)
    const input = screen.getByPlaceholderText('Type a skill and press Enter')
    fireEvent.change(input, { target: { value: 'Python' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(['Python'])
    })
  })

  it('clicking × on a chip removes the skill', () => {
    const onChange = vi.fn()
    render(<SkillsEditor skills={['TypeScript', 'React']} onChange={onChange} />)
    const removeButtons = screen.getAllByText('×')
    fireEvent.click(removeButtons[0])
    expect(onChange).toHaveBeenCalledWith(['React'])
  })

  it('does not add duplicate skills', async () => {
    const onChange = vi.fn()
    render(<SkillsEditor skills={['TypeScript']} onChange={onChange} />)
    const input = screen.getByPlaceholderText('Type a skill and press Enter')
    fireEvent.change(input, { target: { value: 'TypeScript' } })
    fireEvent.click(screen.getByText('Add'))
    await waitFor(() => {
      // onChange should not be called with a duplicate
      const calls = onChange.mock.calls
      const addedDuplicate = calls.some((call) => {
        const skills = call[0] as string[]
        return skills.filter((s) => s === 'TypeScript').length > 1
      })
      expect(addedDuplicate).toBe(false)
    })
  })

  it('does not add empty skill', async () => {
    const onChange = vi.fn()
    render(<SkillsEditor skills={[]} onChange={onChange} />)
    fireEvent.click(screen.getByText('Add'))
    await waitFor(() => {
      expect(onChange).not.toHaveBeenCalledWith(expect.arrayContaining(['']))
    })
  })

  it('does not add skill when a non-Enter key is pressed', () => {
    const onChange = vi.fn()
    render(<SkillsEditor skills={[]} onChange={onChange} />)
    const input = screen.getByPlaceholderText('Type a skill and press Enter')
    fireEvent.change(input, { target: { value: 'SomeSkill' } })
    fireEvent.keyDown(input, { key: 'a', code: 'KeyA' })
    // Should not have added the skill
    expect(screen.queryByText('SomeSkill')).not.toBeInTheDocument()
  })
})
