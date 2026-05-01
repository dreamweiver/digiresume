'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const aboutSchema = z.object({ about: z.string().max(2000, 'About section cannot exceed 2000 characters') })
type AboutFormData = z.infer<typeof aboutSchema>

interface Props { about: string; onChange: (about: string) => void }

export function AboutEditor({ about, onChange }: Props) {
  const {
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm<AboutFormData>({
    resolver: zodResolver(aboutSchema),
    mode: 'onBlur',
    defaultValues: { about },
  })

  const aboutValue = watch('about')

  useEffect(() => {
    reset({ about })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [about])

  useEffect(() => {
    onChange(aboutValue ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aboutValue])

  return (
    <div>
      <Label>About Me</Label>
      <Textarea rows={5} {...register('about')} />
      {errors.about && <p className="text-red-500 text-xs mt-1">{errors.about.message}</p>}
    </div>
  )
}
