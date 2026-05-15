<div align="center">

# DigiResume

### Resume + Portfolio = DigiResume

**Upload once. Share forever. Stand out.**

A modern developer portfolio generator built with Next.js 16 that turns your PDF resume into a beautiful, shareable portfolio page — powered by Google Gemini AI.

[![Live Demo](https://img.shields.io/badge/Live_Demo-DigiResume-00e599?style=for-the-badge&logo=vercel)](https://digiresume-eight.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## Features

- **AI-Powered Parsing** — Upload a PDF resume and Gemini 2.5 Flash automatically extracts your experience, skills, projects, education, and social links
- **Instant Portfolio Page** — Get a shareable portfolio at `/u/your-name` with zero design effort
- **Live Editor** — Edit every section (hero, about, skills, experience, projects, education, social links) with real-time preview
- **Publish & Draft** — Keep a draft while you polish, then publish when ready. Your URL never changes
- **PDF Download** — Export your portfolio back as a clean, formatted PDF resume
- **Smart Profile Photo** — Uses your GitHub avatar automatically, falls back to gendered placeholder
- **Rich Data Extraction** — Location, CGPA/GPA, bullet-point descriptions, and human-readable date formats
- **Encrypted Storage** — All portfolio data is encrypted at rest with AES-256-GCM
- **Form Validation** — All editor fields validated with React Hook Form + Zod
- **Prettier + ESLint** — Consistent code style enforced across the entire codebase
- **170+ tests** — Vitest + React Testing Library across 20+ test files, 85%+ coverage

---

## Tech Stack

| Category           | Technology                                  |
| ------------------ | ------------------------------------------- |
| **Framework**      | Next.js 16 (App Router)                     |
| **Language**       | TypeScript                                  |
| **Styling**        | Tailwind CSS v4                             |
| **UI Components**  | shadcn/ui                                   |
| **Database**       | Neon PostgreSQL (Serverless)                |
| **ORM/Migrations** | Drizzle ORM + drizzle-kit                   |
| **Authentication** | Clerk v7                                    |
| **AI**             | Google Generative AI SDK + Gemini 2.5 Flash |
| **PDF Parsing**    | pdf-parse v2                                |
| **PDF Generation** | @react-pdf/renderer v4                      |
| **Forms**          | React Hook Form + Zod                       |
| **Testing**        | Vitest + React Testing Library              |
| **Linting**        | ESLint 9 + Prettier                         |
| **Deployment**     | Vercel                                      |

---

## Project Structure

```
app/
├── (auth)/                  # Sign-in, sign-up pages (Clerk)
├── (protected)/dashboard/   # Authenticated dashboard
├── api/
│   ├── parse/               # PDF upload + Gemini AI parsing
│   ├── portfolio/           # Portfolio CRUD + publish
│   └── user/sync/           # First-login user creation
├── u/[slug]/                # Public portfolio page
└── page.tsx                 # Landing page
components/
├── dashboard/
│   ├── editor/              # 7 section editors (react-hook-form + zod)
│   ├── DashboardClient.tsx  # Main dashboard client component
│   ├── PortfolioEditor.tsx  # Tabbed editor shell
│   └── ResumeUploader.tsx   # Drag-and-drop PDF uploader
├── landing/                 # Hero + Features sections
├── portfolio/
│   ├── sections/            # 7 portfolio section components
│   ├── PortfolioTemplate.tsx
│   └── PortfolioPDF.tsx     # PDF export document
└── ui/                      # shadcn/ui primitives
lib/
├── crypto.ts                # AES-256-GCM encrypt/decrypt
├── db/                      # Drizzle schema + Neon client
├── gemini-prompt.ts         # AI resume parse prompt
├── portfolio-schemas.ts     # Zod validation schemas
├── portfolio-types.ts       # TypeScript interfaces
└── slug.ts                  # Auto-slug generator
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Neon Database](https://neon.tech) account (free tier)
- [Clerk](https://clerk.com) account (free tier)
- [Google AI Studio](https://aistudio.google.com) API key (free tier)

### Installation

```bash
git clone https://github.com/dreamweiver/digiresume.git
cd digiresume
npm install
```

### Environment Variables

Create `.env.local` with:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard

# Neon PostgreSQL
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# Encryption (generate with: openssl rand -hex 32)
PORTFOLIO_ENCRYPTION_KEY=your_64_char_hex_key

# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
```

| Variable                            | Where to find it                                                 |
| ----------------------------------- | ---------------------------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dashboard > API Keys                                       |
| `CLERK_SECRET_KEY`                  | Clerk dashboard > API Keys                                       |
| `DATABASE_URL`                      | Neon dashboard > Connection Details                              |
| `PORTFOLIO_ENCRYPTION_KEY`          | Run `openssl rand -hex 32` in terminal                           |
| `GOOGLE_GENERATIVE_AI_API_KEY`      | [aistudio.google.com](https://aistudio.google.com) > Get API key |

### Run

```bash
npx drizzle-kit migrate   # Apply database migrations
npm run dev               # Start dev server at http://localhost:3000
```

---

## Testing

```bash
npm test                  # Single run
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

20+ test files, 170+ tests covering API routes, lib utilities, zod schemas, and all UI components.

---

## Roadmap

### Done

- [x] PDF resume upload with drag-and-drop
- [x] AI-powered resume parsing (Gemini 2.5 Flash)
- [x] Auto-generated username slug
- [x] Public portfolio page at `/u/[slug]`
- [x] Live editor for all 7 portfolio sections
- [x] Draft / Publish workflow
- [x] PDF resume download
- [x] AES-256-GCM encryption for all stored data
- [x] Form validation with React Hook Form + Zod
- [x] Neon-inspired dark UI with green accents
- [x] Devportfolio-style two-column layout with IBM Plex Mono font
- [x] Smart profile photo (GitHub avatar fallback)
- [x] Rich extraction: location, CGPA/GPA, bullet points, date format
- [x] Side Projects section with Demo button links
- [x] Prettier + ESLint code formatting
- [x] Deployed to Vercel

---

## Contact & Feedback

DigiResume is created and maintained by **[dreamweiver](https://github.com/dreamweiver)**.

- **Live App** — [digiresume-eight.vercel.app](https://digiresume-eight.vercel.app/)
- **Source Code** — [github.com/dreamweiver/digiresume](https://github.com/dreamweiver/digiresume)
- **Report a Bug** — [Open an issue](https://github.com/dreamweiver/digiresume/issues/new)
- **Feature Requests & Feedback** — [View all issues](https://github.com/dreamweiver/digiresume/issues)

Found a bug or have a suggestion? Please [open a GitHub issue](https://github.com/dreamweiver/digiresume/issues/new) — it helps improve DigiResume for everyone.

---

## License

MIT

---

<div align="center">

_Upload once. Share forever. Stand out._

</div>
