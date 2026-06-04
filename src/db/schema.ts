import { mysqlTable, serial, varchar, timestamp, boolean, int } from 'drizzle-orm/mysql-core';

/**
 * Users table - for future auth expansion
 */
export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }),
  theme: varchar('theme', { length: 10 }).default('dark'),
  language: varchar('language', { length: 5 }).default('uk'),
  tinyUrlApiKey: varchar('tiny_url_api_key', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

/**
 * Generated links history (persisted to DB in full version)
 */
export const generatedLinks = mysqlTable('generated_links', {
  id: serial('id').primaryKey(),
  userId: int('user_id').references(() => users.id),
  baseUrl: varchar('base_url', { length: 2048 }).notNull(),
  campaignName: varchar('campaign_name', { length: 100 }).notNull(),
  source: varchar('source', { length: 50 }).notNull(),
  medium: varchar('medium', { length: 50 }).notNull(),
  fullUtmUrl: varchar('full_utm_url', { length: 2048 }).notNull(),
  shortUrl: varchar('short_url', { length: 512 }),
  status: varchar('status', { length: 20 }).default('success'),
  errorMessage: varchar('error_message', { length: 512 }),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * Extensible platforms table
 */
export const platforms = mysqlTable('platforms', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * Extensible mediums table
 */
export const mediums = mysqlTable('mediums', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});