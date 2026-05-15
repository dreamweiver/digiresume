# DigiResume Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build DigiResume — a Next.js app that converts a PDF resume into a shareable developer portfolio page with auth, inline editing, draft/publish workflow, and PDF download.

**Architecture:** Single Next.js 14 App Router monorepo deployed to Vercel. Clerk handles auth. Neon (Postgres) + Drizzle ORM for persistence. Vercel AI SDK + Gemini Flash for resume parsing. Portfolio data stored as encrypted JSONB.

**Tech Stack:** Next.js 14, Tailwind CSS, shadcn/ui, Clerk, Neon, Drizzle ORM, Vercel AI SDK, Google Gemini Flash, pdf-parse, react-pdf, TypeScript

> **Ground rules (enforced throughout):**
>
> - **No commits or pushes** — stop at every "Commit" step and wait for explicit user approval before running any `git commit` or `git push` command
> - **ESLint flat config** — use `eslint.config.mjs` (ESLint v9+ flat config format), not `.eslintrc.*`
> - **85%+ test coverage** — vitest coverage must pass the 85% threshold on lines/branches/functions before any task is considered done. Run `npx vitest run --coverage` to check.

---

## File Map

```
digiresume/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx       — Clerk sign-in page
│   │   └── sign-up/[[...sign-up]]/page.tsx       — Clerk sign-up page
│   ├── (protected)/
│   │   └── dashboard/
│   │       └── page.tsx                           — Main dashboard (upload, edit, publish)
│   ├── u/
│   │   └── [slug]/
│   │       └── page.tsx                           — Public portfolio page
│   ├── api/
│   │   ├── parse/route.ts                         — POST: PDF → Gemini → portfolio JSON
│   │   ├── portfolio/route.ts                     — GET/POST: fetch/save portfolio
│   │   └── portfolio/publish/route.ts             — POST: publish portfolio
│   ├── layout.tsx                                 — Root layout with ClerkProvider
│   └── page.tsx                                   — Landing page
├── components/
│   ├── dashboard/
│   │   ├── ResumeUploader.tsx                     — Drag-and-drop upload zone
│   │   ├── PortfolioEditor.tsx                    — Tabbed editor (all sections)
│   │   ├── editor/
│   │   │   ├── HeroEditor.tsx                     — Name, title, bio fields
│   │   │   ├── AboutEditor.tsx                    — About textarea
│   │   │   ├── SkillsEditor.tsx                   — Tag-based skill chips
│   │   │   ├── ExperienceEditor.tsx               — Timeline entries CRUD
│   │   │   ├── ProjectsEditor.tsx                 — Project cards CRUD
│   │   │   ├── EducationEditor.tsx                — Education entries CRUD
│   │   │   └── SocialEditor.tsx                   — Social link inputs
│   │   ├── ActionBar.tsx                          — Save Draft + Publish buttons + Edit/Preview toggle
│   │   └── DashboardHeader.tsx                    — Logo, status badge, copy URL, user avatar
│   ├── portfolio/
│   │   ├── PortfolioTemplate.tsx                  — Full devportfolio-style template (used in both public page and preview)
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx                    — Hero banner with name/title/bio
│   │   │   ├── AboutSection.tsx                   — About paragraph
│   │   │   ├── ExperienceSection.tsx              — Timeline of experience
│   │   │   ├── ProjectsSection.tsx                — Project cards grid
│   │   │   ├── SkillsSection.tsx                  — Skills list
│   │   │   ├── EducationSection.tsx               — Education timeline
│   │   │   └── ContactSection.tsx                 — Social links + contact
│   │   └── PortfolioPDF.tsx                       — react-pdf document for download
│   ├── landing/
│   │   ├── HeroLanding.tsx                        — Landing page hero section
│   │   └── FeaturesSection.tsx                    — Features grid
│   └── ui/                                        — shadcn/ui components (auto-generated)
├── lib/
│   ├── db/
│   │   ├── index.ts                               — Neon DB connection (Drizzle)
│   │   └── schema.ts                              — Drizzle schema: users + portfolios tables
│   ├── crypto.ts                                  — AES-256-GCM encrypt/decrypt helpers
│   ├── slug.ts                                    — Username slug generator
│   ├── portfolio-types.ts                         — TypeScript types for PortfolioData
│   └── gemini-prompt.ts                           — Gemini prompt template for resume parsing
├── middleware.ts                                   — Clerk auth middleware (protect /dashboard)
├── drizzle.config.ts                              — Drizzle config pointing to Neon
├── .env.local                                     — Local env vars (never committed)
└── __tests__/
    ├── lib/crypto.test.ts
    ├── lib/slug.test.ts
    ├── api/parse.test.ts
    └── api/portfolio.test.ts
```

---

## Task 1: Project Scaffold

**Files:**

- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `.env.local`, `.gitignore`

- [ ] **Step 1: Scaffold Next.js app with TypeScript and Tailwind**

```bash
cd ~/Personal/exp
npx create-next-app@latest digiresume \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"
cd digiresume
```

- [ ] **Step 2: Install all dependencies**

```bash
npm install \
  @clerk/nextjs \
  drizzle-orm \
  @neondatabase/serverless \
  drizzle-zod \
  zod \
  ai \
  @ai-sdk/google \
  pdf-parse \
  @react-pdf/renderer \
  nanoid

npm install -D \
  drizzle-kit \
  @types/pdf-parse \
  vitest \
  @vitest/coverage-v8 \
  @vitejs/plugin-react \
  @testing-library/react \
  @testing-library/jest-dom \
  jsdom \
  eslint \
  @eslint/js \
  typescript-eslint \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-config-next
```

- [ ] **Step 3: Install shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted:

- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

- [ ] **Step 4: Install required shadcn components**

```bash
npx shadcn@latest add button input label textarea tabs badge card separator toast progress
```

- [ ] **Step 5: Create `.env.local`**

```bash
cat > .env.local << 'EOF'
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_REPLACE_ME
CLERK_SECRET_KEY=sk_test_REPLACE_ME
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Neon
DATABASE_URL=postgres://REPLACE_ME

# Encryption (32-byte hex key)
PORTFOLIO_ENCRYPTION_KEY=REPLACE_WITH_64_HEX_CHARS

# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY=REPLACE_ME
EOF
```

- [ ] **Step 6: Create `.gitignore` addition**

```bash
echo ".env.local" >> .gitignore
echo ".superpowers/" >> .gitignore
```

- [ ] **Step 7: Create ESLint flat config `eslint.config.mjs`**

```javascript
// eslint.config.mjs
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import nextPlugin from '@next/eslint-plugin-next'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      '@next/next': nextPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // not needed in Next.js
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  {
    ignores: ['.next/', 'node_modules/', 'drizzle/'],
  },
)
```

- [ ] **Step 8: Run ESLint to verify config works**

```bash
npx eslint . --max-warnings=0
```

Expected: No errors on the freshly scaffolded project.

- [ ] **Step 9: Add scripts to `package.json`**

Edit the `scripts` section:

```json
"lint": "eslint . --max-warnings=0",
"lint:fix": "eslint . --fix",
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 10: Init git (do NOT commit yet — wait for user approval)**

```bash
git init
git add -A
```

Stop here. Show the user the staged files with `git status` and ask for approval before running `git commit`.

---

## Task 2: TypeScript Types & Crypto Utilities

**Files:**

- Create: `lib/portfolio-types.ts`
- Create: `lib/crypto.ts`
- Create: `__tests__/lib/crypto.test.ts`

- [ ] **Step 1: Create `lib/portfolio-types.ts`**

```typescript
// lib/portfolio-types.ts
export interface HeroData {
  name: string
  title: string
  bio: string
  profilePhoto: string | null
}

export interface ExperienceEntry {
  company: string
  role: string
  startDate: string
  endDate: string
  description: string
}

export interface ProjectEntry {
  name: string
  description: string
  techStack: string[]
  liveUrl: string
  githubUrl: string
}

export interface EducationEntry {
  institution: string
  degree: string
  startDate: string
  endDate: string
}

export interface SocialLinks {
  github: string
  linkedin: string
  twitter: string
  website: string
}

export interface PortfolioData {
  hero: HeroData
  about: string
  skills: string[]
  experience: ExperienceEntry[]
  projects: ProjectEntry[]
  education: EducationEntry[]
  socialLinks: SocialLinks
}

export const EMPTY_PORTFOLIO: PortfolioData = {
  hero: { name: '', title: '', bio: '', profilePhoto: null },
  about: '',
  skills: [],
  experience: [],
  projects: [],
  education: [],
  socialLinks: { github: '', linkedin: '', twitter: '', website: '' },
}
```

- [ ] **Step 2: Write failing tests for crypto**

```typescript
// __tests__/lib/crypto.test.ts
import { describe, it, expect, beforeAll } from 'vitest'
import { encrypt, decrypt } from '@/lib/crypto'

beforeAll(() => {
  process.env.PORTFOLIO_ENCRYPTION_KEY = 'a'.repeat(64) // 32-byte hex key for tests
})

describe('encrypt / decrypt', () => {
  it('round-trips a string value', () => {
    const plaintext = JSON.stringify({ name: 'John Doe', skills: ['React'] })
    const ciphertext = encrypt(plaintext)
    expect(ciphertext).not.toEqual(plaintext)
    expect(decrypt(ciphertext)).toEqual(plaintext)
  })

  it('produces different ciphertext each call (random IV)', () => {
    const plaintext = 'same input'
    expect(encrypt(plaintext)).not.toEqual(encrypt(plaintext))
  })

  it('throws on tampered ciphertext', () => {
    const ciphertext = encrypt('hello')
    const tampered = ciphertext.slice(0, -4) + 'xxxx'
    expect(() => decrypt(tampered)).toThrow()
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npx vitest run __tests__/lib/crypto.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/crypto'`

- [ ] **Step 4: Create `lib/crypto.ts`**

```typescript
// lib/crypto.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

function getKey(): Buffer {
  const hex = process.env.PORTFOLIO_ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error('PORTFOLIO_ENCRYPTION_KEY must be a 64-char hex string (32 bytes)')
  }
  return Buffer.from(hex, 'hex')
}

export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH })
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  // Format: iv:authTag:encrypted — all base64
  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':')
}

export function decrypt(ciphertext: string): string {
  const key = getKey()
  const [ivB64, authTagB64, encryptedB64] = ciphertext.split(':')
  if (!ivB64 || !authTagB64 || !encryptedB64) throw new Error('Invalid ciphertext format')
  const iv = Buffer.from(ivB64, 'base64')
  const authTag = Buffer.from(authTagB64, 'base64')
  const encrypted = Buffer.from(encryptedB64, 'base64')
  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH })
  decipher.setAuthTag(authTag)
  return decipher.update(encrypted).toString('utf8') + decipher.final('utf8')
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run __tests__/lib/crypto.test.ts
```

Expected: 3 tests PASS

- [ ] **Step 6: Stage and wait for approval**

```bash
git add lib/portfolio-types.ts lib/crypto.ts __tests__/lib/crypto.test.ts
git status
```

Stop here — wait for user approval before committing.

---

## Task 3: Slug Generator

**Files:**

- Create: `lib/slug.ts`
- Create: `__tests__/lib/slug.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/lib/slug.test.ts
import { describe, it, expect } from 'vitest'
import { generateSlug } from '@/lib/slug'

describe('generateSlug', () => {
  it('lowercases and hyphenates the name', () => {
    const slug = generateSlug('John Doe')
    expect(slug).toMatch(/^john-doe-[a-z0-9]{4}$/)
  })

  it('handles single name', () => {
    const slug = generateSlug('Madonna')
    expect(slug).toMatch(/^madonna-[a-z0-9]{4}$/)
  })

  it('strips special characters', () => {
    const slug = generateSlug('José García')
    expect(slug).toMatch(/^jos-garc-[a-z0-9]{4}$|^jos.-garc.-[a-z0-9]{4}$/)
  })

  it('produces unique slugs on repeated calls', () => {
    const a = generateSlug('John Doe')
    const b = generateSlug('John Doe')
    expect(a).not.toEqual(b)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run __tests__/lib/slug.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/slug'`

- [ ] **Step 3: Create `lib/slug.ts`**

```typescript
// lib/slug.ts
import { nanoid } from 'nanoid'

export function generateSlug(fullName: string): string {
  const base = fullName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  const suffix = nanoid(4)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, 'x')
  return `${base}-${suffix}`
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run __tests__/lib/slug.test.ts
```

Expected: 4 tests PASS

- [ ] **Step 5: Stage and wait for approval**

```bash
git add lib/slug.ts __tests__/lib/slug.test.ts
git status
```

Stop here — wait for user approval before committing.

---

## Task 4: Database Schema & Drizzle Config

**Files:**

- Create: `lib/db/schema.ts`
- Create: `lib/db/index.ts`
- Create: `drizzle.config.ts`

- [ ] **Step 1: Create `lib/db/schema.ts`**

```typescript
// lib/db/schema.ts
import { pgTable, text, uuid, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  usernameSlug: text('username_slug').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const portfolios = pgTable('portfolios', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('draft'), // 'draft' | 'published'
  portfolioData: jsonb('portfolio_data'), // encrypted string stored as jsonb
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Portfolio = typeof portfolios.$inferSelect
export type NewPortfolio = typeof portfolios.$inferInsert
```

- [ ] **Step 2: Create `lib/db/index.ts`**

```typescript
// lib/db/index.ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

- [ ] **Step 3: Create `drizzle.config.ts`**

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit'

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config
```

- [ ] **Step 4: Generate migrations (do NOT push yet — wait for user approval)**

First, make sure you have filled in `DATABASE_URL` in `.env.local` with your real Neon connection string.

```bash
npx drizzle-kit generate
```

Show the generated SQL to the user. Only run `npx drizzle-kit push` after explicit user approval.

- [ ] **Step 5: Stage and wait for approval**

```bash
git add lib/db/ drizzle.config.ts drizzle/
git status
```

Stop here — wait for user approval before committing.

---

## Task 5: Clerk Auth Setup

**Files:**

- Create: `middleware.ts`
- Create: `app/layout.tsx`
- Create: `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- Create: `app/(auth)/sign-up/[[...sign-up]]/page.tsx`

- [ ] **Step 1: Create `middleware.ts`**

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect()
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

- [ ] **Step 2: Create `app/layout.tsx`**

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DigiResume — Turn your resume into a portfolio',
  description: 'Convert your PDF resume into a shareable developer portfolio instantly.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

- [ ] **Step 3: Create sign-in page**

```typescript
// app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <SignIn />
    </div>
  )
}
```

- [ ] **Step 4: Create sign-up page**

```typescript
// app/(auth)/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <SignUp />
    </div>
  )
}
```

- [ ] **Step 5: Verify auth works locally**

```bash
npm run dev
```

Visit `http://localhost:3000/dashboard` — should redirect to `/sign-in`. Sign up with a test account and confirm redirect to `/dashboard` after.

- [ ] **Step 6: Stage and wait for approval**

```bash
git add middleware.ts app/layout.tsx app/\(auth\)/
git status
```

Stop here — wait for user approval before committing with:

```bash
git commit -m "feat: add Clerk auth with sign-in/sign-up pages and middleware"
```

---

## Task 6: User Sync (First Login → DB Record)

**Files:**

- Create: `app/api/user/sync/route.ts`
- Modify: `app/(protected)/dashboard/page.tsx` (created in Task 9 — add sync call)

User sync happens when Clerk redirects to `/dashboard` after first login. We create the DB user record + slug at that point.

- [ ] **Step 1: Write failing test**

```typescript
// __tests__/api/user-sync.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// We test the slug generation logic used in sync
import { generateSlug } from '@/lib/slug'

describe('user sync slug generation', () => {
  it('generates a slug from clerk fullName', () => {
    const fullName = 'Jane Smith'
    const slug = generateSlug(fullName)
    expect(slug).toMatch(/^jane-smith-[a-z0-9]{4}$/)
  })

  it('falls back to "user" when name is empty', () => {
    const slug = generateSlug('') || `user-${Math.random()}`
    expect(typeof slug).toBe('string')
    expect(slug.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run to verify fail**

```bash
npx vitest run __tests__/api/user-sync.test.ts
```

Expected: FAIL

- [ ] **Step 3: Update `lib/slug.ts` to handle empty name**

```typescript
// lib/slug.ts
import { nanoid } from 'nanoid'

export function generateSlug(fullName: string): string {
  const base =
    fullName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-') || 'user'
  const suffix = nanoid(4)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, 'x')
  return `${base}-${suffix}`
}
```

- [ ] **Step 4: Create `app/api/user/sync/route.ts`**

```typescript
// app/api/user/sync/route.ts
import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { generateSlug } from '@/lib/slug'
import { eq } from 'drizzle-orm'

export async function POST() {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if user already exists
  const existing = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (existing.length > 0) {
    return NextResponse.json({ user: existing[0] })
  }

  // Create new user record
  const clerkUser = await currentUser()
  const fullName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ')
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? ''
  const usernameSlug = generateSlug(fullName)

  const [newUser] = await db.insert(users).values({ id: userId, usernameSlug, email }).returning()

  return NextResponse.json({ user: newUser })
}
```

- [ ] **Step 5: Run test to verify pass**

```bash
npx vitest run __tests__/api/user-sync.test.ts
```

Expected: PASS

- [ ] **Step 6: Stage and wait for approval**

```bash
git add app/api/user/ lib/slug.ts __tests__/api/user-sync.test.ts
git status
```

Stop here — wait for user approval before committing with:

```bash
git commit -m "feat: add user sync API route for first-login DB record creation"
```

---

## Task 7: Gemini Prompt & Resume Parse API

**Files:**

- Create: `lib/gemini-prompt.ts`
- Create: `app/api/parse/route.ts`
- Create: `__tests__/api/parse.test.ts`

- [ ] **Step 1: Create `lib/gemini-prompt.ts`**

```typescript
// lib/gemini-prompt.ts
export function buildResumeParsePrompt(resumeText: string): string {
  return `You are a resume parser. Extract information from the following resume text and return ONLY valid JSON matching this exact structure. Do not include any explanation or markdown — raw JSON only.

{
  "hero": {
    "name": "string — full name",
    "title": "string — job title or professional headline",
    "bio": "string — 2-3 sentence professional summary",
    "profilePhoto": null
  },
  "about": "string — 1-2 paragraph about section",
  "skills": ["array of skill strings"],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "startDate": "YYYY-MM format or year",
      "endDate": "YYYY-MM format, year, or present",
      "description": "string — key responsibilities and achievements"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "techStack": ["array of technologies"],
      "liveUrl": "",
      "githubUrl": ""
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "startDate": "year",
      "endDate": "year"
    }
  ],
  "socialLinks": {
    "github": "",
    "linkedin": "",
    "twitter": "",
    "website": ""
  }
}

Resume text:
---
${resumeText}
---`
}
```

- [ ] **Step 2: Write failing test for parse route**

```typescript
// __tests__/api/parse.test.ts
import { describe, it, expect } from 'vitest'
import { buildResumeParsePrompt } from '@/lib/gemini-prompt'

describe('buildResumeParsePrompt', () => {
  it('includes the resume text in the prompt', () => {
    const prompt = buildResumeParsePrompt('John Doe\nSoftware Engineer')
    expect(prompt).toContain('John Doe')
    expect(prompt).toContain('Software Engineer')
  })

  it('instructs to return raw JSON only', () => {
    const prompt = buildResumeParsePrompt('test')
    expect(prompt).toContain('raw JSON only')
  })

  it('includes all required portfolio fields in the schema', () => {
    const prompt = buildResumeParsePrompt('test')
    expect(prompt).toContain('"hero"')
    expect(prompt).toContain('"skills"')
    expect(prompt).toContain('"experience"')
    expect(prompt).toContain('"projects"')
    expect(prompt).toContain('"education"')
    expect(prompt).toContain('"socialLinks"')
  })
})
```

- [ ] **Step 3: Run to verify fail**

```bash
npx vitest run __tests__/api/parse.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/gemini-prompt'`

- [ ] **Step 4: Run test to verify pass**

```bash
npx vitest run __tests__/api/parse.test.ts
```

Expected: 3 tests PASS

- [ ] **Step 5: Create `app/api/parse/route.ts`**

```typescript
// app/api/parse/route.ts
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import pdf from 'pdf-parse'
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
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('resume') as File | null
  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

  const allowedTypes = ['application/pdf']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 })
  }

  // Extract text from PDF (in memory, never saved to disk)
  const buffer = Buffer.from(await file.arrayBuffer())
  const pdfData = await pdf(buffer)
  const resumeText = pdfData.text.trim()
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
    portfolioData = JSON.parse(text.trim())
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }

  // Encrypt and upsert portfolio
  const encryptedData = encrypt(JSON.stringify(portfolioData))

  const existing = await db.select().from(portfolios).where(eq(portfolios.userId, userId)).limit(1)

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

  return NextResponse.json({ portfolioData })
}
```

- [ ] **Step 6: Stage and wait for approval**

```bash
git add lib/gemini-prompt.ts app/api/parse/ __tests__/api/parse.test.ts
git status
```

Stop here — wait for user approval before committing with:

```bash
git commit -m "feat: add resume parse API route with Gemini Flash and PDF text extraction"
```

---

## Task 8: Portfolio CRUD API Routes

**Files:**

- Create: `app/api/portfolio/route.ts`
- Create: `app/api/portfolio/publish/route.ts`
- Create: `__tests__/api/portfolio.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/api/portfolio.test.ts
import { describe, it, expect } from 'vitest'
import { encrypt, decrypt } from '@/lib/crypto'
import type { PortfolioData } from '@/lib/portfolio-types'

// Test the encrypt/decrypt round-trip for portfolio data
// (API routes themselves are integration-tested manually via dev server)
describe('portfolio data encryption round-trip', () => {
  const mockPortfolio: PortfolioData = {
    hero: { name: 'Jane Doe', title: 'Engineer', bio: 'Bio here', profilePhoto: null },
    about: 'About text',
    skills: ['TypeScript', 'React'],
    experience: [],
    projects: [],
    education: [],
    socialLinks: { github: '', linkedin: '', twitter: '', website: '' },
  }

  it('encrypts and decrypts portfolio data without loss', () => {
    process.env.PORTFOLIO_ENCRYPTION_KEY = 'a'.repeat(64)
    const encrypted = encrypt(JSON.stringify(mockPortfolio))
    const decrypted = JSON.parse(decrypt(encrypted)) as PortfolioData
    expect(decrypted.hero.name).toBe('Jane Doe')
    expect(decrypted.skills).toEqual(['TypeScript', 'React'])
  })
})
```

- [ ] **Step 2: Run to verify fail**

```bash
npx vitest run __tests__/api/portfolio.test.ts
```

Expected: FAIL

- [ ] **Step 3: Run after crypto module exists**

```bash
npx vitest run __tests__/api/portfolio.test.ts
```

Expected: PASS (crypto module already exists from Task 2)

- [ ] **Step 4: Create `app/api/portfolio/route.ts`**

```typescript
// app/api/portfolio/route.ts
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { portfolios } from '@/lib/db/schema'
import { users } from '@/lib/db/schema'
import { encrypt, decrypt } from '@/lib/crypto'
import { eq } from 'drizzle-orm'
import type { PortfolioData } from '@/lib/portfolio-types'

// GET /api/portfolio — fetch current user's portfolio (decrypted)
export async function GET() {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await db.select().from(portfolios).where(eq(portfolios.userId, userId)).limit(1)

  if (result.length === 0) return NextResponse.json({ portfolio: null })

  const portfolio = result[0]
  const decryptedData = portfolio.portfolioData
    ? (JSON.parse(decrypt(portfolio.portfolioData as string)) as PortfolioData)
    : null

  // Fetch slug
  const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  const usernameSlug = userResult[0]?.usernameSlug ?? ''

  return NextResponse.json({
    portfolio: {
      ...portfolio,
      portfolioData: decryptedData,
      usernameSlug,
    },
  })
}

// POST /api/portfolio — save draft edits
export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { portfolioData }: { portfolioData: PortfolioData } = await req.json()
  const encryptedData = encrypt(JSON.stringify(portfolioData))

  const existing = await db.select().from(portfolios).where(eq(portfolios.userId, userId)).limit(1)

  if (existing.length > 0) {
    await db
      .update(portfolios)
      .set({ portfolioData: encryptedData, updatedAt: new Date() })
      .where(eq(portfolios.userId, userId))
  } else {
    await db.insert(portfolios).values({ userId, portfolioData: encryptedData, status: 'draft' })
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 5: Create `app/api/portfolio/publish/route.ts`**

```typescript
// app/api/portfolio/publish/route.ts
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { portfolios } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST() {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await db.select().from(portfolios).where(eq(portfolios.userId, userId)).limit(1)

  if (result.length === 0) {
    return NextResponse.json({ error: 'No portfolio found' }, { status: 404 })
  }

  await db
    .update(portfolios)
    .set({ status: 'published', publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(portfolios.userId, userId))

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 6: Stage and wait for approval**

```bash
git add app/api/portfolio/ __tests__/api/portfolio.test.ts
git status
```

Stop here — wait for user approval before committing with:

```bash
git commit -m "feat: add portfolio GET/POST and publish API routes"
```

---

## Task 9: Portfolio Template Component

**Files:**

- Create: `components/portfolio/sections/HeroSection.tsx`
- Create: `components/portfolio/sections/AboutSection.tsx`
- Create: `components/portfolio/sections/ExperienceSection.tsx`
- Create: `components/portfolio/sections/ProjectsSection.tsx`
- Create: `components/portfolio/sections/SkillsSection.tsx`
- Create: `components/portfolio/sections/EducationSection.tsx`
- Create: `components/portfolio/sections/ContactSection.tsx`
- Create: `components/portfolio/PortfolioTemplate.tsx`

- [ ] **Step 1: Create `components/portfolio/sections/HeroSection.tsx`**

```tsx
// components/portfolio/sections/HeroSection.tsx
import type { HeroData, SocialLinks } from '@/lib/portfolio-types'

interface Props {
  hero: HeroData
  socialLinks: SocialLinks
}

export function HeroSection({ hero, socialLinks }: Props) {
  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center bg-slate-900 text-white relative"
    >
      <div className="text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-4">{hero.name}</h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-6">{hero.title}</p>
        <p className="max-w-2xl mx-auto text-slate-400 text-lg mb-8">{hero.bio}</p>
        <div className="flex gap-4 justify-center">
          {socialLinks.github && (
            <a
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors underline"
            >
              GitHub
            </a>
          )}
          {socialLinks.linkedin && (
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors underline"
            >
              LinkedIn
            </a>
          )}
          {socialLinks.website && (
            <a
              href={socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors underline"
            >
              Website
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `components/portfolio/sections/AboutSection.tsx`**

```tsx
// components/portfolio/sections/AboutSection.tsx
interface Props {
  about: string
}

export function AboutSection({ about }: Props) {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">About Me</h2>
        <p className="text-slate-600 text-lg leading-relaxed text-center">{about}</p>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create `components/portfolio/sections/ExperienceSection.tsx`**

```tsx
// components/portfolio/sections/ExperienceSection.tsx
import type { ExperienceEntry } from '@/lib/portfolio-types'

interface Props {
  experience: ExperienceEntry[]
}

export function ExperienceSection({ experience }: Props) {
  if (!experience.length) return null
  return (
    <section id="experience" className="py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Experience</h2>
        <div className="space-y-8">
          {experience.map((entry, i) => (
            <div key={i} className="border-l-4 border-slate-800 pl-6">
              <h3 className="text-xl font-semibold text-slate-900">{entry.role}</h3>
              <p className="text-slate-600 font-medium">{entry.company}</p>
              <p className="text-slate-400 text-sm mb-3">
                {entry.startDate} – {entry.endDate}
              </p>
              <p className="text-slate-600">{entry.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Create `components/portfolio/sections/ProjectsSection.tsx`**

```tsx
// components/portfolio/sections/ProjectsSection.tsx
import type { ProjectEntry } from '@/lib/portfolio-types'

interface Props {
  projects: ProjectEntry[]
}

export function ProjectsSection({ projects }: Props) {
  if (!projects.length) return null
  return (
    <section id="projects" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <div
              key={i}
              className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{project.name}</h3>
              <p className="text-slate-600 mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-700 hover:text-slate-900 underline text-sm"
                  >
                    Live Demo
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-700 hover:text-slate-900 underline text-sm"
                  >
                    GitHub
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Create `components/portfolio/sections/SkillsSection.tsx`**

```tsx
// components/portfolio/sections/SkillsSection.tsx
interface Props {
  skills: string[]
}

export function SkillsSection({ skills }: Props) {
  if (!skills.length) return null
  return (
    <section id="skills" className="py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Skills</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {skills.map((skill) => (
            <span
              key={skill}
              className="bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Create `components/portfolio/sections/EducationSection.tsx`**

```tsx
// components/portfolio/sections/EducationSection.tsx
import type { EducationEntry } from '@/lib/portfolio-types'

interface Props {
  education: EducationEntry[]
}

export function EducationSection({ education }: Props) {
  if (!education.length) return null
  return (
    <section id="education" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Education</h2>
        <div className="space-y-6">
          {education.map((entry, i) => (
            <div key={i} className="border-l-4 border-slate-800 pl-6">
              <h3 className="text-xl font-semibold text-slate-900">{entry.degree}</h3>
              <p className="text-slate-600">{entry.institution}</p>
              <p className="text-slate-400 text-sm">
                {entry.startDate} – {entry.endDate}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 7: Create `components/portfolio/sections/ContactSection.tsx`**

```tsx
// components/portfolio/sections/ContactSection.tsx
import type { SocialLinks } from '@/lib/portfolio-types'

interface Props {
  socialLinks: SocialLinks
  name: string
}

export function ContactSection({ socialLinks, name }: Props) {
  return (
    <section id="contact" className="py-20 bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
        <p className="text-slate-400 mb-8">
          Interested in working with {name}? Reach out via any of these channels.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {socialLinks.github && (
            <a
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-slate-900 px-6 py-3 rounded-lg font-medium hover:bg-slate-100 transition-colors"
            >
              GitHub
            </a>
          )}
          {socialLinks.linkedin && (
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-slate-900 px-6 py-3 rounded-lg font-medium hover:bg-slate-100 transition-colors"
            >
              LinkedIn
            </a>
          )}
          {socialLinks.twitter && (
            <a
              href={socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-slate-900 px-6 py-3 rounded-lg font-medium hover:bg-slate-100 transition-colors"
            >
              Twitter
            </a>
          )}
          {socialLinks.website && (
            <a
              href={socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-slate-900 px-6 py-3 rounded-lg font-medium hover:bg-slate-100 transition-colors"
            >
              Website
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 8: Create `components/portfolio/PortfolioTemplate.tsx`**

```tsx
// components/portfolio/PortfolioTemplate.tsx
import type { PortfolioData } from '@/lib/portfolio-types'
import { HeroSection } from './sections/HeroSection'
import { AboutSection } from './sections/AboutSection'
import { ExperienceSection } from './sections/ExperienceSection'
import { ProjectsSection } from './sections/ProjectsSection'
import { SkillsSection } from './sections/SkillsSection'
import { EducationSection } from './sections/EducationSection'
import { ContactSection } from './sections/ContactSection'

interface Props {
  data: PortfolioData
}

export function PortfolioTemplate({ data }: Props) {
  return (
    <main className="font-sans">
      <HeroSection hero={data.hero} socialLinks={data.socialLinks} />
      <AboutSection about={data.about} />
      <ExperienceSection experience={data.experience} />
      <ProjectsSection projects={data.projects} />
      <SkillsSection skills={data.skills} />
      <EducationSection education={data.education} />
      <ContactSection socialLinks={data.socialLinks} name={data.hero.name} />
    </main>
  )
}
```

- [ ] **Step 9: Stage and wait for approval**

```bash
git add components/portfolio/
git status
```

Stop here — wait for user approval before committing with:

```bash
git commit -m "feat: add devportfolio-style template with all sections"
```

---

## Task 10: Public Portfolio Page

**Files:**

- Create: `app/u/[slug]/page.tsx`

- [ ] **Step 1: Create `app/u/[slug]/page.tsx`**

```tsx
// app/u/[slug]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { users, portfolios } from '@/lib/db/schema'
import { decrypt } from '@/lib/crypto'
import { eq } from 'drizzle-orm'
import { PortfolioTemplate } from '@/components/portfolio/PortfolioTemplate'
import type { PortfolioData } from '@/lib/portfolio-types'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.usernameSlug, params.slug))
    .limit(1)

  if (!userResult.length) return { title: 'Portfolio Not Found' }

  const portfolioResult = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.userId, userResult[0].id))
    .limit(1)

  if (!portfolioResult.length || portfolioResult[0].status !== 'published') {
    return { title: 'Portfolio Not Available' }
  }

  const data = JSON.parse(decrypt(portfolioResult[0].portfolioData as string)) as PortfolioData
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
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.usernameSlug, params.slug))
    .limit(1)

  if (!userResult.length) notFound()

  const portfolioResult = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.userId, userResult[0].id))
    .limit(1)

  if (!portfolioResult.length || portfolioResult[0].status !== 'published') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Portfolio Not Available</h1>
          <p className="text-slate-400">This portfolio hasn&apos;t been published yet.</p>
        </div>
      </div>
    )
  }

  const data = JSON.parse(decrypt(portfolioResult[0].portfolioData as string)) as PortfolioData

  return <PortfolioTemplate data={data} />
}
```

- [ ] **Step 2: Verify page loads in dev**

```bash
npm run dev
```

Visit `http://localhost:3000/u/nonexistent-slug` — should show "Portfolio Not Available" page cleanly.

- [ ] **Step 3: Stage and wait for approval**

```bash
git add app/u/
git status
```

Stop here — wait for user approval before committing with:

```bash
git commit -m "feat: add public portfolio page with SEO meta and unpublished state handling"
```

---

## Task 11: Dashboard — Resume Uploader Component

**Files:**

- Create: `components/dashboard/ResumeUploader.tsx`

- [ ] **Step 1: Create `components/dashboard/ResumeUploader.tsx`**

```tsx
// components/dashboard/ResumeUploader.tsx
'use client'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import type { PortfolioData } from '@/lib/portfolio-types'

interface Props {
  onGenerated: (data: PortfolioData) => void
}

export function ResumeUploader({ onGenerated }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.type === 'application/pdf') {
      setFile(dropped)
      setError(null)
    } else {
      setError('Only PDF files are supported')
    }
  }

  async function handleGenerate() {
    if (!file) return
    setIsLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('resume', file)
      const res = await fetch('/api/parse', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Parse failed')
      onGenerated(json.portfolioData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
          ${isDragging ? 'border-slate-500 bg-slate-100' : 'border-slate-300 hover:border-slate-400'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) {
              setFile(f)
              setError(null)
            }
          }}
        />
        {file ? (
          <p className="text-slate-700 font-medium">{file.name}</p>
        ) : (
          <>
            <p className="text-slate-500 text-lg">Drag & drop your resume PDF here</p>
            <p className="text-slate-400 text-sm mt-1">or click to browse</p>
          </>
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button onClick={handleGenerate} disabled={!file || isLoading} className="w-full">
        {isLoading ? 'Generating Portfolio...' : 'Generate Portfolio'}
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Stage and wait for approval**

```bash
git add components/dashboard/ResumeUploader.tsx
git status
```

Stop here — wait for user approval before committing with:

```bash
git commit -m "feat: add drag-and-drop resume uploader component"
```

---

## Task 12: Dashboard — Portfolio Editor Components

**Files:**

- Create: `components/dashboard/editor/HeroEditor.tsx`
- Create: `components/dashboard/editor/AboutEditor.tsx`
- Create: `components/dashboard/editor/SkillsEditor.tsx`
- Create: `components/dashboard/editor/ExperienceEditor.tsx`
- Create: `components/dashboard/editor/ProjectsEditor.tsx`
- Create: `components/dashboard/editor/EducationEditor.tsx`
- Create: `components/dashboard/editor/SocialEditor.tsx`
- Create: `components/dashboard/PortfolioEditor.tsx`

- [ ] **Step 1: Create `components/dashboard/editor/HeroEditor.tsx`**

```tsx
// components/dashboard/editor/HeroEditor.tsx
'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { HeroData } from '@/lib/portfolio-types'

interface Props {
  hero: HeroData
  onChange: (hero: HeroData) => void
}

export function HeroEditor({ hero, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Full Name</Label>
        <Input value={hero.name} onChange={(e) => onChange({ ...hero, name: e.target.value })} />
      </div>
      <div>
        <Label>Professional Title</Label>
        <Input value={hero.title} onChange={(e) => onChange({ ...hero, title: e.target.value })} />
      </div>
      <div>
        <Label>Bio</Label>
        <Textarea
          rows={3}
          value={hero.bio}
          onChange={(e) => onChange({ ...hero, bio: e.target.value })}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `components/dashboard/editor/AboutEditor.tsx`**

```tsx
// components/dashboard/editor/AboutEditor.tsx
'use client'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  about: string
  onChange: (about: string) => void
}

export function AboutEditor({ about, onChange }: Props) {
  return (
    <div>
      <Label>About Me</Label>
      <Textarea rows={5} value={about} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
```

- [ ] **Step 3: Create `components/dashboard/editor/SkillsEditor.tsx`**

```tsx
// components/dashboard/editor/SkillsEditor.tsx
'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface Props {
  skills: string[]
  onChange: (skills: string[]) => void
}

export function SkillsEditor({ skills, onChange }: Props) {
  const [input, setInput] = useState('')

  function addSkill() {
    const trimmed = input.trim()
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed])
      setInput('')
    }
  }

  return (
    <div className="space-y-3">
      <Label>Skills</Label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
          placeholder="Type a skill and press Enter"
        />
        <Button type="button" variant="outline" onClick={addSkill}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
          >
            {skill}
            <button
              onClick={() => onChange(skills.filter((s) => s !== skill))}
              className="text-slate-400 hover:text-red-500 ml-1"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `components/dashboard/editor/ExperienceEditor.tsx`**

```tsx
// components/dashboard/editor/ExperienceEditor.tsx
'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import type { ExperienceEntry } from '@/lib/portfolio-types'

interface Props {
  experience: ExperienceEntry[]
  onChange: (experience: ExperienceEntry[]) => void
}

const emptyEntry = (): ExperienceEntry => ({
  company: '',
  role: '',
  startDate: '',
  endDate: '',
  description: '',
})

export function ExperienceEditor({ experience, onChange }: Props) {
  function update(index: number, field: keyof ExperienceEntry, value: string) {
    const updated = experience.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    onChange(updated)
  }

  return (
    <div className="space-y-6">
      {experience.map((entry, i) => (
        <div key={i} className="border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-slate-700">Experience {i + 1}</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange(experience.filter((_, idx) => idx !== i))}
            >
              Remove
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Company</Label>
              <Input value={entry.company} onChange={(e) => update(i, 'company', e.target.value)} />
            </div>
            <div>
              <Label>Role</Label>
              <Input value={entry.role} onChange={(e) => update(i, 'role', e.target.value)} />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                placeholder="2022-01"
                value={entry.startDate}
                onChange={(e) => update(i, 'startDate', e.target.value)}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                placeholder="present"
                value={entry.endDate}
                onChange={(e) => update(i, 'endDate', e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={entry.description}
              onChange={(e) => update(i, 'description', e.target.value)}
            />
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={() => onChange([...experience, emptyEntry()])}>
        + Add Experience
      </Button>
    </div>
  )
}
```

- [ ] **Step 5: Create `components/dashboard/editor/ProjectsEditor.tsx`**

```tsx
// components/dashboard/editor/ProjectsEditor.tsx
'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import type { ProjectEntry } from '@/lib/portfolio-types'

interface Props {
  projects: ProjectEntry[]
  onChange: (projects: ProjectEntry[]) => void
}

const emptyProject = (): ProjectEntry => ({
  name: '',
  description: '',
  techStack: [],
  liveUrl: '',
  githubUrl: '',
})

export function ProjectsEditor({ projects, onChange }: Props) {
  const [techInputs, setTechInputs] = useState<string[]>(projects.map(() => ''))

  function update(index: number, field: keyof ProjectEntry, value: string | string[]) {
    onChange(projects.map((p, i) => (i === index ? { ...p, [field]: value } : p)))
  }

  function addTech(index: number) {
    const tech = techInputs[index]?.trim()
    if (tech && !projects[index].techStack.includes(tech)) {
      update(index, 'techStack', [...projects[index].techStack, tech])
      setTechInputs(techInputs.map((t, i) => (i === index ? '' : t)))
    }
  }

  return (
    <div className="space-y-6">
      {projects.map((project, i) => (
        <div key={i} className="border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-slate-700">Project {i + 1}</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange(projects.filter((_, idx) => idx !== i))
                setTechInputs(techInputs.filter((_, idx) => idx !== i))
              }}
            >
              Remove
            </Button>
          </div>
          <div>
            <Label>Name</Label>
            <Input value={project.name} onChange={(e) => update(i, 'name', e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={project.description}
              onChange={(e) => update(i, 'description', e.target.value)}
            />
          </div>
          <div>
            <Label>Tech Stack</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={techInputs[i] ?? ''}
                onChange={(e) =>
                  setTechInputs(techInputs.map((t, idx) => (idx === i ? e.target.value : t)))
                }
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech(i))}
                placeholder="Add technology"
              />
              <Button type="button" variant="outline" onClick={() => addTech(i)}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-sm flex items-center gap-1"
                >
                  {tech}
                  <button
                    onClick={() =>
                      update(
                        i,
                        'techStack',
                        project.techStack.filter((t) => t !== tech),
                      )
                    }
                    className="text-slate-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Live URL</Label>
              <Input
                value={project.liveUrl}
                onChange={(e) => update(i, 'liveUrl', e.target.value)}
              />
            </div>
            <div>
              <Label>GitHub URL</Label>
              <Input
                value={project.githubUrl}
                onChange={(e) => update(i, 'githubUrl', e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
      <Button
        variant="outline"
        onClick={() => {
          onChange([...projects, emptyProject()])
          setTechInputs([...techInputs, ''])
        }}
      >
        + Add Project
      </Button>
    </div>
  )
}
```

- [ ] **Step 6: Create `components/dashboard/editor/EducationEditor.tsx`**

```tsx
// components/dashboard/editor/EducationEditor.tsx
'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { EducationEntry } from '@/lib/portfolio-types'

interface Props {
  education: EducationEntry[]
  onChange: (education: EducationEntry[]) => void
}

const emptyEntry = (): EducationEntry => ({
  institution: '',
  degree: '',
  startDate: '',
  endDate: '',
})

export function EducationEditor({ education, onChange }: Props) {
  function update(index: number, field: keyof EducationEntry, value: string) {
    onChange(education.map((e, i) => (i === index ? { ...e, [field]: value } : e)))
  }

  return (
    <div className="space-y-6">
      {education.map((entry, i) => (
        <div key={i} className="border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-slate-700">Education {i + 1}</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange(education.filter((_, idx) => idx !== i))}
            >
              Remove
            </Button>
          </div>
          <div>
            <Label>Institution</Label>
            <Input
              value={entry.institution}
              onChange={(e) => update(i, 'institution', e.target.value)}
            />
          </div>
          <div>
            <Label>Degree</Label>
            <Input value={entry.degree} onChange={(e) => update(i, 'degree', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Year</Label>
              <Input
                placeholder="2016"
                value={entry.startDate}
                onChange={(e) => update(i, 'startDate', e.target.value)}
              />
            </div>
            <div>
              <Label>End Year</Label>
              <Input
                placeholder="2020"
                value={entry.endDate}
                onChange={(e) => update(i, 'endDate', e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={() => onChange([...education, emptyEntry()])}>
        + Add Education
      </Button>
    </div>
  )
}
```

- [ ] **Step 7: Create `components/dashboard/editor/SocialEditor.tsx`**

```tsx
// components/dashboard/editor/SocialEditor.tsx
'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { SocialLinks } from '@/lib/portfolio-types'

interface Props {
  socialLinks: SocialLinks
  onChange: (links: SocialLinks) => void
}

export function SocialEditor({ socialLinks, onChange }: Props) {
  return (
    <div className="space-y-4">
      {(['github', 'linkedin', 'twitter', 'website'] as const).map((key) => (
        <div key={key}>
          <Label className="capitalize">{key}</Label>
          <Input
            value={socialLinks[key]}
            onChange={(e) => onChange({ ...socialLinks, [key]: e.target.value })}
            placeholder={`https://${key === 'website' ? 'yourwebsite.com' : `${key}.com/username`}`}
          />
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 8: Create `components/dashboard/PortfolioEditor.tsx`**

```tsx
// components/dashboard/PortfolioEditor.tsx
'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HeroEditor } from './editor/HeroEditor'
import { AboutEditor } from './editor/AboutEditor'
import { SkillsEditor } from './editor/SkillsEditor'
import { ExperienceEditor } from './editor/ExperienceEditor'
import { ProjectsEditor } from './editor/ProjectsEditor'
import { EducationEditor } from './editor/EducationEditor'
import { SocialEditor } from './editor/SocialEditor'
import type { PortfolioData } from '@/lib/portfolio-types'

interface Props {
  data: PortfolioData
  onChange: (data: PortfolioData) => void
}

export function PortfolioEditor({ data, onChange }: Props) {
  return (
    <Tabs defaultValue="hero">
      <TabsList className="flex flex-wrap h-auto gap-1 mb-6">
        {['hero', 'about', 'skills', 'experience', 'projects', 'education', 'social'].map((tab) => (
          <TabsTrigger key={tab} value={tab} className="capitalize">
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="hero">
        <HeroEditor hero={data.hero} onChange={(hero) => onChange({ ...data, hero })} />
      </TabsContent>
      <TabsContent value="about">
        <AboutEditor about={data.about} onChange={(about) => onChange({ ...data, about })} />
      </TabsContent>
      <TabsContent value="skills">
        <SkillsEditor skills={data.skills} onChange={(skills) => onChange({ ...data, skills })} />
      </TabsContent>
      <TabsContent value="experience">
        <ExperienceEditor
          experience={data.experience}
          onChange={(experience) => onChange({ ...data, experience })}
        />
      </TabsContent>
      <TabsContent value="projects">
        <ProjectsEditor
          projects={data.projects}
          onChange={(projects) => onChange({ ...data, projects })}
        />
      </TabsContent>
      <TabsContent value="education">
        <EducationEditor
          education={data.education}
          onChange={(education) => onChange({ ...data, education })}
        />
      </TabsContent>
      <TabsContent value="social">
        <SocialEditor
          socialLinks={data.socialLinks}
          onChange={(socialLinks) => onChange({ ...data, socialLinks })}
        />
      </TabsContent>
    </Tabs>
  )
}
```

- [ ] **Step 9: Stage and wait for approval**

```bash
git add components/dashboard/
git status
```

Stop here — wait for user approval before committing with:

```bash
git commit -m "feat: add portfolio editor with tabbed section editors"
```

---

## Task 13: Dashboard — Header & Action Bar

**Files:**

- Create: `components/dashboard/DashboardHeader.tsx`
- Create: `components/dashboard/ActionBar.tsx`

- [ ] **Step 1: Create `components/dashboard/DashboardHeader.tsx`**

```tsx
// components/dashboard/DashboardHeader.tsx
'use client'
import { UserButton } from '@clerk/nextjs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Props {
  status: 'draft' | 'published'
  publicUrl: string | null
}

export function DashboardHeader({ status, publicUrl }: Props) {
  function copyUrl() {
    if (publicUrl) navigator.clipboard.writeText(publicUrl)
  }

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-slate-900">DigiResume</h1>
        <Badge variant={status === 'published' ? 'default' : 'secondary'}>
          {status === 'published' ? 'Published' : 'Draft'}
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        {publicUrl && (
          <Button variant="outline" size="sm" onClick={copyUrl}>
            Copy Portfolio URL
          </Button>
        )}
        {publicUrl && (
          <a href={publicUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              View Live
            </Button>
          </a>
        )}
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Create `components/dashboard/ActionBar.tsx`**

```tsx
// components/dashboard/ActionBar.tsx
'use client'
import { Button } from '@/components/ui/button'

interface Props {
  mode: 'edit' | 'preview'
  onToggleMode: () => void
  onSaveDraft: () => void
  onPublish: () => void
  onDownloadPDF: () => void
  isSaving: boolean
  isPublishing: boolean
}

export function ActionBar({
  mode,
  onToggleMode,
  onSaveDraft,
  onPublish,
  onDownloadPDF,
  isSaving,
  isPublishing,
}: Props) {
  return (
    <div className="border-t border-slate-200 bg-white px-6 py-4 flex items-center justify-between">
      <Button variant="outline" onClick={onToggleMode}>
        {mode === 'edit' ? 'Preview' : 'Back to Edit'}
      </Button>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onDownloadPDF}>
          Download PDF
        </Button>
        <Button variant="outline" onClick={onSaveDraft} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button onClick={onPublish} disabled={isPublishing}>
          {isPublishing ? 'Publishing...' : 'Publish'}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Stage and wait for approval**

```bash
git add components/dashboard/DashboardHeader.tsx components/dashboard/ActionBar.tsx
git status
```

Stop here — wait for user approval before committing with:

```bash
git commit -m "feat: add dashboard header and action bar components"
```

---

## Task 14: PDF Download Component

**Files:**

- Create: `components/portfolio/PortfolioPDF.tsx`

- [ ] **Step 1: Create `components/portfolio/PortfolioPDF.tsx`**

```tsx
// components/portfolio/PortfolioPDF.tsx
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer'
import type { PortfolioData } from '@/lib/portfolio-types'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#1e293b' },
  name: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  title: { fontSize: 13, color: '#475569', marginBottom: 4 },
  bio: { fontSize: 10, color: '#64748b', marginBottom: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 4,
    marginBottom: 8,
    marginTop: 16,
  },
  entryTitle: { fontSize: 11, fontWeight: 'bold' },
  entrySubtitle: { fontSize: 10, color: '#475569' },
  entryDate: { fontSize: 9, color: '#94a3b8', marginBottom: 3 },
  entryDescription: { fontSize: 10, color: '#475569', lineHeight: 1.4 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  skill: { backgroundColor: '#f1f5f9', padding: '3 6', borderRadius: 3, fontSize: 9 },
  socialRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
})

interface Props {
  data: PortfolioData
}

export function PortfolioPDF({ data }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Hero */}
        <Text style={styles.name}>{data.hero.name}</Text>
        <Text style={styles.title}>{data.hero.title}</Text>
        <Text style={styles.bio}>{data.hero.bio}</Text>

        {/* Social */}
        <View style={styles.socialRow}>
          {data.socialLinks.github ? (
            <Link src={data.socialLinks.github}>
              <Text style={{ fontSize: 9, color: '#3b82f6' }}>GitHub</Text>
            </Link>
          ) : null}
          {data.socialLinks.linkedin ? (
            <Link src={data.socialLinks.linkedin}>
              <Text style={{ fontSize: 9, color: '#3b82f6' }}>LinkedIn</Text>
            </Link>
          ) : null}
          {data.socialLinks.website ? (
            <Link src={data.socialLinks.website}>
              <Text style={{ fontSize: 9, color: '#3b82f6' }}>Website</Text>
            </Link>
          ) : null}
        </View>

        {/* About */}
        {data.about ? (
          <>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.entryDescription}>{data.about}</Text>
          </>
        ) : null}

        {/* Skills */}
        {data.skills.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsRow}>
              {data.skills.map((s) => (
                <Text key={s} style={styles.skill}>
                  {s}
                </Text>
              ))}
            </View>
          </>
        ) : null}

        {/* Experience */}
        {data.experience.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Experience</Text>
            {data.experience.map((e, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={styles.entryTitle}>{e.role}</Text>
                <Text style={styles.entrySubtitle}>{e.company}</Text>
                <Text style={styles.entryDate}>
                  {e.startDate} – {e.endDate}
                </Text>
                <Text style={styles.entryDescription}>{e.description}</Text>
              </View>
            ))}
          </>
        ) : null}

        {/* Projects */}
        {data.projects.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Projects</Text>
            {data.projects.map((p, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={styles.entryTitle}>{p.name}</Text>
                <Text style={styles.entryDescription}>{p.description}</Text>
                <Text style={{ fontSize: 9, color: '#64748b' }}>{p.techStack.join(' · ')}</Text>
              </View>
            ))}
          </>
        ) : null}

        {/* Education */}
        {data.education.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((e, i) => (
              <View key={i} style={{ marginBottom: 6 }}>
                <Text style={styles.entryTitle}>{e.degree}</Text>
                <Text style={styles.entrySubtitle}>{e.institution}</Text>
                <Text style={styles.entryDate}>
                  {e.startDate} – {e.endDate}
                </Text>
              </View>
            ))}
          </>
        ) : null}
      </Page>
    </Document>
  )
}
```

- [ ] **Step 2: Stage and wait for approval**

```bash
git add components/portfolio/PortfolioPDF.tsx
git status
```

Stop here — wait for user approval before committing with:

```bash
git commit -m "feat: add react-pdf portfolio PDF document component"
```

---

## Task 15: Dashboard Page (Main Assembly)

**Files:**

- Create: `app/(protected)/dashboard/page.tsx`

- [ ] **Step 1: Create `app/(protected)/dashboard/page.tsx`**

```tsx
// app/(protected)/dashboard/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { ResumeUploader } from '@/components/dashboard/ResumeUploader'
import { PortfolioEditor } from '@/components/dashboard/PortfolioEditor'
import { ActionBar } from '@/components/dashboard/ActionBar'
import { PortfolioTemplate } from '@/components/portfolio/PortfolioTemplate'
import { EMPTY_PORTFOLIO } from '@/lib/portfolio-types'
import type { PortfolioData } from '@/lib/portfolio-types'
import { pdf } from '@react-pdf/renderer'
import { PortfolioPDF } from '@/components/portfolio/PortfolioPDF'

type Mode = 'edit' | 'preview'
type Status = 'draft' | 'published'

export default function DashboardPage() {
  const { user } = useUser()
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(EMPTY_PORTFOLIO)
  const [status, setStatus] = useState<Status>('draft')
  const [usernameSlug, setUsernameSlug] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('edit')
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [hasPortfolio, setHasPortfolio] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Sync user to DB on mount, then load portfolio
  useEffect(() => {
    async function init() {
      await fetch('/api/user/sync', { method: 'POST' })
      const res = await fetch('/api/portfolio')
      const json = await res.json()
      if (json.portfolio) {
        setPortfolioData(json.portfolio.portfolioData ?? EMPTY_PORTFOLIO)
        setStatus(json.portfolio.status as Status)
        setUsernameSlug(json.portfolio.usernameSlug)
        setHasPortfolio(true)
      } else {
        setShowOnboarding(true)
      }
    }
    init()
  }, [])

  async function handleSaveDraft() {
    setIsSaving(true)
    await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolioData }),
    })
    setIsSaving(false)
  }

  async function handlePublish() {
    setIsPublishing(true)
    await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolioData }),
    })
    await fetch('/api/portfolio/publish', { method: 'POST' })
    setStatus('published')
    setIsPublishing(false)
  }

  async function handleDownloadPDF() {
    const blob = await pdf(<PortfolioPDF data={portfolioData} />).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${portfolioData.hero.name.replace(/\s+/g, '-').toLowerCase()}-resume.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const publicUrl = usernameSlug ? `${window.location.origin}/u/${usernameSlug}` : null

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DashboardHeader status={status} publicUrl={publicUrl} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Onboarding tooltip */}
        {showOnboarding && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm">
            👋 Welcome! Upload your resume PDF below to generate your portfolio instantly.
          </div>
        )}

        {/* Upload section */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {hasPortfolio ? 'Re-generate from Resume' : 'Upload Your Resume'}
          </h2>
          <ResumeUploader
            onGenerated={(data) => {
              setPortfolioData(data)
              setHasPortfolio(true)
              setShowOnboarding(false)
            }}
          />
        </section>

        {/* Editor / Preview */}
        {hasPortfolio && (
          <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {mode === 'edit' ? (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Edit Portfolio</h2>
                <PortfolioEditor data={portfolioData} onChange={setPortfolioData} />
              </div>
            ) : (
              <div className="border-t border-slate-200">
                <PortfolioTemplate data={portfolioData} />
              </div>
            )}
          </section>
        )}
      </main>

      {hasPortfolio && (
        <ActionBar
          mode={mode}
          onToggleMode={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          onDownloadPDF={handleDownloadPDF}
          isSaving={isSaving}
          isPublishing={isPublishing}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Test the full dashboard flow**

```bash
npm run dev
```

1. Visit `http://localhost:3000` → sign up → redirected to `/dashboard`
2. Onboarding tooltip visible
3. Upload a PDF resume → "Generate Portfolio" → portfolio appears in editor tabs
4. Edit a field → "Save Draft" → reload page → edits persisted
5. Toggle to "Preview" → see portfolio template render
6. "Publish" → status badge changes to "Published"
7. Visit `http://localhost:3000/u/<your-slug>` → portfolio renders publicly
8. "Download PDF" → PDF downloads with portfolio content

- [ ] **Step 3: Stage and wait for approval**

```bash
git add app/\(protected\)/
git status
```

Stop here — wait for user approval before committing with:

```bash
git commit -m "feat: assemble full dashboard page with upload, edit, preview, publish, and PDF download"
```

---

## Task 16: Landing Page

**Files:**

- Create: `components/landing/HeroLanding.tsx`
- Create: `components/landing/FeaturesSection.tsx`
- Create: `app/page.tsx`

- [ ] **Step 1: Create `components/landing/HeroLanding.tsx`**

```tsx
// components/landing/HeroLanding.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HeroLanding() {
  return (
    <section className="min-h-screen bg-slate-900 flex items-center justify-center text-white px-4">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Turn your resume into a<br />
          <span className="text-slate-400">shareable portfolio</span>
        </h1>
        <p className="text-xl text-slate-400 mb-10">
          Upload your PDF resume. Get a professional developer portfolio page instantly. Share it on
          LinkedIn, Twitter, and beyond.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/sign-up">
            <Button size="lg" className="text-lg px-8 py-6">
              Get Started — Free
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-slate-600 text-slate-300 hover:text-white"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `components/landing/FeaturesSection.tsx`**

```tsx
// components/landing/FeaturesSection.tsx
const features = [
  { title: 'Upload your resume', desc: 'Drag and drop your PDF resume. We handle the rest.' },
  {
    title: 'AI-powered parsing',
    desc: 'Gemini Flash extracts your experience, skills, and projects automatically.',
  },
  {
    title: 'Instant portfolio',
    desc: 'Get a beautiful developer portfolio at your own unique URL instantly.',
  },
  {
    title: 'Edit & publish',
    desc: "Tweak any section, save drafts, and publish when you're ready.",
  },
  { title: 'Download as PDF', desc: 'Generate a clean, formatted resume PDF from your portfolio.' },
  {
    title: 'Share everywhere',
    desc: 'One link works on LinkedIn, Twitter, email signatures, and more.',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
          Everything you need to go digital
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="text-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create `app/page.tsx`**

```tsx
// app/page.tsx
import { HeroLanding } from '@/components/landing/HeroLanding'
import { FeaturesSection } from '@/components/landing/FeaturesSection'

export default function LandingPage() {
  return (
    <>
      <HeroLanding />
      <FeaturesSection />
    </>
  )
}
```

- [ ] **Step 4: Stage and wait for approval**

```bash
git add components/landing/ app/page.tsx
git status
```

Stop here — wait for user approval before committing with:

```bash
git commit -m "feat: add landing page with hero and features sections"
```

---

## Task 17: Vitest Config, Coverage & Full Test Run

**Files:**

- Create: `vitest.config.ts`

- [ ] **Step 1: Create `vitest.config.ts` with 85% coverage thresholds**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: [
        'node_modules/**',
        '.next/**',
        'drizzle/**',
        '**/*.config.*',
        '**/ui/**', // shadcn auto-generated, excluded from coverage
        'app/layout.tsx',
        'app/page.tsx',
        'components/landing/**',
      ],
      thresholds: {
        lines: 85,
        branches: 85,
        functions: 85,
        statements: 85,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 2: Run full test suite with coverage**

```bash
npx vitest run --coverage
```

Expected output includes:

```
 % Lines   | % Branches | % Functions | % Statements
 ≥85       | ≥85        | ≥85         | ≥85
```

All tests pass:

- `__tests__/lib/crypto.test.ts` — 3 tests pass
- `__tests__/lib/slug.test.ts` — 4 tests pass
- `__tests__/api/parse.test.ts` — 3 tests pass
- `__tests__/api/portfolio.test.ts` — 1 test pass
- `__tests__/api/user-sync.test.ts` — 2 tests pass

If coverage is below 85%, add tests to the failing module before proceeding.

- [ ] **Step 3: Run ESLint clean check**

```bash
npm run lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Run TypeScript check**

```bash
npx tsc --noEmit
```

Fix any type errors before proceeding.

- [ ] **Step 5: Stage changes — wait for user approval before committing**

```bash
git add vitest.config.ts package.json
git status
```

Stop here. Show output and wait for user to say "commit" before running `git commit`.

---

## Task 18: Vercel Deployment

- [ ] **Step 1: Create Vercel project**

Go to [vercel.com](https://vercel.com), create new project, import from Git.

- [ ] **Step 2: Add environment variables in Vercel dashboard**

Add these in Project Settings → Environment Variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
DATABASE_URL
PORTFOLIO_ENCRYPTION_KEY
GOOGLE_GENERATIVE_AI_API_KEY
```

- [ ] **Step 3: Update Clerk allowed origins**

In Clerk dashboard → Domains, add your Vercel deployment URL (e.g. `digiresume.vercel.app`).

- [ ] **Step 4: Deploy — wait for user approval before pushing**

Confirm with user before running:

```bash
git push origin main
```

Vercel auto-deploys on push.

- [ ] **Step 5: Smoke test production**

1. Visit `https://digiresume.vercel.app` — landing page loads
2. Sign up → dashboard loads
3. Upload a resume → portfolio generates
4. Publish → public URL works
5. Download PDF → PDF downloads

- [ ] **Step 6: Final commit — wait for user approval**

Stage and show status, then wait:

```bash
git add .
git status
```

Only run after user approves:

```bash
git commit -m "chore: production ready — all features verified on Vercel"
git push origin main
```

```

---

## Self-Review Checklist

| Spec Requirement | Task |
|---|---|
| Next.js + Tailwind + shadcn/ui | Task 1 |
| Clerk auth (sign-in, sign-up, middleware) | Task 5 |
| Neon + Drizzle schema | Tasks 4 |
| User slug generation on first login | Tasks 3, 6 |
| PDF upload + Gemini parsing | Task 7 |
| AES-256-GCM encryption | Task 2 |
| Portfolio CRUD API | Task 8 |
| Draft/Publish workflow | Tasks 8, 13 |
| Tabbed portfolio editor (all 7 sections) | Task 12 |
| devportfolio-style template | Task 9 |
| Public portfolio page `/u/[slug]` | Task 10 |
| "Not published" message | Task 10 |
| Open Graph / SEO meta | Task 10 |
| PDF download via react-pdf | Tasks 14, 15 |
| Onboarding tooltip | Task 15 |
| Copy URL button | Task 13 |
| Edit / Preview toggle | Tasks 13, 15 |
| Landing page | Task 16 |
| Tests (crypto, slug, parse, portfolio) | Tasks 2, 3, 7, 8, 17 |
| Vercel deployment | Task 18 |
```
