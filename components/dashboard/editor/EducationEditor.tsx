'use client'
import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { educationEntrySchema } from '@/lib/portfolio-schemas'
import type { EducationEntry } from '@/lib/portfolio-types'

const formSchema = z.object({ education: z.array(educationEntrySchema) })
type FormData = z.infer<typeof formSchema>

interface Props {
  education: EducationEntry[]
  onChange: (education: EducationEntry[]) => void
}

const emptyEntry = (): EducationEntry => ({
  institution: '',
  degree: '',
  startDate: '',
  endDate: '',
})

export function EducationEditor({ education, onChange }: Props) {
  const {
    register,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: { education },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'education' })
  const values = watch()

  useEffect(() => {
    reset({ education })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(education)])

  useEffect(() => {
    onChange(values.education ?? [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)])

  return (
    <div className="space-y-6">
      {fields.map((field, i) => (
        <div
          key={field.id}
          className="border border-[#1f1f1f] rounded-lg p-4 space-y-3 bg-[#161616]"
        >
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-[#a1a1aa] text-sm">Education {i + 1}</h4>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => remove(i)}
              className="text-[#52525b] hover:text-red-400"
            >
              Remove
            </Button>
          </div>
          <div>
            <Label>Institution</Label>
            <Input {...register(`education.${i}.institution`)} />
            {errors.education?.[i]?.institution && (
              <p className="text-red-500 text-xs mt-1">
                {errors.education[i].institution?.message}
              </p>
            )}
          </div>
          <div>
            <Label>Degree</Label>
            <Input {...register(`education.${i}.degree`)} />
            {errors.education?.[i]?.degree && (
              <p className="text-red-500 text-xs mt-1">{errors.education[i].degree?.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Year</Label>
              <Input placeholder="2016" {...register(`education.${i}.startDate`)} />
            </div>
            <div>
              <Label>End Year</Label>
              <Input placeholder="2020" {...register(`education.${i}.endDate`)} />
            </div>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => append(emptyEntry())}
        className="border-[#1f1f1f] text-[#00e599] hover:border-[#00e599] hover:text-[#00e599] transition-colors duration-200 bg-transparent"
      >
        + Add Education
      </Button>
    </div>
  )
}
