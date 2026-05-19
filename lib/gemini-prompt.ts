// lib/gemini-prompt.ts
export function buildResumeParsePrompt(resumeText: string): string {
  return `You are a resume parser. Extract information from the following resume text and return ONLY valid JSON matching this exact structure. Do not include any explanation or markdown — raw JSON only.

Extraction rules:
- "bio": Extract ONLY from sections explicitly titled "Intro", "Bio", or "Objective" in the resume. If none of these sections exist, leave it as an empty string. Do NOT invent or summarize.
- "about": Extract from sections titled "About", "About Me", "Profile", or "Summary". If no such section exists, leave it as an empty string. Do NOT fall back to bio here — that is handled downstream.

{
  "hero": {
    "name": "string — full name",
    "title": "string — job title or professional headline",
    "bio": "string — content from 'Intro', 'Bio', or 'Objective' section ONLY; empty string if none of these sections exist",
    "profilePhoto": null,
    "gender": "string — infer gender from the person's name: 'male', 'female', or 'unknown' if ambiguous"
  },
  "about": "string — content from 'About', 'About Me', 'Profile', or 'Summary' section ONLY; empty string if none of these exist",
  "skills": ["array of skill strings"],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "location": "string or empty — city/state/country if mentioned",
      "startDate": "string — full month name and year, e.g. January 2020, or 'Present' for current",
      "endDate": "string — full month name and year, e.g. March 2023, or 'Present' for current",
      "description": "string — a brief summary of the role covering key responsibilities, day-to-day activities, and achievements. Include all relevant details from the resume. Use \\n to separate distinct paragraphs if needed.",
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
    "website": "",
    "email": "string or empty — email address if mentioned",
    "phone": "string or empty — phone/mobile number if mentioned, include country code if available"
  }
}

Resume text:
---
${resumeText}
---`
}
