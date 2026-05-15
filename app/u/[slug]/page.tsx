import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { users, portfolios } from '@/lib/db/schema'
import { decrypt } from '@/lib/crypto'
import { eq } from 'drizzle-orm'
import { PortfolioTemplate } from '@/components/portfolio/PortfolioTemplate'
import type { PortfolioData } from '@/lib/portfolio-types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const userResult = await db.select().from(users).where(eq(users.usernameSlug, slug)).limit(1)
  if (!userResult.length) return { title: 'Portfolio Not Found' }

  const portfolioResult = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.userId, userResult[0].id))
    .limit(1)
  if (!portfolioResult.length || portfolioResult[0].status !== 'published') {
    return { title: 'Portfolio Not Available' }
  }

  const data = JSON.parse(decrypt(portfolioResult[0].portfolioData!)) as PortfolioData
  return {
    title: `${data.hero.name} — Developer Portfolio`,
    description: data.hero.bio,
    openGraph: {
      title: `${data.hero.name} — Developer Portfolio`,
      description: data.hero.bio,
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: `${data.hero.name} — Developer Portfolio`,
      description: data.hero.bio,
    },
  }
}

export default async function PublicPortfolioPage({ params }: Props) {
  const { slug } = await params
  const userResult = await db.select().from(users).where(eq(users.usernameSlug, slug)).limit(1)
  if (!userResult.length) notFound()

  const portfolioResult = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.userId, userResult[0].id))
    .limit(1)

  if (!portfolioResult.length || portfolioResult[0].status !== 'published') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 gradient-text">Portfolio Not Available</h1>
          <p className="text-[#a1a1aa]">This portfolio hasn&apos;t been published yet.</p>
        </div>
      </div>
    )
  }

  const data = JSON.parse(decrypt(portfolioResult[0].portfolioData!)) as PortfolioData
  return <PortfolioTemplate data={data} />
}
