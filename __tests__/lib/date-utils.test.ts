import { describe, it, expect } from 'vitest'
import { parseMonthYear, isPresentLike, rangesOverlap } from '@/lib/date-utils'

describe('parseMonthYear', () => {
  it('parses full month names', () => {
    expect(parseMonthYear('January 2020')).toEqual(new Date(2020, 0, 1))
    expect(parseMonthYear('December 1999')).toEqual(new Date(1999, 11, 1))
  })

  it('parses three-letter month abbreviations', () => {
    expect(parseMonthYear('Jan 2020')).toEqual(new Date(2020, 0, 1))
    expect(parseMonthYear('Sep 2019')).toEqual(new Date(2019, 8, 1))
    expect(parseMonthYear('Sept 2019')).toEqual(new Date(2019, 8, 1))
  })

  it('parses ISO-like YYYY-MM and YYYY/MM', () => {
    expect(parseMonthYear('2022-01')).toEqual(new Date(2022, 0, 1))
    expect(parseMonthYear('2022/12')).toEqual(new Date(2022, 11, 1))
  })

  it('parses year-only as January of that year', () => {
    expect(parseMonthYear('2018')).toEqual(new Date(2018, 0, 1))
  })

  it('resolves "Present"-like tokens to today\'s month', () => {
    const today = new Date()
    const expected = new Date(today.getFullYear(), today.getMonth(), 1)
    for (const token of ['Present', 'current', 'NOW', 'Till date', 'to date', 'Ongoing']) {
      expect(parseMonthYear(token)).toEqual(expected)
    }
  })

  it('trims whitespace and is case-insensitive', () => {
    expect(parseMonthYear('  january 2020  ')).toEqual(new Date(2020, 0, 1))
    expect(parseMonthYear('JANUARY 2020')).toEqual(new Date(2020, 0, 1))
  })

  it('returns null for empty / unparseable input', () => {
    expect(parseMonthYear('')).toBeNull()
    expect(parseMonthYear('   ')).toBeNull()
    expect(parseMonthYear('not a date')).toBeNull()
    expect(parseMonthYear('2022-13')).toBeNull()
    // @ts-expect-error testing runtime guard
    expect(parseMonthYear(null)).toBeNull()
  })
})

describe('isPresentLike', () => {
  it('matches the canonical synonyms', () => {
    for (const token of ['present', 'Current', 'now', 'TILL DATE', 'to date', 'Ongoing']) {
      expect(isPresentLike(token)).toBe(true)
    }
  })

  it('rejects unrelated tokens', () => {
    expect(isPresentLike('past')).toBe(false)
    expect(isPresentLike('January 2020')).toBe(false)
    expect(isPresentLike('')).toBe(false)
  })
})

describe('rangesOverlap', () => {
  const range = (sy: number, sm: number, ey: number, em: number) => ({
    start: new Date(sy, sm, 1),
    end: new Date(ey, em, 1),
  })

  it('detects clear overlap', () => {
    const a = range(2020, 0, 2022, 5)
    const b = range(2021, 0, 2023, 0)
    expect(rangesOverlap(a, b)).toBe(true)
    expect(rangesOverlap(b, a)).toBe(true)
  })

  it('treats back-to-back ranges as non-overlapping', () => {
    // role A: Jan 2020 -> Jan 2022
    // role B: Jan 2022 -> Jan 2024
    const a = range(2020, 0, 2022, 0)
    const b = range(2022, 0, 2024, 0)
    expect(rangesOverlap(a, b)).toBe(false)
  })

  it('detects nested overlap', () => {
    const outer = range(2018, 0, 2024, 0)
    const inner = range(2020, 5, 2021, 11)
    expect(rangesOverlap(outer, inner)).toBe(true)
  })

  it('returns false for fully separate ranges', () => {
    const a = range(2018, 0, 2019, 0)
    const b = range(2022, 0, 2024, 0)
    expect(rangesOverlap(a, b)).toBe(false)
  })
})
