/**
 * Generates synthetic DOCX resume fixtures used by mammoth/route tests.
 *
 * Three variants modeled on patterns seen in real-world referral resumes:
 *
 *  - sample-resume-plain.docx     single column, bare-paragraph section headers,
 *                                 contact line uses multi-space alignment.
 *  - sample-resume-table.docx     "Technical Proficiency" rendered as a table —
 *                                 the most common DOCX layout that flattens
 *                                 unusually under mammoth.extractRawText.
 *  - sample-resume-heading.docx   uses Word Heading 1 style for sections plus
 *                                 bullet lists for experience.
 *
 * Run: `npx tsx scripts/generate-docx-fixtures.ts`
 */
import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'
import { writeFile } from 'fs/promises'
import { resolve } from 'path'

const FIXTURES_DIR = resolve(__dirname, '../__tests__/fixtures')

function p(text: string, opts: { bold?: boolean } = {}): Paragraph {
  return new Paragraph({ children: [new TextRun({ text, bold: opts.bold })] })
}

function bullet(text: string): Paragraph {
  return new Paragraph({ text, bullet: { level: 0 } })
}

function buildPlain(): Document {
  return new Document({
    sections: [
      {
        children: [
          p('JANE DOE', { bold: true }),
          p('Email: jane.doe@example.com    Mobile: +1 555 123 4567'),
          p('LinkedIn: linkedin.com/in/janedoe    Location: San Francisco, CA'),
          p(''),
          p('Profile Summary', { bold: true }),
          p(
            '8 years of experience in full-stack web development with React, Node.js, and TypeScript. ' +
              'Built and shipped products at a Series B startup serving 200k MAU.',
          ),
          p(''),
          p('Skills', { bold: true }),
          p('JavaScript, TypeScript, React, Node.js, PostgreSQL, AWS, Docker, Kubernetes'),
          p(''),
          p('Experience', { bold: true }),
          p('Senior Engineer, Acme Corp — Jan 2021 to Present'),
          p('Led migration of monolith to microservices, reducing p95 latency by 40%.'),
          p(''),
          p('Education', { bold: true }),
          p('B.S. Computer Science, MIT, 2015'),
        ],
      },
    ],
  })
}

function buildTableLayout(): Document {
  const techRow = (label: string, value: string) =>
    new TableRow({
      children: [
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          children: [p(label, { bold: true })],
        }),
        new TableCell({
          width: { size: 5, type: WidthType.PERCENTAGE },
          children: [p(':')],
        }),
        new TableCell({
          width: { size: 65, type: WidthType.PERCENTAGE },
          children: [p(value)],
        }),
      ],
    })

  const techTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      techRow('Languages', 'Java, Python, Go'),
      techRow('Frameworks', 'Spring Boot, Django, Gin'),
      techRow('Databases', 'Oracle, PostgreSQL, Redis'),
      techRow('Cloud', 'AWS, GCP'),
    ],
  })

  return new Document({
    sections: [
      {
        children: [
          p('RAVI KUMAR', { bold: true }),
          p('E-mail: ravi.kumar@example.com'),
          p('Mobile: +91 99876 54321'),
          p(''),
          p('Summary', { bold: true }),
          p(
            'Backend engineer with 6 years of experience building distributed systems for fintech ' +
              'and e-commerce platforms.',
          ),
          p(''),
          p('Technical Proficiency', { bold: true }),
          techTable,
          p(''),
          p('Experience', { bold: true }),
          p('Backend Lead, Fintech Inc — 2020 to Present'),
        ],
      },
    ],
  })
}

function buildHeadingStyles(): Document {
  return new Document({
    sections: [
      {
        children: [
          p('PRIYA SHARMA', { bold: true }),
          p('priya.sharma@example.com | +91 98765 43210'),
          new Paragraph({ text: 'Profile Summary', heading: HeadingLevel.HEADING_1 }),
          p(
            'Frontend engineer specialised in design systems and accessibility. ' +
              'Shipped component libraries used across 30+ internal apps.',
          ),
          new Paragraph({ text: 'Skills', heading: HeadingLevel.HEADING_1 }),
          bullet('React, Vue, Svelte'),
          bullet('TypeScript, JavaScript'),
          bullet('Storybook, Figma, accessibility (WCAG 2.1)'),
          new Paragraph({ text: 'Experience', heading: HeadingLevel.HEADING_1 }),
          p('Senior Frontend Engineer, DesignCo — 2019 to Present'),
          bullet('Built and maintained the company-wide component library.'),
          bullet('Drove migration from CSS-in-JS to vanilla-extract.'),
          new Paragraph({ text: 'Education', heading: HeadingLevel.HEADING_1 }),
          p('B.Tech Computer Science, IIT Delhi, 2018'),
        ],
      },
    ],
  })
}

async function main() {
  const fixtures: Array<[string, Document]> = [
    ['sample-resume-plain.docx', buildPlain()],
    ['sample-resume-table.docx', buildTableLayout()],
    ['sample-resume-heading.docx', buildHeadingStyles()],
  ]

  for (const [name, doc] of fixtures) {
    const buffer = await Packer.toBuffer(doc)
    const out = resolve(FIXTURES_DIR, name)
    await writeFile(out, buffer)
    console.log('wrote', out, '(' + buffer.length + ' bytes)')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
