import { mysqlTable, varchar, text, timestamp, boolean, int } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = mysqlTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }),
  password: text('password'),
  tinyUrlApiKey: text('tiny_url_api_key'),
  theme: varchar('theme', { length: 10 }).default('dark'), // 'light' or 'dark'
  language: varchar('language', { length: 5 }).default('uk'), // 'uk' or 'en'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Generated links history table
export const generatedLinks = mysqlTable('generated_links', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  baseUrl: text('base_url').notNull(),
  campaignName: varchar('campaign_name', { length: 255 }).notNull(),
  source: varchar('source', { length: 50 }).notNull(), // tg, fb, li, ig, threads
  medium: varchar('medium', { length: 50 }).notNull(), // post, story, reels
  fullUtmUrl: text('full_utm_url').notNull(),
  shortUrl: text('short_url'),
  status: varchar('status', { length: 20 }).default('pending'), // pending, success, failed
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'), // 1 week from creation
});

// Supported platforms (extensible)
export const platforms = mysqlTable('platforms', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 50 }).unique().notNull(), // tg, fb, li, ig, threads
  icon: varchar('icon', { length: 255 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Supported mediums (extensible)
export const mediums = mysqlTable('mediums', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 50 }).unique().notNull(), // post, story, reels
  icon: varchar('icon', { length: 255 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  generatedLinks: many(generatedLinks),
}));

export const generatedLinksRelations = relations(generatedLinks, ({ one }) => ({
  user: one(users, {
    fields: [generatedLinks.userId],
    references: [users.id],
  }),
}));
