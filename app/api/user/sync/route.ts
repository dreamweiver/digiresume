// app/api/user/sync/route.ts
import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { generateSlug } from '@/lib/slug'
import { eq } from 'drizzle-orm'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (existing.length > 0) {
    return NextResponse.json({ user: existing[0] })
  }

  const clerkUser = await currentUser()
  if (!clerkUser) {
    return NextResponse.json({ error: 'Could not fetch user profile' }, { status: 500 })
  }
  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ')
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''
  const usernameSlug = generateSlug(fullName)

  await db
    .insert(users)
    .values({ id: userId, usernameSlug, email })
    .onConflictDoNothing({ target: users.id })

  const [row] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  return NextResponse.json({ user: row })
}
