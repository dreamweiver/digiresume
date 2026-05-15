import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ProjectsEditor } from '@/components/dashboard/editor/ProjectsEditor'
import type { ProjectEntry } from '@/lib/portfolio-types'

const sampleProjects: ProjectEntry[] = [
  {
    name: 'My App',
    description: 'A cool app',
    techStack: ['React', 'TypeScript'],
    liveUrl: 'https://myapp.com',
    githubUrl: 'https://github.com/user/myapp',
  },
]

describe('ProjectsEditor', () => {
  it('renders existing project entries', () => {
    render(<ProjectsEditor projects={sampleProjects} onChange={vi.fn()} />)
    expect(screen.getByDisplayValue('My App')).toBeInTheDocument()
    expect(screen.getByText('Project 1')).toBeInTheDocument()
  })

  it('renders existing tech stack chips', () => {
    render(<ProjectsEditor projects={sampleProjects} onChange={vi.fn()} />)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('renders Remove button for existing projects', () => {
    render(<ProjectsEditor projects={sampleProjects} onChange={vi.fn()} />)
    expect(screen.getByText('Remove')).toBeInTheDocument()
  })

  it('Remove button removes the project entry', async () => {
    render(<ProjectsEditor projects={sampleProjects} onChange={vi.fn()} />)
    const removeBtn = screen.getByText('Remove')
    fireEvent.click(removeBtn)
    await waitFor(() => {
      expect(screen.queryByText('Project 1')).not.toBeInTheDocument()
    })
  })

  it('+ Add Project button adds a new entry', async () => {
    render(<ProjectsEditor projects={[]} onChange={vi.fn()} />)
    const addBtn = screen.getByText('+ Add Project')
    fireEvent.click(addBtn)
    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument()
    })
  })

  it('renders with empty projects array and shows Add button', () => {
    render(<ProjectsEditor projects={[]} onChange={vi.fn()} />)
    expect(screen.getByText('+ Add Project')).toBeInTheDocument()
    expect(screen.queryByText('Project 1')).not.toBeInTheDocument()
  })

  it('calls onChange on mount', async () => {
    const onChange = vi.fn()
    render(<ProjectsEditor projects={sampleProjects} onChange={onChange} />)
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
    })
  })

  it('adds tech stack item when Add button is clicked', async () => {
    const onChange = vi.fn()
    render(
      <ProjectsEditor
        projects={[{ name: 'Test', description: '', techStack: [], liveUrl: '', githubUrl: '' }]}
        onChange={onChange}
      />,
    )
    const techInput = screen.getByPlaceholderText('Add technology')
    fireEvent.change(techInput, { target: { value: 'Vue.js' } })
    const addTechBtn = screen.getByText('Add')
    fireEvent.click(addTechBtn)
    await waitFor(() => {
      expect(screen.getByText('Vue.js')).toBeInTheDocument()
    })
  })

  it('adds tech stack item when Enter is pressed in tech input', async () => {
    render(
      <ProjectsEditor
        projects={[{ name: 'Test', description: '', techStack: [], liveUrl: '', githubUrl: '' }]}
        onChange={vi.fn()}
      />,
    )
    const techInput = screen.getByPlaceholderText('Add technology')
    fireEvent.change(techInput, { target: { value: 'Svelte' } })
    fireEvent.keyDown(techInput, { key: 'Enter', code: 'Enter' })
    await waitFor(() => {
      expect(screen.getByText('Svelte')).toBeInTheDocument()
    })
  })

  it('removes tech stack chip when × is clicked', async () => {
    render(<ProjectsEditor projects={sampleProjects} onChange={vi.fn()} />)
    // find the × button next to 'React'
    const techChips = screen.getAllByText('×')
    fireEvent.click(techChips[0])
    await waitFor(() => {
      expect(screen.queryByText('React')).not.toBeInTheDocument()
    })
  })

  it('renders Name, Description, Live URL and GitHub URL labels', () => {
    render(<ProjectsEditor projects={sampleProjects} onChange={vi.fn()} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Live URL')).toBeInTheDocument()
    expect(screen.getByText('GitHub URL')).toBeInTheDocument()
  })

  it('shows project name validation error when name field is blurred empty', async () => {
    render(
      <ProjectsEditor
        projects={[{ name: '', description: '', techStack: [], liveUrl: '', githubUrl: '' }]}
        onChange={vi.fn()}
      />,
    )
    const inputs = screen.getAllByRole('textbox')
    // name is the first input
    fireEvent.blur(inputs[0])
    await waitFor(() => {
      expect(screen.getByText('Project name is required')).toBeInTheDocument()
    })
  })

  it('shows liveUrl validation error when liveUrl is invalid and blurred', async () => {
    render(
      <ProjectsEditor
        projects={[
          { name: 'Test', description: '', techStack: [], liveUrl: 'invalid-url', githubUrl: '' },
        ]}
        onChange={vi.fn()}
      />,
    )
    // Live URL is the 3rd input (Name, Description textarea, Live URL)
    const inputs = document.querySelectorAll('input')
    const liveUrlInput = Array.from(inputs).find((input) => input.value === 'invalid-url')
    if (liveUrlInput) {
      fireEvent.blur(liveUrlInput)
      await waitFor(() => {
        expect(screen.getByText('Must be a valid URL')).toBeInTheDocument()
      })
    }
  })

  it('does not add empty tech item', async () => {
    render(
      <ProjectsEditor
        projects={[{ name: 'Test', description: '', techStack: [], liveUrl: '', githubUrl: '' }]}
        onChange={vi.fn()}
      />,
    )
    const addTechBtn = screen.getByText('Add')
    fireEvent.click(addTechBtn)
    // No tech chips should appear
    expect(screen.queryByText('×')).not.toBeInTheDocument()
  })

  it('does not add duplicate tech item', async () => {
    render(
      <ProjectsEditor
        projects={[
          { name: 'Test', description: '', techStack: ['React'], liveUrl: '', githubUrl: '' },
        ]}
        onChange={vi.fn()}
      />,
    )
    const techInput = screen.getByPlaceholderText('Add technology')
    fireEvent.change(techInput, { target: { value: 'React' } })
    fireEvent.click(screen.getByText('Add'))
    await waitFor(() => {
      // Should still have exactly one React chip
      const reactElements = screen.getAllByText('React')
      expect(reactElements).toHaveLength(1)
    })
  })

  it('does not add tech item when non-Enter key is pressed', async () => {
    render(
      <ProjectsEditor
        projects={[{ name: 'Test', description: '', techStack: [], liveUrl: '', githubUrl: '' }]}
        onChange={vi.fn()}
      />,
    )
    const techInput = screen.getByPlaceholderText('Add technology')
    fireEvent.change(techInput, { target: { value: 'SomeLib' } })
    fireEvent.keyDown(techInput, { key: 'a', code: 'KeyA' })
    // Tech chip should NOT appear since we didn't press Enter
    expect(screen.queryByText('SomeLib')).not.toBeInTheDocument()
  })

  it('shows githubUrl validation error when githubUrl is invalid and blurred', async () => {
    render(
      <ProjectsEditor
        projects={[
          { name: 'Test', description: '', techStack: [], liveUrl: '', githubUrl: 'not-valid' },
        ]}
        onChange={vi.fn()}
      />,
    )
    const inputs = document.querySelectorAll('input')
    const githubInput = Array.from(inputs).find((input) => input.value === 'not-valid')
    if (githubInput) {
      fireEvent.blur(githubInput)
      await waitFor(() => {
        expect(screen.getByText('Must be a valid URL')).toBeInTheDocument()
      })
    }
  })
})
