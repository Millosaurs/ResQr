import {
  pgTable,
  foreignKey,
  unique,
  text,
  timestamp,
  boolean,
  serial,
  varchar,
  uuid,
  integer,
  decimal,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const user = pgTable(
  "user",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean().notNull(),
    image: text(),
    createdAt: timestamp({ mode: "string" }).notNull(),
    updatedAt: timestamp({ mode: "string" }).notNull(),
    hasRestaurant: boolean(),
  },
  (table) => [unique("user_email_key").on(table.email)]
);

export const session = pgTable(
  "session",
  {
    id: text().primaryKey().notNull(),
    expiresAt: timestamp({ mode: "string" }).notNull(),
    token: text().notNull(),
    createdAt: timestamp({ mode: "string" }).notNull(),
    updatedAt: timestamp({ mode: "string" }).notNull(),
    ipAddress: text(),
    userAgent: text(),
    userId: text().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "session_userId_fkey",
    }),
    unique("session_token_key").on(table.token),
  ]
);

export const account = pgTable(
  "account",
  {
    id: text().primaryKey().notNull(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text().notNull(),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ mode: "string" }),
    refreshTokenExpiresAt: timestamp({ mode: "string" }),
    scope: text(),
    password: text(),
    createdAt: timestamp({ mode: "string" }).notNull(),
    updatedAt: timestamp({ mode: "string" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "account_userId_fkey",
    }),
  ]
);

export const verification = pgTable("verification", {
  id: text().primaryKey().notNull(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp({ mode: "string" }).notNull(),
  createdAt: timestamp({ mode: "string" }),
  updatedAt: timestamp({ mode: "string" }),
});

export const images = pgTable(
  "images",
  {
    id: serial().primaryKey().notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    imageUrl: text("image_url").notNull(),
    imagekitFileId: varchar("imagekit_file_id", { length: 100 }).notNull(),
    uploadedBy: text("uploaded_by"),
    imageType: varchar("image_type", { length: 50 }).default("general"),
    uploadedAt: timestamp("uploaded_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.uploadedBy],
      foreignColumns: [user.id],
      name: "images_uploaded_by_user_id_fk",
    }).onDelete("set null"),
  ]
);

export const restaurants = pgTable(
  "restaurants",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    ownerId: text("owner_id").notNull(),
    name: varchar({ length: 255 }).notNull(),
    address: text(),
    phone: varchar({ length: 20 }),
    email: varchar({ length: 255 }),
    googleBusinessUrl: text("google_business_url"),
    googleRating: varchar("google_rating", { length: 3 }),
    cuisineType: varchar("cuisine_type", { length: 100 }),
    description: text(),
    logoUrl: text("logo_url"),
    colorTheme: varchar("color_theme", { length: 7 }).default("#000000"),
    isActive: boolean("is_active").default(true),
    subscriptionTier: varchar("subscription_tier", { length: 20 }).default(
      "FREE"
    ),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    logoImageId: integer("logo_image_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.ownerId],
      foreignColumns: [user.id],
      name: "restaurants_owner_id_user_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.logoImageId],
      foreignColumns: [images.id],
      name: "restaurants_logo_image_id_images_id_fk",
    }).onDelete("set null"),
  ]
);

export const menus = pgTable(
  "menus",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    restaurantId: uuid("restaurant_id").notNull(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    slug: varchar({ length: 255 }).notNull(), // Added missing slug field
    isPublished: boolean("is_published").default(false),
    isActive: boolean("is_active").default(true),
    displayOrder: integer("display_order").default(0), // Added missing displayOrder field
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.restaurantId],
      foreignColumns: [restaurants.id],
      name: "menus_restaurant_id_restaurants_id_fk",
    }).onDelete("cascade"),
    unique("menus_slug_key").on(table.slug), // Added unique constraint for slug
  ]
);

export const menuCategories = pgTable(
  "menu_categories",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    menuId: uuid("menu_id").notNull(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    sortOrder: integer("sort_order").default(0),
    displayOrder: integer("display_order").default(0), // Added missing displayOrder field
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.menuId],
      foreignColumns: [menus.id],
      name: "menu_categories_menu_id_menus_id_fk",
    }).onDelete("cascade"),
  ]
);

export const menuItems = pgTable(
  "menu_items",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    categoryId: uuid("category_id"), // Made nullable since items can be uncategorized
    menuId: uuid("menu_id").notNull(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    price: decimal({ precision: 10, scale: 2 }).notNull(),
    estimatedTime: integer("estimated_time"), // in minutes
    ingredients: text(), // JSON string of ingredients array
    imageUrl: text("image_url"),
    imageId: integer("image_id"),
    isVegetarian: boolean("is_vegetarian").default(false),
    isVegan: boolean("is_vegan").default(false),
    isGlutenFree: boolean("is_gluten_free").default(false),
    isSpicy: boolean("is_spicy").default(false),
    isAvailable: boolean("is_available").default(true),
    sortOrder: integer("sort_order").default(0),
    displayOrder: integer("display_order").default(0), // Added missing displayOrder field
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [menuCategories.id],
      name: "menu_items_category_id_menu_categories_id_fk",
    }).onDelete("set null"), // Changed to set null to allow uncategorized items
    foreignKey({
      columns: [table.menuId],
      foreignColumns: [menus.id],
      name: "menu_items_menu_id_menus_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.imageId],
      foreignColumns: [images.id],
      name: "menu_items_image_id_images_id_fk",
    }).onDelete("set null"),
  ]
);
