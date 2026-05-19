// Month-year parsing for resume date ranges.
//
// Resume dates in this app come from two sources: the Gemini parser (which we
// instruct to emit "January 2020" full month names) and the manual editor
// (where the user types whatever they want). We normalise both into Date
// objects pinned to day-1 of the month so callers can compare ranges.

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
}

const PRESENT_TOKENS = new Set(['present', 'current', 'now', 'till date', 'to date', 'ongoing'])

export function isPresentLike(s: string): boolean {
  return PRESENT_TOKENS.has(s.trim().toLowerCase())
}

// Returns a Date pinned to the 1st of the parsed month, or null if the input
// is empty / unparseable. "Present"-like tokens resolve to today.
export function parseMonthYear(s: string): Date | null {
  if (typeof s !== 'string') return null
  const trimmed = s.trim()
  if (!trimmed) return null

  if (isPresentLike(trimmed)) {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  }

  // "January 2020", "Jan 2020", "Sept 2019"
  const monthYear = trimmed.match(/^([A-Za-z.]+)[\s,.-]+(\d{4})$/)
  if (monthYear) {
    const monthKey = monthYear[1].toLowerCase().replace(/\.$/, '')
    const month = MONTHS[monthKey]
    if (month !== undefined) {
      return new Date(parseInt(monthYear[2], 10), month, 1)
    }
  }

  // "2022-01", "2022/01", "2022.01"
  const isoLike = trimmed.match(/^(\d{4})[-/.](\d{1,2})$/)
  if (isoLike) {
    const year = parseInt(isoLike[1], 10)
    const month = parseInt(isoLike[2], 10) - 1
    if (month >= 0 && month <= 11) {
      return new Date(year, month, 1)
    }
  }

  // Year only — pin to January.
  const yearOnly = trimmed.match(/^(\d{4})$/)
  if (yearOnly) {
    return new Date(parseInt(yearOnly[1], 10), 0, 1)
  }

  return null
}

// Strict overlap: two ranges that touch at a single boundary (one ends in
// month M, the next starts in month M) do NOT overlap. This lets users record
// back-to-back roles without false-positive errors.
export function rangesOverlap(
  a: { start: Date; end: Date },
  b: { start: Date; end: Date },
): boolean {
  return a.start < b.end && b.start < a.end
}
