import { sql } from "drizzle-orm";
import {
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  tinyint,
  uniqueIndex,
  varchar,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Intent Capture fields
  userRole: mysqlEnum("userRole", [
    "bride",
    "groom",
    "planner",
    "family_member",
  ]),
  intentReason: mysqlEnum("intentReason", [
    "planning",
    "helping",
    "inspiration",
    "guest_management",
  ]),
  priorities: text("priorities"), // JSON array stored as text, default: []
  preEnrollmentCompleted: tinyint("preEnrollmentCompleted")
    .default(0)
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User wedding profile table storing onboarding data and preferences.
 * One profile per user.
 */
export const userProfiles = mysqlTable("userProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  firstName: varchar("firstName", { length: 255 }).notNull(),
  partnerName: varchar("partnerName", { length: 255 }).notNull(),
  weddingDate: varchar("weddingDate", { length: 10 }).notNull(), // YYYY-MM-DD format
  location: varchar("location", { length: 255 }).notNull(),
  venueArea: text("venueArea"),
  guestCount: int("guestCount").notNull(),
  styleTags: text("styleTags").notNull(), // JSON array stored as text
  // Contact details
  primaryContactName: varchar("primaryContactName", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  // Budget and preferences
  budgetRange: varchar("budgetRange", { length: 100 }),
  preferredVenues: text("preferredVenues"), // JSON array of venue IDs stored as text
  preferredVenueId: varchar("preferredVenueId", { length: 255 }), // Single preferred venue ID
  preferredArea: varchar("preferredArea", { length: 255 }), // Free-text area/town name
  // Additional profile fields
  country: varchar("country", { length: 255 }), // Country of residence
  backupDate: varchar("backupDate", { length: 10 }), // Backup wedding date (YYYY-MM-DD)
  preferredContactMethod: varchar("preferredContactMethod", { length: 50 }), // Email, WhatsApp, Phone, Other
  weddingStyles: text("weddingStyles"), // JSON array of wedding style preferences
  mustHaves: text("mustHaves"), // Free-text notes for must-haves and non-negotiables
  onboardingData: text("onboardingData"), // JSON object storing complete onboarding responses
  onboardingCompleted: int("onboardingCompleted").default(0).notNull(), // 0 = false, 1 = true
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Planning tasks table for wedding checklist
 */
export const planningTasks = mysqlTable("planningTasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  timeframe: varchar("timeframe", { length: 100 }).notNull(),
  isCompleted: int("isCompleted").default(0).notNull(), // 0 = false, 1 = true
  dueOffsetInDays: int("dueOffsetInDays"),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlanningTask = typeof planningTasks.$inferSelect;
export type InsertPlanningTask = typeof planningTasks.$inferInsert;

/**
 * Timeline events table for wedding day schedule
 */
export const timelineEvents = mysqlTable("timelineEvents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  startTime: varchar("startTime", { length: 10 }).notNull(), // Format: "HH:MM"
  endTime: varchar("endTime", { length: 10 }), // Format: "HH:MM"
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type InsertTimelineEvent = typeof timelineEvents.$inferInsert;

/**
 * Venues table for wedding venue information
 */
export const venues = mysqlTable("venues", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  capacityMin: int("capacityMin"),
  capacityMax: int("capacityMax"),
  shortDescription: text("shortDescription").notNull(),
  keyFeatures: text("keyFeatures").notNull(), // JSON array stored as text
  heroImageUrl: varchar("heroImageUrl", { length: 500 }).notNull(),
  galleryImageUrls: text("galleryImageUrls").notNull(), // JSON array stored as text
  isFeatured: int("isFeatured").default(0).notNull(), // 0 = false, 1 = true
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Venue = typeof venues.$inferSelect;
export type InsertVenue = typeof venues.$inferInsert;

/**
 * Venue favorites table for user's shortlisted venues
 */
export const venueFavorites = mysqlTable(
  "venueFavorites",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    venueId: varchar("venueId", { length: 100 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    // Unique constraint to prevent duplicate favorites
    userVenueUnique: uniqueIndex("user_venue_unique").on(
      table.userId,
      table.venueId
    ),
  })
);

export type VenueFavorite = typeof venueFavorites.$inferSelect;
export type InsertVenueFavorite = typeof venueFavorites.$inferInsert;

/**
 * Collections table for wedding collection packages
 */
export const collections = mysqlTable("collections", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  venueId: varchar("venueId", { length: 100 }).notNull(),
  priceBand: varchar("priceBand", { length: 255 }).notNull(),
  tagline: varchar("tagline", { length: 500 }).notNull(),
  shortDescription: text("shortDescription").notNull(),
  keyHighlights: text("keyHighlights").notNull(), // JSON array stored as text
  heroImageUrl: varchar("heroImageUrl", { length: 500 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Collection = typeof collections.$inferSelect;
export type InsertCollection = typeof collections.$inferInsert;

/**
 * Inquiry table for venue and collection enquiries
 */
export const inquiries = mysqlTable("inquiries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  venueId: varchar("venueId", { length: 100 }),
  collectionId: varchar("collectionId", { length: 100 }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  weddingDate: varchar("weddingDate", { length: 50 }),
  guestCount: int("guestCount"),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["pending", "contacted", "booked"])
    .default("pending")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;
/**
 * Budget table storing overall wedding budget per user
 */
export const budgets = mysqlTable("budgets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  totalBudget: int("totalBudget").notNull(), // Stored in cents/pence
  currency: mysqlEnum("currency", ["EUR", "GBP"]).default("EUR").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;

/**
 * Budget categories table for tracking allocation per category
 */
export const budgetCategories = mysqlTable("budgetCategories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryName: varchar("categoryName", { length: 255 }).notNull(),
  allocatedAmount: int("allocatedAmount").notNull(), // Stored in cents/pence
  actualSpend: int("actualSpend").default(0).notNull(), // Stored in cents/pence
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BudgetCategory = typeof budgetCategories.$inferSelect;
export type InsertBudgetCategory = typeof budgetCategories.$inferInsert;

/**
 * Budget expenses table for tracking individual expenses
 */
export const budgetExpenses = mysqlTable("budgetExpenses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  vendor: varchar("vendor", { length: 255 }),
  cost: int("cost").notNull(), // Stored in cents/pence
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD format
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BudgetExpense = typeof budgetExpenses.$inferSelect;
export type InsertBudgetExpense = typeof budgetExpenses.$inferInsert;

/**
 * Dossier Library table for curated wedding planning resources
 */
export const dossiers = mysqlTable("dossiers", {
  id: varchar("id", { length: 100 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", [
    "Venues",
    "Packages",
    "Décor",
    "Planning",
    "Legal",
    "Other",
  ]).notNull(),
  fileUrl: text("fileUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  isFeatured: boolean("isFeatured").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Dossier = typeof dossiers.$inferSelect;
export type InsertDossier = typeof dossiers.$inferInsert;

/**
 * Share links table for generating shareable wedding profile links
 */
export const shareLinks = mysqlTable("shareLinks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  shareToken: varchar("shareToken", { length: 64 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  viewCount: int("viewCount").default(0).notNull(),
});

export type ShareLink = typeof shareLinks.$inferSelect;
export type InsertShareLink = typeof shareLinks.$inferInsert;

export const supplierPackages = mysqlTable(
  "supplier_packages",
  {
    id: int("id").autoincrement().primaryKey(),
    category: varchar("category", { length: 255 }).notNull(),
    supplierName: varchar("supplierName", { length: 255 }).notNull(),
    packageName: varchar("packageName", { length: 255 }).notNull(),
    clientRate: decimal("clientRate", { precision: 12, scale: 2 }).default("0"),
    deposit: decimal("deposit", { precision: 12, scale: 2 })
      .default("0")
      .notNull(),
    commission: decimal("commission", { precision: 12, scale: 2 })
      .default("0")
      .notNull(),
    notes: text("notes"),
  },
  table => ({
    categoryIdx: index("supplier_packages_category_idx").on(table.category),
  })
);

// Example seed ideas (kept as comments for reference):
// - Beziique Sunset: client €1350, commission €238
// - DJ Jason: client €450
// - Harpist Sofia: client €320

export type SupplierPackage = typeof supplierPackages.$inferSelect;
export type InsertSupplierPackage = typeof supplierPackages.$inferInsert;

export const quotes = mysqlTable(
  "quotes",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    status: mysqlEnum("status", ["draft", "submitted", "revising", "agreed"])
      .default("draft")
      .notNull(),
    items: json("items")
      .$type<unknown[]>()
      .default(sql`(json_array())`)
      .notNull(),
    plannerNotes: text("plannerNotes"),
    totalClient: decimal("totalClient", { precision: 14, scale: 2 })
      .default("0")
      .notNull(),
    commissionTotal: decimal("commissionTotal", { precision: 14, scale: 2 })
      .default("0")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    userIdx: index("quotes_user_idx").on(table.userId),
    statusIdx: index("quotes_status_idx").on(table.status),
  })
);

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;
