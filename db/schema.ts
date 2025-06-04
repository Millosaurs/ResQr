// src/db/schema.ts
import { pgTable, uuid, text, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { user } from '../migrations/drizzle/schema'; // Adjust the import path as necessary

export const restaurants = pgTable('restaurants', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  googleBusinessUrl: text('google_business_url'),
  googleRating: varchar('google_rating', { length: 3 }),
  cuisineType: varchar('cuisine_type', { length: 100 }),
  description: text('description'),
  logoUrl: text('logo_url'),
  colorTheme: varchar('color_theme', { length: 7 }).default('#000000'),
  isActive: boolean('is_active').default(true),
  subscriptionTier: varchar('subscription_tier', { length: 20 }).default('FREE'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});


type Restaurant = typeof restaurants.$inferSelect;
type NewRestaurant = typeof restaurants.$inferInsert;
