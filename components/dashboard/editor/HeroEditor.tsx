'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { heroSchema } from '@/lib/portfolio-schemas'
import type { HeroData, SocialLinks } from '@/lib/portfolio-types'
import { ProfilePhotoPicker } from './ProfilePhotoPicker'

// Form only controls the three editable fields; profilePhoto is pass-through
const heroFormSchema = heroSchema.pick({ name: true, title: true, bio: true })
type HeroFormData = z.infer<typeof heroFormSchema>

interface Props {
  hero: HeroData
  socialLinks: SocialLinks
  onChange: (hero: HeroData) => void
}

export function HeroEditor({ hero, socialLinks, onChange }: Props) {
  const {
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm<HeroFormData>({
    resolver: zodResolver(heroFormSchema),
    mode: 'onBlur',
    defaultValues: {
      name: hero.name,
      title: hero.title,
      bio: hero.bio,
    },
  })

  const values = watch()

  // Re-sync form when hero prop changes externally
  useEffect(() => {
    reset({
      name: hero.name,
      title: hero.title,
      bio: hero.bio,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(hero)])

  // Propagate form changes to parent; profilePhoto is passed through unchanged
  useEffect(() => {
    onChange({
      name: values.name ?? '',
      title: values.title ?? '',
      bio: values.bio ?? '',
      profilePhoto: hero.profilePhoto,
      gender: hero.gender ?? 'unknown',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify({ name: values.name, title: values.title, bio: values.bio })])

  return (
    <div className="border border-white/20 rounded-lg p-4 space-y-4 bg-white/10">
      <div>
        <Label>Full Name</Label>
        <Input {...register('name')} />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <Label>Professional Title</Label>
        <Input {...register('title')} />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <Label>Bio</Label>
        <Textarea rows={3} {...register('bio')} />
        {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>}
      </div>
      <ProfilePhotoPicker
        hero={hero}
        socialLinks={socialLinks}
        onPhotoChange={(profilePhoto) =>
          onChange({
            name: values.name ?? hero.name,
            title: values.title ?? hero.title,
            bio: values.bio ?? hero.bio,
            profilePhoto,
            gender: hero.gender ?? 'unknown',
          })
        }
      />
    </div>
  )
}
