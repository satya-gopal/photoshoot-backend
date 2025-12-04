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

// 🆕 NEW: menupackages table for all those category-based packages
export const menupackages = pgTable('menupackages', {
  id: serial('id').primaryKey(),

  // newbornshoot | modelshoot | maternityshoot | birthdayshoot | babyshoot
  category: text('category').notNull(),

  // "Package 1", "Package 2", or any title
  title: text('title').notNull(),

  // "1 Hour Shoot", "Total 8 Hour's Shoot", etc.
  duration: text('duration').notNull(),

  // main features: backdrops, themes, albums, etc. (stored as TEXT[])
  features: text('features').array().notNull(),

  // video-related details (TEXT[]), can be empty
  videoDetails: text('video_details').array(),

  // complimentary free items (TEXT[])
  complimentaryItems: text('complimentary_items').array(),

  // original price like "21,000"
  originalPrice: text('original_price').notNull(),

  // offer price like "14,999"
  price: text('price').notNull(),

  // optional discount label like "40%" if you want
  discount: text('discount'),

  // optional badge like "Best Package"
  badge: text('badge'),

  isPublished: boolean('is_published').default(true).notNull(),
  order: integer('order').default(0),            // sorting inside category

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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

// 🆕 types for menupackages
export type MenuPackage = typeof menupackages.$inferSelect;
export type InsertMenuPackage = typeof menupackages.$inferInsert;
