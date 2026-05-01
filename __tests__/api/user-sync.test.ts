import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Clerk
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}))

// Mock DB
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}))

vi.mock('@/lib/db/schema', () => ({
  users: { id: 'id' },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ col: a, val: b })),
}))

import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { POST } from '@/app/api/user/sync/route'

const mockAuth = vi.mocked(auth)
const mockCurrentUser = vi.mocked(currentUser)
const mockDb = vi.mocked(db)

const existingUser = {
  id: 'user_123',
  usernameSlug: 'jane-smith-ab1234',
  email: 'jane@example.com',
  createdAt: new Date(),
}

function makeSelectChain(rows: unknown[]) {
  const limit = vi.fn().mockResolvedValue(rows)
  const where = vi.fn().mockReturnValue({ limit })
  const from = vi.fn().mockReturnValue({ where })
  return { select: vi.fn().mockReturnValue({ from }) }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/user/sync', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as never)

    const res = await POST()
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.error).toBe('Unauthorized')
  })

  it('returns existing user without inserting', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' } as never)
    const chain = makeSelectChain([existingUser])
    mockDb.select = chain.select

    const res = await POST()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.user.id).toBe(existingUser.id)
    expect(json.user.usernameSlug).toBe(existingUser.usernameSlug)
    expect(json.user.email).toBe(existingUser.email)
    expect(mockDb.insert).not.toHaveBeenCalled()
  })

  it('creates new user on first login', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_456' } as never)
    mockCurrentUser.mockResolvedValue({
      firstName: 'John',
      lastName: 'Doe',
      emailAddresses: [{ emailAddress: 'john@example.com' }],
    } as never)

    const newUser = {
      id: 'user_456',
      usernameSlug: 'john-doe-xyz789',
      email: 'john@example.com',
      createdAt: new Date(),
    }

    let callCount = 0
    const limit = vi.fn().mockImplementation(() => {
      callCount++
      return Promise.resolve(callCount === 1 ? [] : [newUser])
    })
    const where = vi.fn().mockReturnValue({ limit })
    const from = vi.fn().mockReturnValue({ where })
    mockDb.select = vi.fn().mockReturnValue({ from })

    const onConflictDoNothing = vi.fn().mockResolvedValue(undefined)
    const values = vi.fn().mockReturnValue({ onConflictDoNothing })
    mockDb.insert = vi.fn().mockReturnValue({ values })

    const res = await POST()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.user.id).toBe(newUser.id)
    expect(json.user.email).toBe(newUser.email)
    expect(mockDb.insert).toHaveBeenCalled()
  })

  it('returns 500 if currentUser() returns null', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_789' } as never)
    const chain = makeSelectChain([])
    mockDb.select = chain.select
    mockCurrentUser.mockResolvedValue(null)

    const res = await POST()
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toContain('Could not fetch user profile')
  })

  it('creates new user with empty email when no email addresses', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_no_email' } as never)
    mockCurrentUser.mockResolvedValue({
      firstName: 'Jane',
      lastName: null,
      emailAddresses: [],
    } as never)

    const newUser = {
      id: 'user_no_email',
      usernameSlug: 'jane-xyz',
      email: '',
      createdAt: new Date(),
    }

    let callCount = 0
    const limit = vi.fn().mockImplementation(() => {
      callCount++
      return Promise.resolve(callCount === 1 ? [] : [newUser])
    })
    const where = vi.fn().mockReturnValue({ limit })
    const from = vi.fn().mockReturnValue({ where })
    mockDb.select = vi.fn().mockReturnValue({ from })

    const onConflictDoNothing = vi.fn().mockResolvedValue(undefined)
    const values = vi.fn().mockReturnValue({ onConflictDoNothing })
    mockDb.insert = vi.fn().mockReturnValue({ values })

    const res = await POST()
    expect(res.status).toBe(200)
    expect(mockDb.insert).toHaveBeenCalled()
  })
})
