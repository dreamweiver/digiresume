// lib/gemini-prompt.ts
export function buildResumeParsePrompt(resumeText: string): string {
  return `You are a resume parser. Extract information from the following resume text and return ONLY valid JSON matching this exact structure. Do not include any explanation or markdown — raw JSON only.

Extraction rules:
- "bio": Extract ONLY from sections explicitly titled "Intro", "Bio", "Objective", "Career Objective", or "Carrier Objective" (the misspelling "Carrier" is common in real resumes). If none of these sections exist, leave it as an empty string. Do NOT invent or summarize.
- "about": Extract from sections titled "About", "About Me", "Profile", "Summary", "Professional Summary", or "Career Summary". If no such section exists, leave it as an empty string. Do NOT fall back to bio here — that is handled downstream.

PDF extraction quirks to be aware of:
- Text extracted from PDFs frequently has missing spaces between adjacent words, dates, or labels (e.g. "Bachelor Of TechnologyCGPA: 7.0", "(+91)9847059251wasim@example.com", "April 2011 – July 2013Developed features"). Use context to infer word/field boundaries; do NOT propagate the merged text into the output verbatim.
- Bullets may use any of these characters: • ● ○ ● ◦ ▪ ■ ▶ ► ➤ – — - * o. Treat them all as bullet markers.
- Soft hyphens (­) and zero-width spaces inside words should be ignored.
- Different dash characters (- – — ~ to) inside date ranges all mean the same thing.

Section heading variations to recognize:
- Experience: "Experience", "Work Experience", "Professional Experience", "Employment", "Employment Details", "Employment History", "Career History", "Work History".
- Education: "Education", "Academics", "Academic Background", "Educational Qualifications", "Qualifications".
- Skills: "Skills", "Technical Skills", "Technical Strengths", "Tools and Technologies", "Languages and Technologies", "Tech Stack", "Core Competencies", "Key Skills", "Expertise".
- Projects: "Projects", "Personal Projects", "Side Projects", "Academic Projects", "Notable Projects", "Key Projects".

Skills extraction rules:
- Skills sections often group items under category prefixes such as "Frontend:", "Backend:", "Languages:", "Databases:", "Frameworks:", "Tools:", "Proficient:", "Comfortable:", "Familiar:", "Others:". Flatten ALL of them into one array; drop the category label itself.
- Spoken languages (English, Hindi, Spanish, French, Mandarin, etc.) are NOT skills. If a section is literally titled "Languages" and lists spoken languages with proficiency levels, exclude it from the skills array.
- Trim whitespace and remove duplicates from the final skills array.
- Dates separators inside a tech-stack list (commas, semicolons, pipes "|", slashes) all mean the same thing — split on any of them.

Experience extraction rules:
- "company" should be the company name only. If the resume writes "Cvent India Private Limited, Gurgaon" or "QBurst Technologies, Thrissur", extract "Cvent India Private Limited" / "QBurst Technologies" as the company and "Gurgaon" / "Thrissur" as the location.
- Date phrases "Present", "Current", "Now", "Till date", "To date", "Ongoing" all mean the role is current; output exactly "Present" for endDate in that case.
- "highlights" must contain individual bullet points from the resume for this role, in the order they appear. Strip the bullet marker itself but preserve the original wording.
- "technologies" should be a flat list of specific tools/frameworks/languages used in this role; do not include soft skills (e.g. "leadership", "agile") in this array.

Education extraction rules:
- "grade" captures GPA / CGPA / percentage / class. Examples: "8.42 CGPA", "7.2 / 10", "85%", "First Class with Distinction". Leave empty if not mentioned.
- Degrees often appear on a separate line below the institution (sometimes prefixed with a bullet). Pair them up.

Social links rules:
- Only fill github / linkedin / twitter / website when explicit URLs (or "linkedin.com/in/...", "github.com/...") are present in the resume. Do NOT guess or construct URLs.
- "email" must be a valid email address; "phone" must be a phone/mobile number with country code preserved if present. Phone and email are often glued together in extracted text — split on the "@" boundary or the digit/letter transition.

Things to ignore:
- References / Referees sections.
- Hobbies / Interests / Extra-curricular sections.
- Personal details such as date of birth, marital status, nationality (except gender, which we infer from the name below), passport, blood group, postal address.
- Decorative dividers, page numbers, headers/footers repeated across pages.

JSON schema (return EXACTLY this shape):

{
  "hero": {
    "name": "string — full name",
    "title": "string — job title or professional headline; if not stated, infer from the most recent role",
    "bio": "string — content from 'Intro', 'Bio', 'Objective', 'Career Objective', or 'Carrier Objective' section ONLY; empty string otherwise",
    "profilePhoto": null,
    "gender": "string — infer gender from the person's name: 'male', 'female', or 'unknown' if ambiguous"
  },
  "about": "string — content from 'About', 'About Me', 'Profile', 'Summary', 'Professional Summary', or 'Career Summary' section ONLY; empty string otherwise",
  "skills": ["array of distinct, deduplicated technical skill strings"],
  "experience": [
    {
      "company": "string — company name only, without location",
      "role": "string",
      "location": "string or empty — city/state/country if mentioned (e.g. 'Bangalore', 'Gurgaon, India')",
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
      "startDate": "string — full month and year if available, otherwise just the year",
      "endDate": "string — full month and year if available, otherwise just the year",
      "grade": "string or empty — GPA, CGPA, percentage, or class if mentioned, e.g. '3.8 GPA', '8.5 CGPA', '85%', 'First Class'"
    }
  ],
  "socialLinks": {
    "github": "string or empty — only if a github.com URL is explicitly present",
    "linkedin": "string or empty — only if a linkedin.com URL is explicitly present",
    "twitter": "string or empty — only if a twitter.com / x.com URL is explicitly present",
    "website": "string or empty — only if a personal website URL is explicitly present",
    "email": "string or empty — email address if mentioned",
    "phone": "string or empty — phone/mobile number if mentioned, include country code if available"
  }
}

Resume text:
---
${resumeText}
---`
}
