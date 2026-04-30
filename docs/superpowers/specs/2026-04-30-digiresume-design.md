# DigiResume — Design Spec
**Date:** 2026-04-30  
**Status:** Approved  

---

## 1. Product Overview

DigiResume is a web app that converts a traditional PDF/DOCX resume into a shareable developer portfolio page. Users upload their resume, AI parses it into structured data, and a polished public portfolio is generated at a unique URL. The portfolio can be edited, saved as a draft, and published when ready. A downloadable PDF resume can also be generated from the portfolio data.

**Core motto:** Turn your resume into a shareable developer portfolio instantly.

**Deployment:** Vercel free tier  
**Public URL format:** `digiresume.vercel.app/u/john-doe-k7m2`

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Clerk (free tier, 10k MAU) |
| Database | Neon (serverless Postgres, free tier) |
| ORM | Drizzle ORM |
| AI Parsing | Vercel AI SDK + Google Gemini Flash |
| PDF Text Extraction | `pdf-parse` |
| PDF Generation | `react-pdf` |
| Deployment | Vercel |

---

## 3. Architecture

Single Next.js monorepo deployed to Vercel. No separate backend service.

```
Next.js App (App Router)
├── /app/(auth)               → Clerk sign-in / sign-up pages
├── /app/(protected)/dashboard → Upload, edit, publish portfolio
├── /app/u/[slug]             → Public portfolio page
├── /app/api/parse            → API Route: PDF → Gemini → JSON
├── /app/api/portfolio        → CRUD for portfolio data
└── Neon DB (Drizzle ORM)     → users, portfolios tables
```

---

## 4. Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | text (PK) | Clerk user ID |
| username_slug | text (unique) | e.g. `john-doe-k7m2` — auto-generated at signup |
| email | text | from Clerk |
| created_at | timestamp | |

### `portfolios`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| user_id | text (FK) | references users.id |
| status | text | `"draft"` or `"published"` |
| portfolio_data | jsonb | encrypted at app layer (AES-256) |
| published_at | timestamp | when last published |
| created_at | timestamp | |
| updated_at | timestamp | |

**Key decisions:**
- Raw resume file is never persisted — parsed in memory, discarded after Gemini extracts JSON
- `portfolio_data` JSONB encrypted using Node.js `crypto` (AES-256-GCM), key stored as Vercel env var
- No upload limit — rate limiting can be added via Vercel middleware if abuse becomes an issue
- One portfolio per user

---

## 5. Portfolio Data Structure (JSONB)

```json
{
  "hero": {
    "name": "John Doe",
    "title": "Full Stack Developer",
    "bio": "Passionate developer with 5 years experience...",
    "profilePhoto": null
  },
  "about": "Short paragraph about the developer...",
  "skills": ["React", "TypeScript", "Node.js", "PostgreSQL"],
  "experience": [
    {
      "company": "Acme Corp",
      "role": "Senior Developer",
      "startDate": "2022-01",
      "endDate": "present",
      "description": "Led development of..."
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "What it does...",
      "techStack": ["React", "Node.js"],
      "liveUrl": "https://...",
      "githubUrl": "https://..."
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "B.Sc Computer Science",
      "startDate": "2016",
      "endDate": "2020"
    }
  ],
  "socialLinks": {
    "github": "https://github.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe",
    "twitter": "https://twitter.com/johndoe",
    "website": "https://johndoe.com"
  }
}
```

---

## 6. Application Flow

### Auth Flow
1. User visits landing page → clicks Sign Up
2. Clerk handles registration (email or Google/GitHub OAuth)
3. On first login → slug auto-generated (`firstname-lastname-xxxx`) → user record created in DB → redirected to dashboard
4. Onboarding tooltip shown on first dashboard visit

### Dashboard Flow
1. User uploads PDF/DOCX resume via drag-and-drop
2. File sent to API Route → `pdf-parse` extracts raw text → Gemini Flash structures into JSON → portfolio record created/updated in DB (encrypted)
3. Generated portfolio preview shown in devportfolio template style
4. User edits any section inline (hero, about, skills, experience, projects, education, social links)
5. Toggle between **Edit mode** and **Preview mode** to see public-facing result
6. "Save Draft" persists edits without publishing
7. "Publish" makes portfolio live at public URL
8. "Download Resume PDF" generates PDF from portfolio data

### Public Portfolio Flow
1. Anyone visits `digiresume.vercel.app/u/john-doe-k7m2`
2. Next.js fetches portfolio, decrypts, renders devportfolio template
3. If not published → clean "This portfolio is not available yet" message
4. SEO meta tags + Open Graph tags for social sharing

---

## 7. Page Structure

```
/                          → Landing page (hero, features, CTA, sample portfolio link)
/sign-in                   → Clerk sign-in
/sign-up                   → Clerk sign-up
/dashboard                 → Protected main app (upload, edit, publish)
/u/[slug]                  → Public portfolio (unauthenticated)
```

### Dashboard Layout
```
Header
├── Logo
├── Portfolio status badge (Draft / Published)
├── Public URL + copy button
└── User avatar + sign out

Upload Section
├── Drag & drop zone (PDF/DOCX)
└── "Generate Portfolio" button

Portfolio Editor (tabs or accordion)
├── Hero        → Name, title, bio, profile photo
├── About       → Short bio paragraph
├── Skills      → Tag-based skill chips
├── Experience  → Timeline entries
├── Projects    → Cards with links
├── Education   → Timeline entries
└── Social      → GitHub, LinkedIn, Twitter, website

Action Bar
├── Edit / Preview toggle
├── Save Draft button
└── Publish button

Download Section
└── Download Resume PDF button
```

---

## 8. Public Portfolio Template

Based on [Ryan Fitzgerald's devportfolio](https://ryanfitzgerald.github.io/devportfolio/):
- Dark themed, single-page, smooth scroll
- Sections: Hero → About → Experience → Projects → Skills → Education → Contact
- Responsive, mobile-friendly
- Open Graph meta tags for LinkedIn/Twitter sharing
- No edit controls visible on public page

---

## 9. Slug Generation

- Auto-generated at signup from Clerk profile name
- Format: `{firstname}-{lastname}-{4-char-random}` e.g. `john-doe-k7m2`
- Lowercased, spaces replaced with hyphens
- Unique by design — no conflicts possible
- Never changes after creation (stable shareable URL)

---

## 10. Security

- `portfolio_data` encrypted at app layer using AES-256-GCM before writing to Neon
- Encryption key stored as `PORTFOLIO_ENCRYPTION_KEY` Vercel env var
- Clerk handles all auth token management — no custom session logic
- Resume file processed in memory only — never written to disk or stored
- All dashboard routes protected via Clerk middleware

---

## 11. Additional UX Features

- **Onboarding tooltip** — first dashboard visit guides user to upload resume
- **Copy URL button** — one-click copy of public portfolio link
- **Edit / Preview toggle** — see exact public view before publishing
- **Open Graph meta** — portfolio page renders rich previews on LinkedIn/Twitter

---

## 12. Out of Scope (MVP)

- Custom domain per user
- Multiple portfolios per user
- Profile photo upload (can be added post-MVP)
- Analytics (views on public portfolio)
- Email notifications
- Team/org features
