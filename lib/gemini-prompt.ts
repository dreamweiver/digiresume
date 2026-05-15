// lib/gemini-prompt.ts
export function buildResumeParsePrompt(resumeText: string): string {
  return `You are a resume parser. Extract information from the following resume text and return ONLY valid JSON matching this exact structure. Do not include any explanation or markdown — raw JSON only.

{
  "hero": {
    "name": "string — full name",
    "title": "string — job title or professional headline",
    "bio": "string — 2-3 sentence professional summary",
    "profilePhoto": null,
    "gender": "string — infer gender from the person's name: 'male', 'female', or 'unknown' if ambiguous"
  },
  "about": "string — 1-2 paragraph about section",
  "skills": ["array of skill strings"],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "location": "string or empty — city/state/country if mentioned",
      "startDate": "string — full month name and year, e.g. January 2020, or 'Present' for current",
      "endDate": "string — full month name and year, e.g. March 2023, or 'Present' for current",
      "description": "string — a brief summary paragraph of the role. Use \\n to separate multiple paragraphs if the resume has distinct paragraphs.",
      "highlights": ["array of strings — individual bullet points from the resume for this role, preserving original wording. Each array item is one bullet point."],
      "technologies": ["array of strings — specific tools, frameworks, languages, or technologies used in this role"]
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
      "endDate": "year",
      "grade": "string or empty — GPA, CGPA, or percentage if mentioned, e.g. '3.8 GPA', '8.5 CGPA', '85%'"
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
