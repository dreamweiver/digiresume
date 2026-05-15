// app/api/parse/route.ts
import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import pdf from 'pdf-parse'
import { buildResumeParsePrompt } from '@/lib/gemini-prompt'
import { encrypt } from '@/lib/crypto'
import { db } from '@/lib/db'
import { users, portfolios } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { generateSlug } from '@/lib/slug'
import type { PortfolioData } from '@/lib/portfolio-types'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('resume') as File | null
  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 })
  }

  // Extract text from PDF (in memory, never saved to disk)
  let resumeText: string
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const pdfData = await pdf(buffer)
    resumeText = pdfData.text.trim()
  } catch {
    return NextResponse.json({ error: 'Failed to read PDF file' }, { status: 422 })
  }
  if (!resumeText) {
    return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 422 })
  }

  // Parse with Gemini Flash
  const prompt = buildResumeParsePrompt(resumeText)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  let text: string
  try {
    const result = await model.generateContent(prompt)
    text = result.response.text()
  } catch (e) {
    const message = e instanceof Error ? e.message : 'AI generation failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  let portfolioData: PortfolioData
  try {
    // Strip markdown code fences if Gemini wraps JSON in them
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?\r?\n?/, '')
      .replace(/\r?\n?```$/, '')
    portfolioData = JSON.parse(cleaned)
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }

  // Encrypt and upsert portfolio
  const encryptedData = encrypt(JSON.stringify(portfolioData))

  try {
    // Ensure user row exists (FK constraint on portfolios.userId)
    const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    if (existingUser.length === 0) {
      const clerkUser = await currentUser()
      const fullName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ')
      const email = clerkUser?.emailAddresses[0]?.emailAddress ?? ''
      await db
        .insert(users)
        .values({ id: userId, usernameSlug: generateSlug(fullName), email })
        .onConflictDoNothing()
    }

    const userRow =
      existingUser.length > 0
        ? existingUser[0]
        : (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0]

    const existing = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, userId))
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(portfolios)
        .set({ portfolioData: encryptedData, status: 'draft', updatedAt: new Date() })
        .where(eq(portfolios.userId, userId))
    } else {
      await db.insert(portfolios).values({
        userId,
        portfolioData: encryptedData,
        status: 'draft',
      })
    }

    return NextResponse.json({ portfolioData, usernameSlug: userRow.usernameSlug })
  } catch {
    return NextResponse.json({ error: 'Failed to save portfolio' }, { status: 500 })
  }
}
