import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  userProfiles,
  InsertUserProfile,
  planningTasks,
  InsertPlanningTask,
  timelineEvents,
  InsertTimelineEvent,
  venues,
  InsertVenue,
  collections,
  InsertCollection,
  venueFavorites,
  InsertVenueFavorite,
  inquiries,
  InsertInquiry,
  budgets,
  InsertBudget,
  budgetCategories,
  InsertBudgetCategory,
  budgetExpenses,
  InsertBudgetExpense,
  dossiers,
  shareLinks,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get user profile by user ID
 */
export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user profile: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create or update user profile
 */
export async function upsertUserProfile(
  profile: Omit<InsertUserProfile, "id" | "createdAt" | "updatedAt">
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existing = await getUserProfile(profile.userId);

  if (existing) {
    // Update existing profile
    await db
      .update(userProfiles)
      .set({
        firstName: profile.firstName,
        partnerName: profile.partnerName,
        weddingDate: profile.weddingDate,
        location: profile.location,
        venueArea: profile.venueArea,
        guestCount: profile.guestCount,
        styleTags: profile.styleTags,
        onboardingCompleted: profile.onboardingCompleted,
      })
      .where(eq(userProfiles.userId, profile.userId));

    return await getUserProfile(profile.userId);
  } else {
    // Insert new profile
    await db.insert(userProfiles).values(profile);
    return await getUserProfile(profile.userId);
  }
}

/**
 * Get all planning tasks for a user
 */
export async function getUserPlanningTasks(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot get planning tasks: database not available"
    );
    return [];
  }

  const result = await db
    .select()
    .from(planningTasks)
    .where(eq(planningTasks.userId, userId));
  return result;
}

/**
 * Create multiple planning tasks
 */
export async function createPlanningTasks(
  tasks: Omit<InsertPlanningTask, "id" | "createdAt" | "updatedAt">[]
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  if (tasks.length === 0) return [];

  await db.insert(planningTasks).values(tasks);
  return await getUserPlanningTasks(tasks[0].userId);
}

/**
 * Toggle task completion status
 */
export async function toggleTaskCompletion(taskId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get current task
  const tasks = await db
    .select()
    .from(planningTasks)
    .where(and(eq(planningTasks.id, taskId), eq(planningTasks.userId, userId)))
    .limit(1);

  if (tasks.length === 0) {
    throw new Error("Task not found");
  }

  const currentTask = tasks[0];
  const newStatus = currentTask.isCompleted === 1 ? 0 : 1;

  await db
    .update(planningTasks)
    .set({ isCompleted: newStatus })
    .where(and(eq(planningTasks.id, taskId), eq(planningTasks.userId, userId)));

  return newStatus === 1;
}

/**
 * Get all timeline events for a user
 */
export async function getUserTimelineEvents(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot get timeline events: database not available"
    );
    return [];
  }

  const result = await db
    .select()
    .from(timelineEvents)
    .where(eq(timelineEvents.userId, userId));
  return result;
}

/**
 * Create multiple timeline events
 */
export async function createTimelineEvents(
  events: Omit<InsertTimelineEvent, "id" | "createdAt" | "updatedAt">[]
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  if (events.length === 0) return [];

  await db.insert(timelineEvents).values(events);
  return await getUserTimelineEvents(events[0].userId);
}

/**
 * Create a single timeline event
 */
export async function createTimelineEvent(
  event: Omit<InsertTimelineEvent, "id" | "createdAt" | "updatedAt">
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.insert(timelineEvents).values(event);
  return await getUserTimelineEvents(event.userId);
}

/**
 * Update a timeline event
 */
export async function updateTimelineEvent(
  eventId: number,
  userId: number,
  updates: {
    title?: string;
    description?: string | null;
    startTime?: string;
    endTime?: string | null;
    sortOrder?: number;
  }
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(timelineEvents)
    .set(updates)
    .where(
      and(eq(timelineEvents.id, eventId), eq(timelineEvents.userId, userId))
    );

  return await getUserTimelineEvents(userId);
}

/**
 * Delete a timeline event
 */
export async function deleteTimelineEvent(eventId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .delete(timelineEvents)
    .where(
      and(eq(timelineEvents.id, eventId), eq(timelineEvents.userId, userId))
    );

  return await getUserTimelineEvents(userId);
}

/**
 * Get all venues
 */
export async function getAllVenues() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get venues: database not available");
    return [];
  }

  const result = await db.select().from(venues);
  return result.map(venue => ({
    ...venue,
    keyFeatures: JSON.parse(venue.keyFeatures),
    galleryImageUrls: JSON.parse(venue.galleryImageUrls),
    isFeatured: venue.isFeatured === 1,
  }));
}

/**
 * Get a single venue by ID
 */
export async function getVenueById(venueId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get venue: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(venues)
    .where(eq(venues.id, venueId))
    .limit(1);
  if (result.length === 0) return undefined;

  const venue = result[0];
  return {
    ...venue,
    keyFeatures: JSON.parse(venue.keyFeatures),
    galleryImageUrls: JSON.parse(venue.galleryImageUrls),
    isFeatured: venue.isFeatured === 1,
  };
}

/**
 * Create or update venues (for seeding)
 */
export async function upsertVenues(
  venuesToUpsert: Array<Omit<InsertVenue, "createdAt" | "updatedAt">>
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  for (const venue of venuesToUpsert) {
    await db.insert(venues).values(venue).onDuplicateKeyUpdate({ set: venue });
  }

  return await getAllVenues();
}

/**
 * Get all collections
 */
export async function getAllCollections() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get collections: database not available");
    return [];
  }

  const result = await db.select().from(collections);
  return result.map(collection => ({
    ...collection,
    keyHighlights: JSON.parse(collection.keyHighlights),
  }));
}

/**
 * Get a single collection by ID
 */
export async function getCollectionById(collectionId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get collection: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(collections)
    .where(eq(collections.id, collectionId))
    .limit(1);
  if (result.length === 0) return undefined;

  const collection = result[0];
  return {
    ...collection,
    keyHighlights: JSON.parse(collection.keyHighlights),
  };
}

/**
 * Create or update collections (for seeding)
 */
export async function upsertCollections(
  collectionsToUpsert: Array<Omit<InsertCollection, "createdAt" | "updatedAt">>
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  for (const collection of collectionsToUpsert) {
    await db
      .insert(collections)
      .values(collection)
      .onDuplicateKeyUpdate({ set: collection });
  }

  return await getAllCollections();
}

/**
 * Get all favorited venue IDs for a user
 */
export async function getUserFavoriteVenueIds(
  userId: number
): Promise<string[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get favorites: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(venueFavorites)
    .where(eq(venueFavorites.userId, userId));
  return result.map(fav => fav.venueId);
}

/**
 * Check if a venue is favorited by a user
 */
export async function isVenueFavorited(
  userId: number,
  venueId: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    return false;
  }

  const result = await db
    .select()
    .from(venueFavorites)
    .where(
      and(
        eq(venueFavorites.userId, userId),
        eq(venueFavorites.venueId, venueId)
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Toggle venue favorite (add if not exists, remove if exists)
 */
export async function toggleVenueFavorite(
  userId: number,
  venueId: string
): Promise<{ isFavorited: boolean }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existing = await db
    .select()
    .from(venueFavorites)
    .where(
      and(
        eq(venueFavorites.userId, userId),
        eq(venueFavorites.venueId, venueId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Remove favorite
    await db
      .delete(venueFavorites)
      .where(
        and(
          eq(venueFavorites.userId, userId),
          eq(venueFavorites.venueId, venueId)
        )
      );
    return { isFavorited: false };
  } else {
    // Add favorite
    await db.insert(venueFavorites).values({ userId, venueId });
    return { isFavorited: true };
  }
}

/**
 * Create a new inquiry
 */
export async function createInquiry(inquiry: InsertInquiry) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(inquiries).values(inquiry);
  return result;
}

/**
 * Get all inquiries for a user with venue and collection details
 */
export async function getUserInquiries(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get inquiries: database not available");
    return [];
  }

  const result = await db
    .select({
      id: inquiries.id,
      userId: inquiries.userId,
      venueId: inquiries.venueId,
      collectionId: inquiries.collectionId,
      name: inquiries.name,
      email: inquiries.email,
      phone: inquiries.phone,
      weddingDate: inquiries.weddingDate,
      guestCount: inquiries.guestCount,
      message: inquiries.message,
      status: inquiries.status,
      createdAt: inquiries.createdAt,
      venueName: venues.name,
      venueLocation: venues.location,
      collectionName: collections.name,
    })
    .from(inquiries)
    .leftJoin(venues, eq(inquiries.venueId, venues.id))
    .leftJoin(collections, eq(inquiries.collectionId, collections.id))
    .where(eq(inquiries.userId, userId))
    .orderBy(desc(inquiries.createdAt));

  return result;
}

/**
 * Get all inquiries (admin only) with venue, collection, and user details
 */
export async function getAllInquiries() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get all inquiries: database not available");
    return [];
  }

  const result = await db
    .select({
      id: inquiries.id,
      userId: inquiries.userId,
      venueId: inquiries.venueId,
      collectionId: inquiries.collectionId,
      name: inquiries.name,
      email: inquiries.email,
      phone: inquiries.phone,
      weddingDate: inquiries.weddingDate,
      guestCount: inquiries.guestCount,
      message: inquiries.message,
      status: inquiries.status,
      createdAt: inquiries.createdAt,
      venueName: venues.name,
      venueLocation: venues.location,
      collectionName: collections.name,
      userName: users.name,
      userEmail: users.email,
    })
    .from(inquiries)
    .leftJoin(venues, eq(inquiries.venueId, venues.id))
    .leftJoin(collections, eq(inquiries.collectionId, collections.id))
    .leftJoin(users, eq(inquiries.userId, users.id))
    .orderBy(desc(inquiries.createdAt));

  return result;
}

/**
 * Update inquiry status (admin only)
 */
export async function updateInquiryStatus(
  inquiryId: number,
  status: "pending" | "contacted" | "booked"
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get inquiry details before updating
  const inquiryDetails = await db
    .select({
      id: inquiries.id,
      name: inquiries.name,
      email: inquiries.email,
      weddingDate: inquiries.weddingDate,
      venueName: venues.name,
      venueLocation: venues.location,
      collectionName: collections.name,
    })
    .from(inquiries)
    .leftJoin(venues, eq(inquiries.venueId, venues.id))
    .leftJoin(collections, eq(inquiries.collectionId, collections.id))
    .where(eq(inquiries.id, inquiryId))
    .limit(1);

  if (inquiryDetails.length === 0) {
    throw new Error("Inquiry not found");
  }

  // Update status
  await db.update(inquiries).set({ status }).where(eq(inquiries.id, inquiryId));

  return { success: true, inquiry: inquiryDetails[0] };
}

// ========================================
// Budget Management
// ========================================

export async function getBudget(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(budgets)
    .where(eq(budgets.userId, userId))
    .limit(1);
  return result[0] || null;
}

export async function upsertBudget(data: {
  userId: number;
  totalBudget: number;
  currency: "EUR" | "GBP";
}) {
  const db = await getDb();
  if (!db) return null;

  const existing = await getBudget(data.userId);

  if (existing) {
    await db
      .update(budgets)
      .set({ totalBudget: data.totalBudget, currency: data.currency })
      .where(eq(budgets.userId, data.userId));
    return getBudget(data.userId);
  } else {
    await db.insert(budgets).values(data);
    return getBudget(data.userId);
  }
}

export async function getBudgetCategories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(budgetCategories)
    .where(eq(budgetCategories.userId, userId));
}

export async function upsertBudgetCategory(data: {
  id?: number;
  userId: number;
  categoryName: string;
  allocatedAmount: number;
  actualSpend?: number;
  notes?: string | null;
}) {
  const db = await getDb();
  if (!db) return null;

  if (data.id) {
    await db
      .update(budgetCategories)
      .set({
        allocatedAmount: data.allocatedAmount,
        actualSpend: data.actualSpend ?? 0,
        notes: data.notes ?? null,
      })
      .where(eq(budgetCategories.id, data.id));
    const result = await db
      .select()
      .from(budgetCategories)
      .where(eq(budgetCategories.id, data.id))
      .limit(1);
    return result[0] || null;
  } else {
    await db.insert(budgetCategories).values({
      userId: data.userId,
      categoryName: data.categoryName,
      allocatedAmount: data.allocatedAmount,
      actualSpend: data.actualSpend ?? 0,
      notes: data.notes ?? null,
    });
    const result = await db
      .select()
      .from(budgetCategories)
      .where(
        and(
          eq(budgetCategories.userId, data.userId),
          eq(budgetCategories.categoryName, data.categoryName)
        )
      )
      .limit(1);
    return result[0] || null;
  }
}

export async function initializeDefaultCategories(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const defaultCategories = [
    "Venue",
    "Catering",
    "Photography & Videography",
    "Flowers & Décor",
    "Entertainment",
    "Bridal & Groom Attire",
    "Beauty (Hair & Makeup)",
    "Transport",
    "Cake",
    "Miscellaneous",
  ];

  for (const categoryName of defaultCategories) {
    await db.insert(budgetCategories).values({
      userId,
      categoryName,
      allocatedAmount: 0,
      actualSpend: 0,
    });
  }

  return getBudgetCategories(userId);
}

export async function getBudgetExpenses(userId: number, categoryId?: number) {
  const db = await getDb();
  if (!db) return [];

  if (categoryId) {
    return db
      .select()
      .from(budgetExpenses)
      .where(
        and(
          eq(budgetExpenses.userId, userId),
          eq(budgetExpenses.categoryId, categoryId)
        )
      )
      .orderBy(desc(budgetExpenses.date));
  }

  return db
    .select()
    .from(budgetExpenses)
    .where(eq(budgetExpenses.userId, userId))
    .orderBy(desc(budgetExpenses.date));
}

export async function createBudgetExpense(data: {
  userId: number;
  categoryId: number;
  title: string;
  vendor?: string | null;
  cost: number;
  date: string;
  notes?: string | null;
}) {
  const db = await getDb();
  if (!db) return null;

  // Insert expense
  await db.insert(budgetExpenses).values({
    userId: data.userId,
    categoryId: data.categoryId,
    title: data.title,
    vendor: data.vendor ?? null,
    cost: data.cost,
    date: data.date,
    notes: data.notes ?? null,
  });

  // Update category actualSpend
  const expenses = await getBudgetExpenses(data.userId, data.categoryId);
  const totalSpend = expenses.reduce((sum, exp) => sum + exp.cost, 0);

  await db
    .update(budgetCategories)
    .set({ actualSpend: totalSpend })
    .where(eq(budgetCategories.id, data.categoryId));

  const result = await db
    .select()
    .from(budgetExpenses)
    .where(
      and(
        eq(budgetExpenses.userId, data.userId),
        eq(budgetExpenses.categoryId, data.categoryId),
        eq(budgetExpenses.title, data.title)
      )
    )
    .orderBy(desc(budgetExpenses.createdAt))
    .limit(1);

  return result[0] || null;
}

export async function deleteBudgetExpense(id: number, userId: number) {
  const db = await getDb();
  if (!db) return false;

  // Get expense to find categoryId
  const expense = await db
    .select()
    .from(budgetExpenses)
    .where(eq(budgetExpenses.id, id))
    .limit(1);
  if (!expense[0] || expense[0].userId !== userId) return false;

  const categoryId = expense[0].categoryId;

  // Delete expense
  await db.delete(budgetExpenses).where(eq(budgetExpenses.id, id));

  // Recalculate category actualSpend
  const expenses = await getBudgetExpenses(userId, categoryId);
  const totalSpend = expenses.reduce((sum, exp) => sum + exp.cost, 0);

  await db
    .update(budgetCategories)
    .set({ actualSpend: totalSpend })
    .where(eq(budgetCategories.id, categoryId));

  return true;
}

// ============================================================
// Dossier Library
// ============================================================

export async function getAllDossiers() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(dossiers)
    .orderBy(desc(dossiers.isFeatured), desc(dossiers.updatedAt));
}

export async function getDossiersByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];

  if (category === "All") {
    return await getAllDossiers();
  }

  return await db
    .select()
    .from(dossiers)
    .where(eq(dossiers.category, category as any))
    .orderBy(desc(dossiers.isFeatured), desc(dossiers.updatedAt));
}

export async function getDossierById(id: string) {
  const db = await getDb();
  if (!db) return null;

  const results = await db
    .select()
    .from(dossiers)
    .where(eq(dossiers.id, id))
    .limit(1);
  return results[0] || null;
}

// ============================================================
// Share Links
// ============================================================

export function generateShareToken(): string {
  // Generate a random 32-character token
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export async function createShareLink(data: {
  userId: number;
  shareToken: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  console.log(
    "[createShareLink] Creating share link for userId:",
    data.userId,
    "token:",
    data.shareToken
  );

  // Delete any existing share links for this user
  await db.delete(shareLinks).where(eq(shareLinks.userId, data.userId));
  console.log("[createShareLink] Deleted existing share links");

  // Insert new share link
  await db.insert(shareLinks).values({
    userId: data.userId,
    shareToken: data.shareToken,
  });
  console.log("[createShareLink] Inserted new share link");

  // Verify it was inserted by querying back
  const inserted = await db
    .select()
    .from(shareLinks)
    .where(eq(shareLinks.userId, data.userId))
    .limit(1);
  console.log("[createShareLink] Verification query result:", inserted);

  if (!inserted[0]) {
    throw new Error(
      "Failed to insert share link - verification query returned empty"
    );
  }

  return inserted[0];
}

export async function getSharedProfile(token: string) {
  const db = await getDb();
  if (!db) {
    console.log("[getSharedProfile] Database not available");
    return null;
  }

  console.log("[getSharedProfile] Looking for token:", token);

  // Get share link - use standard Drizzle query
  const shareLinkResults = await db
    .select()
    .from(shareLinks)
    .where(eq(shareLinks.shareToken, token))
    .limit(1);

  console.log(
    "[getSharedProfile] Share link query returned:",
    shareLinkResults.length,
    "results"
  );

  if (shareLinkResults.length === 0) {
    console.log("[getSharedProfile] No share link found for token:", token);
    return null;
  }

  const shareLink = shareLinkResults[0];
  console.log(
    "[getSharedProfile] Found share link for userId:",
    shareLink.userId
  );

  // Increment view count
  await db
    .update(shareLinks)
    .set({ viewCount: shareLink.viewCount + 1 })
    .where(eq(shareLinks.id, shareLink.id));

  // Get user profile
  const profile = await getUserProfile(shareLink.userId);
  console.log(
    "[getSharedProfile] User profile result:",
    profile ? "found" : "not found"
  );

  if (!profile) {
    console.log(
      "[getSharedProfile] WARNING: Share link exists but user profile not found for userId:",
      shareLink.userId
    );
  }

  return profile;
}
