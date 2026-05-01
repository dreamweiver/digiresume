'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const skillInputSchema = z.object({ skill: z.string().min(1, 'Skill cannot be empty') })
type SkillInputData = z.infer<typeof skillInputSchema>

interface Props { skills: string[]; onChange: (skills: string[]) => void }

export function SkillsEditor({ skills, onChange }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SkillInputData>({
    resolver: zodResolver(skillInputSchema),
    mode: 'onBlur',
    defaultValues: { skill: '' },
  })

  function handleAddSkill({ skill }: SkillInputData) {
    const trimmed = skill.trim()
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed])
    }
    reset({ skill: '' })
  }

  return (
    <div className="space-y-3">
      <Label>Skills</Label>
      <form onSubmit={handleSubmit(handleAddSkill)}>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              {...register('skill')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSubmit(handleAddSkill)()
                }
              }}
              placeholder="Type a skill and press Enter"
            />
            {errors.skill && (
              <p className="text-red-500 text-xs mt-1">{errors.skill.message}</p>
            )}
          </div>
          <Button type="submit" variant="outline">Add</Button>
        </div>
      </form>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
          >
            {skill}
            <button
              type="button"
              onClick={() => onChange(skills.filter((s) => s !== skill))}
              className="text-slate-400 hover:text-red-500 ml-1"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
