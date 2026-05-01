'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { socialLinksSchema, type SocialLinksFormData } from '@/lib/portfolio-schemas'
import type { SocialLinks } from '@/lib/portfolio-types'

interface Props { socialLinks: SocialLinks; onChange: (links: SocialLinks) => void }

export function SocialEditor({ socialLinks, onChange }: Props) {
  const {
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm<SocialLinksFormData>({
    resolver: zodResolver(socialLinksSchema),
    mode: 'onBlur',
    defaultValues: socialLinks,
  })

  const values = watch()

  useEffect(() => {
    reset(socialLinks)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(socialLinks)])

  useEffect(() => {
    onChange({
      github: values.github ?? '',
      linkedin: values.linkedin ?? '',
      twitter: values.twitter ?? '',
      website: values.website ?? '',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)])

  return (
    <div className="space-y-4">
      {(['github', 'linkedin', 'twitter', 'website'] as const).map((key) => (
        <div key={key}>
          <Label className="capitalize">{key}</Label>
          <Input
            {...register(key)}
            placeholder={`https://${key === 'website' ? 'yourwebsite.com' : `${key}.com/username`}`}
          />
          {errors[key] && (
            <p className="text-red-500 text-xs mt-1">{errors[key]?.message}</p>
          )}
        </div>
      ))}
    </div>
  )
}
