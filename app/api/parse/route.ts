// app/api/parse/route.ts
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import { PDFParse } from 'pdf-parse'
import { buildResumeParsePrompt } from '@/lib/gemini-prompt'
import { encrypt } from '@/lib/crypto'
import { db } from '@/lib/db'
import { portfolios } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { PortfolioData } from '@/lib/portfolio-types'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
})

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
    const parser = new PDFParse({ data: buffer })
    const pdfData = await parser.getText()
    resumeText = pdfData.text.trim()
  } catch {
    return NextResponse.json({ error: 'Failed to read PDF file' }, { status: 422 })
  }
  if (!resumeText) {
    return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 422 })
  }

  // Parse with Gemini Flash
  const prompt = buildResumeParsePrompt(resumeText)
  const { text } = await generateText({
    model: google('gemini-1.5-flash'),
    prompt,
  })

  let portfolioData: PortfolioData
  try {
    // Strip markdown code fences if Gemini wraps JSON in them
    const cleaned = text.trim().replace(/^```(?:json)?\r?\n?/, '').replace(/\r?\n?```$/, '')
    portfolioData = JSON.parse(cleaned)
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }

  // Encrypt and upsert portfolio
  const encryptedData = encrypt(JSON.stringify(portfolioData))

  try {
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
  } catch {
    return NextResponse.json({ error: 'Failed to save portfolio' }, { status: 500 })
  }

  return NextResponse.json({ portfolioData })
}
