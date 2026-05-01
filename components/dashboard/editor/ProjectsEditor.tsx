'use client'
import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { projectEntrySchema } from '@/lib/portfolio-schemas'
import type { ProjectEntry } from '@/lib/portfolio-types'

const formSchema = z.object({ projects: z.array(projectEntrySchema) })
type FormData = z.infer<typeof formSchema>

interface Props { projects: ProjectEntry[]; onChange: (projects: ProjectEntry[]) => void }

const emptyProject = (): ProjectEntry => ({ name: '', description: '', techStack: [], liveUrl: '', githubUrl: '' })

export function ProjectsEditor({ projects, onChange }: Props) {
  const [techInputs, setTechInputs] = useState<string[]>(projects.map(() => ''))

  const {
    register,
    control,
    watch,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: { projects },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'projects' })
  const values = watch()

  useEffect(() => {
    reset({ projects })
    setTechInputs(projects.map(() => ''))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(projects)])

  useEffect(() => {
    onChange(
      (values.projects ?? []).map((p) => ({
        name: p.name ?? '',
        description: p.description ?? '',
        techStack: p.techStack ?? [],
        liveUrl: p.liveUrl ?? '',
        githubUrl: p.githubUrl ?? '',
      }))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)])

  function addTech(index: number) {
    const tech = techInputs[index]?.trim()
    if (!tech) return
    const current = getValues(`projects.${index}.techStack`) ?? []
    if (!current.includes(tech)) {
      setValue(`projects.${index}.techStack`, [...current, tech], { shouldDirty: true })
    }
    setTechInputs((prev) => prev.map((t, i) => (i === index ? '' : t)))
  }

  function removeTech(projectIndex: number, tech: string) {
    const current = getValues(`projects.${projectIndex}.techStack`) ?? []
    setValue(`projects.${projectIndex}.techStack`, current.filter((t) => t !== tech), { shouldDirty: true })
  }

  return (
    <div className="space-y-6">
      {fields.map((field, i) => {
        const techStack = (values.projects?.[i]?.techStack) ?? []
        return (
          <div key={field.id} className="border border-[#1f1f1f] rounded-lg p-4 space-y-3 bg-[#161616]">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-[#a1a1aa] text-sm">Project {i + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => {
                  remove(i)
                  setTechInputs((prev) => prev.filter((_, idx) => idx !== i))
                }}
                className="text-[#52525b] hover:text-red-400"
              >
                Remove
              </Button>
            </div>
            <div>
              <Label>Name</Label>
              <Input {...register(`projects.${i}.name`)} />
              {errors.projects?.[i]?.name && (
                <p className="text-red-500 text-xs mt-1">{errors.projects[i].name?.message}</p>
              )}
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={2} {...register(`projects.${i}.description`)} />
            </div>
            <div>
              <Label>Tech Stack</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={techInputs[i] ?? ''}
                  placeholder="Add technology"
                  onChange={(e) =>
                    setTechInputs((prev) => prev.map((t, idx) => (idx === i ? e.target.value : t)))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTech(i)
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={() => addTech(i)} className="border-[#1f1f1f] text-[#00e599] hover:border-[#00e599] hover:text-[#00e599] transition-colors duration-200 bg-transparent">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="bg-[#161616] border border-[#00e599] text-[#00e599] px-2 py-1 rounded text-sm flex items-center gap-1"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTech(i, tech)}
                      className="text-[#00e599] opacity-60 hover:opacity-100 hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Live URL</Label>
                <Input {...register(`projects.${i}.liveUrl`)} />
                {errors.projects?.[i]?.liveUrl && (
                  <p className="text-red-500 text-xs mt-1">{errors.projects[i].liveUrl?.message}</p>
                )}
              </div>
              <div>
                <Label>GitHub URL</Label>
                <Input {...register(`projects.${i}.githubUrl`)} />
                {errors.projects?.[i]?.githubUrl && (
                  <p className="text-red-500 text-xs mt-1">{errors.projects[i].githubUrl?.message}</p>
                )}
              </div>
            </div>
          </div>
        )
      })}
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          append(emptyProject())
          setTechInputs((prev) => [...prev, ''])
        }}
        className="border-[#1f1f1f] text-[#00e599] hover:border-[#00e599] hover:text-[#00e599] transition-colors duration-200 bg-transparent"
      >
        + Add Project
      </Button>
    </div>
  )
}
