'use client'
import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { experienceArraySchema } from '@/lib/portfolio-schemas'
import type { ExperienceEntry } from '@/lib/portfolio-types'

const formSchema = z.object({ experience: experienceArraySchema })
type FormData = z.infer<typeof formSchema>

interface Props {
  experience: ExperienceEntry[]
  onChange: (experience: ExperienceEntry[]) => void
}

const emptyEntry = (): ExperienceEntry => ({
  company: '',
  role: '',
  startDate: '',
  endDate: '',
  description: '',
})

export function ExperienceEditor({ experience, onChange }: Props) {
  const {
    register,
    control,
    watch,
    reset,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: { experience },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'experience' })
  const values = watch()

  useEffect(() => {
    reset({ experience })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(experience)])

  useEffect(() => {
    onChange(values.experience ?? [])
    // Re-run cross-entry validation as dates change so overlap errors update live.
    trigger('experience')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)])

  return (
    <div className="space-y-3">
      {fields.map((field, i) => (
        <div key={field.id} className="border border-white/20 rounded-lg p-4 space-y-3 bg-white/10">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-700 text-sm">Experience {i + 1}</h4>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              aria-label={`Delete experience ${i + 1}`}
              onClick={() => remove(i)}
              className="text-[#52525b] hover:text-red-500 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Company</Label>
              <Input {...register(`experience.${i}.company`)} />
              {errors.experience?.[i]?.company && (
                <p className="text-red-500 text-xs mt-1">{errors.experience[i].company?.message}</p>
              )}
            </div>
            <div>
              <Label>Role</Label>
              <Input {...register(`experience.${i}.role`)} />
              {errors.experience?.[i]?.role && (
                <p className="text-red-500 text-xs mt-1">{errors.experience[i].role?.message}</p>
              )}
            </div>
            <div>
              <Label>Start Date</Label>
              <Input placeholder="January 2020" {...register(`experience.${i}.startDate`)} />
              {errors.experience?.[i]?.startDate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.experience[i].startDate?.message}
                </p>
              )}
            </div>
            <div>
              <Label>End Date</Label>
              <Input placeholder="Present" {...register(`experience.${i}.endDate`)} />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={3} {...register(`experience.${i}.description`)} />
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => append(emptyEntry())}
        className="border-[#1f1f1f] text-[#00e599] hover:border-[#00e599] hover:text-[#00e599] transition-colors duration-200 bg-transparent"
      >
        + Add Experience
      </Button>
    </div>
  )
}
