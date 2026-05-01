# DigiResume

> Upload your PDF resume and get a shareable developer portfolio page in seconds, powered by AI.

**Live Demo:** [digiresume-eight.vercel.app](https://digiresume-eight.vercel.app)

## Features

- **AI-Powered Parsing** — Upload a PDF resume and Gemini Flash extracts your experience, skills, projects, and education automatically
- **Instant Portfolio** — Get a beautiful, shareable portfolio page at `/u/your-name`
- **Always Up to Date** — Edit any section, save changes, and re-publish. Your URL stays the same
- **PDF Download** — Export your portfolio back as a clean PDF resume
- **Encrypted Storage** — All portfolio data is encrypted at rest (AES-256-GCM)

## Tech Stack

- [Next.js 16](https://nextjs.org) — App Router, Server Components
- [Clerk](https://clerk.com) — Authentication
- [Neon](https://neon.com) + [Drizzle ORM](https://orm.drizzle.team) — Serverless Postgres
- [Vercel AI SDK](https://sdk.vercel.ai) + [Google Gemini](https://aistudio.google.com) — AI resume parsing
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) — UI
- [react-hook-form](https://react-hook-form.com) + [Zod](https://zod.dev) — Form validation
- [@react-pdf/renderer](https://react-pdf.org) — PDF generation

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.com) database
- A [Clerk](https://clerk.com) application
- A [Google AI Studio](https://aistudio.google.com) API key

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/dreamweiver/digiresume.git
   cd digiresume
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Clerk, Neon, encryption key, and Gemini API key values.

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

5. Start the dev server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `DATABASE_URL` | Neon connection string |
| `PORTFOLIO_ENCRYPTION_KEY` | 64-char hex key (run `openssl rand -hex 32`) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI Studio API key |

## Author

**dreamweiver** — [github.com/dreamweiver](https://github.com/dreamweiver)

## Repository

[github.com/dreamweiver/digiresume](https://github.com/dreamweiver/digiresume)
