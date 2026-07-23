import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Clerk
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

// Mock DB
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('@/lib/db/schema', () => ({
  users: { id: 'id', usernameSlug: 'username_slug' },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ op: 'eq', col: a, val: b })),
  ne: vi.fn((a, b) => ({ op: 'ne', col: a, val: b })),
  and: vi.fn((...args) => ({ op: 'and', args })),
}))

import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { GET, POST } from '@/app/api/portfolio/slug/route'

const mockAuth = vi.mocked(auth)
const mockDb = vi.mocked(db)

// Build a `db.select()...limit()` chain resolving to `rows`.
function mockSelect(rows: unknown[]) {
  const limit = vi.fn().mockResolvedValue(rows)
  const where = vi.fn().mockReturnValue({ limit })
  const from = vi.fn().mockReturnValue({ where })
  mockDb.select = vi.fn().mockReturnValue({ from })
}

function mockUpdate(impl: () => Promise<unknown> = () => Promise.resolve(undefined)) {
  const where = vi.fn().mockImplementation(impl)
  const set = vi.fn().mockReturnValue({ where })
  mockDb.update = vi.fn().mockReturnValue({ set })
}

function getReq(slug: string) {
  return { nextUrl: { searchParams: new URLSearchParams({ slug }) } } as never
}

function postReq(body: unknown) {
  return { json: vi.fn().mockResolvedValue(body) } as never
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/portfolio/slug', () => {
  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as never)
    const res = await GET(getReq('jane-doe'))
    expect(res.status).toBe(401)
  })

  it('reports invalid slugs without hitting the DB', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as never)
    const res = await GET(getReq('ab'))
    const json = await res.json()
    expect(json.available).toBe(false)
    expect(json.error).toMatch(/at least 3/i)
    expect(mockDb.select).not.toHaveBeenCalled()
  })

  it('reports reserved words as unavailable', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as never)
    const res = await GET(getReq('admin'))
    const json = await res.json()
    expect(json.available).toBe(false)
    expect(json.error).toMatch(/reserved/i)
  })

  it('returns available when no other user owns the slug', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as never)
    mockSelect([])
    const res = await GET(getReq('jane-doe'))
    const json = await res.json()
    expect(json.available).toBe(true)
    expect(json.slug).toBe('jane-doe')
  })

  it('returns taken when another user owns the slug', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as never)
    mockSelect([{ id: 'user_2' }])
    const res = await GET(getReq('jane-doe'))
    const json = await res.json()
    expect(json.available).toBe(false)
    expect(json.error).toMatch(/already taken/i)
  })

  it('normalizes the input before checking', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as never)
    mockSelect([])
    const res = await GET(getReq('Jane Doe'))
    const json = await res.json()
    expect(json.slug).toBe('jane-doe')
  })

  it('returns 500 when the availability query throws', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as never)
    mockDb.select = vi.fn().mockImplementation(() => {
      throw new Error('db down')
    })
    const res = await GET(getReq('jane-doe'))
    expect(res.status).toBe(500)
  })
})

describe('POST /api/portfolio/slug', () => {
  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as never)
    const res = await POST(postReq({ slug: 'jane-doe' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 for an invalid slug', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as never)
    const res = await POST(postReq({ slug: 'a' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when the body is not valid JSON', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as never)
    const req = { json: vi.fn().mockRejectedValue(new Error('bad json')) } as never
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 409 when the slug is taken by another user', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as never)
    mockSelect([{ id: 'user_2' }])
    const res = await POST(postReq({ slug: 'jane-doe' }))
    expect(res.status).toBe(409)
  })

  it('updates the slug and returns 200 when available', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as never)
    mockSelect([])
    mockUpdate()
    const res = await POST(postReq({ slug: 'Jane Doe' }))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.slug).toBe('jane-doe')
    expect(mockDb.update).toHaveBeenCalled()
  })

  it('returns 409 when the DB rejects with a unique violation', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as never)
    mockSelect([])
    mockUpdate(() => Promise.reject(new Error('duplicate key value violates unique constraint')))
    const res = await POST(postReq({ slug: 'jane-doe' }))
    expect(res.status).toBe(409)
  })

  it('returns 500 on an unexpected DB error', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as never)
    mockSelect([])
    mockUpdate(() => Promise.reject(new Error('connection reset')))
    const res = await POST(postReq({ slug: 'jane-doe' }))
    expect(res.status).toBe(500)
  })
})
