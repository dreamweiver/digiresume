// app/api/parse/route.ts
import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import pdf from 'pdf-parse'
import mammoth from 'mammoth'
import { buildResumeParsePrompt } from '@/lib/gemini-prompt'
import { encrypt } from '@/lib/crypto'
import { db } from '@/lib/db'
import { users, portfolios } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { generateSlug } from '@/lib/slug'
import type { PortfolioData } from '@/lib/portfolio-types'
import { generateWithRetry, isRetryableGeminiError } from '@/lib/gemini-retry'
import { sanitizePortfolio } from '@/lib/sanitize-portfolio'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('resume') as File | null
  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

  if (file.type !== 'application/pdf' && file.type !== DOCX_MIME) {
    return NextResponse.json({ error: 'Only PDF or DOCX files are supported' }, { status: 400 })
  }

  // Extract text in memory (file is never saved to disk)
  let resumeText: string
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    if (file.type === 'application/pdf') {
      const pdfData = await pdf(buffer)
      resumeText = pdfData.text.trim()
    } else {
      const { value } = await mammoth.extractRawText({ buffer })
      resumeText = value.trim()
    }
  } catch {
    return NextResponse.json({ error: 'Failed to read resume file' }, { status: 422 })
  }
  if (!resumeText) {
    return NextResponse.json({ error: 'Could not extract text from file' }, { status: 422 })
  }

  // Parse with Gemini Flash (with retry on transient errors)
  const prompt = buildResumeParsePrompt(resumeText)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  let text: string
  try {
    text = await generateWithRetry(model, prompt, { maxAttempts: 3 })
  } catch (e) {
    // Keep the technical detail in server logs but never surface it to the
    // browser — users see a friendly message via toast instead.
    console.error('[parse] Gemini generation failed:', e)
    if (isRetryableGeminiError(e)) {
      return NextResponse.json(
        { error: 'Our AI service is busy right now. Please try again in a moment.' },
        { status: 503 },
      )
    }
    return NextResponse.json(
      { error: "We couldn't process your resume. Please try again." },
      { status: 502 },
    )
  }

  let rawParsed: unknown
  try {
    // Strip markdown code fences if Gemini wraps JSON in them
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?\r?\n?/, '')
      .replace(/\r?\n?```$/, '')
    rawParsed = JSON.parse(cleaned)
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }

  // Defensively sanitize: drop malformed sections instead of failing the whole request
  const { data: sanitized, warnings } = sanitizePortfolio(rawParsed)
  const portfolioData: PortfolioData = sanitized

  // Post-process bio/about so the hero card always has a headline and the
  // About section always has prose, regardless of which field Gemini populated.
  //
  //   bio present, about empty → fill about from full bio
  //   about present, bio empty → fill bio from first sentence of about
  //   both present              → trim bio to first sentence (concise headline)
  const firstSentence = (text: string) => {
    const match = text.match(/^[^.!?]+[.!?]/)
    return match ? match[0].trim() : text
  }

  const fullBio = portfolioData.hero.bio.trim()
  const fullAbout = portfolioData.about.trim()

  if (fullBio && !fullAbout) {
    portfolioData.about = fullBio
  }
  if (!fullBio && fullAbout) {
    portfolioData.hero.bio = firstSentence(fullAbout)
  } else if (fullBio) {
    portfolioData.hero.bio = firstSentence(fullBio)
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

    return NextResponse.json({ portfolioData, usernameSlug: userRow.usernameSlug, warnings })
  } catch {
    return NextResponse.json({ error: 'Failed to save portfolio' }, { status: 500 })
  }
}
