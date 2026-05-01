'use client'
import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { experienceEntrySchema } from '@/lib/portfolio-schemas'
import type { ExperienceEntry } from '@/lib/portfolio-types'

const formSchema = z.object({ experience: z.array(experienceEntrySchema) })
type FormData = z.infer<typeof formSchema>

interface Props { experience: ExperienceEntry[]; onChange: (experience: ExperienceEntry[]) => void }

const emptyEntry = (): ExperienceEntry => ({ company: '', role: '', startDate: '', endDate: '', description: '' })

export function ExperienceEditor({ experience, onChange }: Props) {
  const {
    register,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)])

  return (
    <div className="space-y-6">
      {fields.map((field, i) => (
        <div key={field.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-slate-700">Experience {i + 1}</h4>
            <Button variant="ghost" size="sm" type="button" onClick={() => remove(i)}>Remove</Button>
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
              <Input placeholder="2022-01" {...register(`experience.${i}.startDate`)} />
            </div>
            <div>
              <Label>End Date</Label>
              <Input placeholder="present" {...register(`experience.${i}.endDate`)} />
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
      >
        + Add Experience
      </Button>
    </div>
  )
}
