// app/api/portfolio/publish/route.ts
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { portfolios } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, userId))
      .limit(1)

    if (result.length === 0) {
      return NextResponse.json({ error: 'No portfolio found' }, { status: 404 })
    }

    await db
      .update(portfolios)
      .set({ status: 'published', publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(portfolios.userId, userId))

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to publish portfolio' }, { status: 500 })
  }
}
