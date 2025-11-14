import { pgTable, text, serial, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sections = pgTable('sections', {
  id: serial('id').primaryKey(),
  page: text('page').notNull(),
  sectionKey: text('section_key').notNull().unique(),
  title: text('title'),
  description: text('description'),
  content: text('content'),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const images = pgTable('images', {
  id: serial('id').primaryKey(),
  sectionId: integer('section_id').references(() => sections.id),
  imageKey: text('image_key').notNull().unique(),
  imagePath: text('image_path').notNull(),
  altText: text('alt_text'),
  order: integer('order').default(0),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const packages = pgTable('packages', {
  id: serial('id').primaryKey(),
  discount: text('discount').notNull(),           // e.g. "40%"
  title: text('title').notNull(),                // "1 DAY/nBaby Shoot"
  badge: text('badge'),                          // "Best Package"
  isPublished: boolean('is_published').default(true).notNull(),
  order: integer('order').default(0),            // sorting
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),                  // "Christopher L."
  text: text('text').notNull(),                  // review content
  rating: integer('rating').default(5).notNull(),// 1–5 stars
  platform: text('platform').default('google'),  // google / instagram / website
  yearsAgo: text('years_ago').default('1 year ago'),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});


export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = typeof admins.$inferInsert;
export type Section = typeof sections.$inferSelect;
export type InsertSection = typeof sections.$inferInsert;
export type Image = typeof images.$inferSelect;
export type InsertImage = typeof images.$inferInsert;
export type Package = typeof packages.$inferSelect;
export type InsertPackage = typeof packages.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
