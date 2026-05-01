// lib/db/schema.ts
import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  usernameSlug: text('username_slug').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const portfolios = pgTable('portfolios', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('draft'),
  portfolioData: text('portfolio_data'),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Portfolio = typeof portfolios.$inferSelect
export type NewPortfolio = typeof portfolios.$inferInsert
