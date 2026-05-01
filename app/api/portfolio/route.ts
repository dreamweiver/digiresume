// app/api/portfolio/route.ts
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { portfolios, users } from '@/lib/db/schema'
import { encrypt, decrypt } from '@/lib/crypto'
import { eq } from 'drizzle-orm'
import type { PortfolioData } from '@/lib/portfolio-types'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const [portfolioResult, userResult] = await Promise.all([
      db.select().from(portfolios).where(eq(portfolios.userId, userId)).limit(1),
      db.select().from(users).where(eq(users.id, userId)).limit(1),
    ])

    if (portfolioResult.length === 0) return NextResponse.json({ portfolio: null })

    const portfolio = portfolioResult[0]
    let decryptedData: PortfolioData | null = null
    if (portfolio.portfolioData) {
      try {
        decryptedData = JSON.parse(decrypt(portfolio.portfolioData)) as PortfolioData
      } catch {
        return NextResponse.json({ error: 'Failed to read portfolio data' }, { status: 500 })
      }
    }

    return NextResponse.json({
      portfolio: {
        ...portfolio,
        portfolioData: decryptedData,
        usernameSlug: userResult[0]?.usernameSlug ?? '',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let portfolioData: PortfolioData
  try {
    const body = await req.json()
    if (!body?.portfolioData || typeof body.portfolioData !== 'object') {
      return NextResponse.json({ error: 'Invalid portfolio data' }, { status: 400 })
    }
    portfolioData = body.portfolioData as PortfolioData
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const encryptedData = encrypt(JSON.stringify(portfolioData))

  try {
    await db
      .insert(portfolios)
      .values({ userId, portfolioData: encryptedData, status: 'draft' })
      .onConflictDoUpdate({
        target: portfolios.userId,
        set: { portfolioData: encryptedData, updatedAt: new Date() },
      })
  } catch {
    return NextResponse.json({ error: 'Failed to save portfolio' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
