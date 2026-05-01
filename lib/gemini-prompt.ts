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
