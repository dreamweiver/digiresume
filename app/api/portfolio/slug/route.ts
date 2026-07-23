// app/api/portfolio/slug/route.ts
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { normalizeSlug, validateSlug } from '@/lib/slug'
import { and, eq, ne } from 'drizzle-orm'

/**
 * Returns true if `slug` is free — i.e. no OTHER user already owns it.
 * The caller's own current slug counts as available so they can re-save it.
 */
async function isSlugAvailable(slug: string, userId: string): Promise<boolean> {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.usernameSlug, slug), ne(users.id, userId)))
    .limit(1)
  return rows.length === 0
}

// GET /api/portfolio/slug?slug=<candidate> → { available, error? }
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const raw = req.nextUrl.searchParams.get('slug') ?? ''
  const slug = normalizeSlug(raw)

  const validation = validateSlug(slug)
  if (!validation.valid) {
    return NextResponse.json({ available: false, slug, error: validation.error })
  }

  try {
    const available = await isSlugAvailable(slug, userId)
    return NextResponse.json({
      available,
      slug,
      error: available ? undefined : 'That URL is already taken',
    })
  } catch {
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 })
  }
}

// POST /api/portfolio/slug { slug } → { success, slug } | 409 taken | 400 invalid
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let slug: string
  try {
    const body = await req.json()
    slug = normalizeSlug(typeof body?.slug === 'string' ? body.slug : '')
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const validation = validateSlug(slug)
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  try {
    if (!(await isSlugAvailable(slug, userId))) {
      return NextResponse.json({ error: 'That URL is already taken' }, { status: 409 })
    }

    await db.update(users).set({ usernameSlug: slug }).where(eq(users.id, userId))
    return NextResponse.json({ success: true, slug })
  } catch (err) {
    // The unique constraint is the final guard against a check-then-set race.
    if (err instanceof Error && /unique|duplicate/i.test(err.message)) {
      return NextResponse.json({ error: 'That URL is already taken' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to update URL' }, { status: 500 })
  }
}
