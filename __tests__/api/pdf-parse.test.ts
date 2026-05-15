/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import pdf from 'pdf-parse'

describe('pdf-parse integration', () => {
  const fixturePath = resolve(__dirname, '../fixtures/sample-resume.pdf')

  it('extracts text from sample resume PDF', async () => {
    const buffer = readFileSync(fixturePath)
    const data = await pdf(buffer)

    expect(data.text).toBeTruthy()
    expect(data.text.length).toBeGreaterThan(100)
    expect(data.numpages).toBeGreaterThan(0)
  })

  it('contains expected resume keywords', async () => {
    const buffer = readFileSync(fixturePath)
    const data = await pdf(buffer)
    const text = data.text.toLowerCase()

    expect(text).toContain('react')
    expect(text).toContain('manoj')
  })
})
