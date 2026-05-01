import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { portfolios, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { decrypt } from '@/lib/crypto'
import type { PortfolioData } from '@/lib/portfolio-types'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [portfolioRows, userRows] = await Promise.all([
    db.select().from(portfolios).where(eq(portfolios.userId, userId)).limit(1),
    db.select().from(users).where(eq(users.id, userId)).limit(1),
  ])

  const portfolio = portfolioRows[0] ?? null
  const usernameSlug = userRows[0]?.usernameSlug ?? ''

  let initialData: PortfolioData | null = null
  if (portfolio?.portfolioData) {
    try {
      initialData = JSON.parse(decrypt(portfolio.portfolioData)) as PortfolioData
    } catch {
      // corrupted data — surface empty state rather than crashing
    }
  }

  return (
    <DashboardClient
      initialPortfolio={portfolio}
      initialData={initialData}
      usernameSlug={usernameSlug}
    />
  )
}
