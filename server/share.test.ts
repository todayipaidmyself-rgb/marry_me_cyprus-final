import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { generateShareToken, createShareLink, getSharedProfile } from "./db";
import { getDb } from "./db";
import { shareLinks, userProfiles } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Share Link System", () => {
  let testUserId: number;
  let testToken: string;

  beforeAll(async () => {
    // Create a test user profile for testing
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Insert a test user profile
    const result = await db.insert(userProfiles).values({
      userId: 999999, // Use a high number to avoid conflicts
      firstName: "Test User",
      partnerName: "Test Partner",
      weddingDate: "2025-08-15",
      location: "paphos",
      guestCount: 50,
      styleTags: JSON.stringify(["romantic", "beachfront"]),
      email: "test@example.com",
      phone: "+1234567890",
      onboardingData: JSON.stringify({
        full: {
          fullName: "Test User",
          email: "test@example.com",
          phone: "+1234567890",
          weddingSeason: "summer",
          weddingLocation: "paphos",
          guestCount: "50",
          budgetRange: "10k-25k",
        },
      }),
      intentData: null,
    });

    testUserId = 999999;
  });

  afterAll(async () => {
    // Clean up test data
    const db = await getDb();
    if (!db) return;

    await db.delete(shareLinks).where(eq(shareLinks.userId, testUserId));
    await db.delete(userProfiles).where(eq(userProfiles.userId, testUserId));
  });

  describe("generateShareToken", () => {
    it("should generate a token of correct length", () => {
      const token = generateShareToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBe(32);
    });

    it("should generate unique tokens", () => {
      const token1 = generateShareToken();
      const token2 = generateShareToken();
      expect(token1).not.toBe(token2);
    });

    it("should only contain alphanumeric characters", () => {
      const token = generateShareToken();
      expect(token).toMatch(/^[a-zA-Z0-9]+$/);
    });
  });

  describe("createShareLink", () => {
    it("should create a share link successfully", async () => {
      testToken = generateShareToken();
      const shareLink = await createShareLink({
        userId: testUserId,
        shareToken: testToken,
      });

      expect(shareLink).toBeDefined();
      expect(shareLink.userId).toBe(testUserId);
      expect(shareLink.shareToken).toBe(testToken);
      expect(shareLink.viewCount).toBe(0);
      expect(shareLink.createdAt).toBeInstanceOf(Date);
    });

    it("should replace existing share link for the same user", async () => {
      const firstToken = generateShareToken();
      const firstLink = await createShareLink({
        userId: testUserId,
        shareToken: firstToken,
      });

      const secondToken = generateShareToken();
      const secondLink = await createShareLink({
        userId: testUserId,
        shareToken: secondToken,
      });

      expect(secondLink.shareToken).toBe(secondToken);
      expect(secondLink.shareToken).not.toBe(firstToken);

      // Verify only one share link exists for this user
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const links = await db
        .select()
        .from(shareLinks)
        .where(eq(shareLinks.userId, testUserId));
      expect(links.length).toBe(1);
      expect(links[0].shareToken).toBe(secondToken);
    });
  });

  describe("getSharedProfile", () => {
    it("should retrieve shared profile by token", async () => {
      const token = generateShareToken();
      await createShareLink({
        userId: testUserId,
        shareToken: token,
      });

      const profile = await getSharedProfile(token);

      expect(profile).toBeDefined();
      expect(profile?.userId).toBe(testUserId);
      expect(profile?.firstName).toBe("Test User");
      expect(profile?.email).toBe("test@example.com");
      expect(profile?.onboardingData).toBeDefined();
    });

    it("should return null for invalid token", async () => {
      const profile = await getSharedProfile("INVALID_TOKEN_12345");
      expect(profile).toBeNull();
    });

    it("should increment view count on each access", async () => {
      const token = generateShareToken();
      await createShareLink({
        userId: testUserId,
        shareToken: token,
      });

      // First access
      await getSharedProfile(token);

      // Second access
      await getSharedProfile(token);

      // Check view count
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const links = await db
        .select()
        .from(shareLinks)
        .where(eq(shareLinks.shareToken, token));
      expect(links[0].viewCount).toBe(2);
    });

    it("should return null if user profile does not exist", async () => {
      const token = generateShareToken();
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Create share link for non-existent user
      await db.insert(shareLinks).values({
        userId: 888888, // Non-existent user
        shareToken: token,
      });

      const profile = await getSharedProfile(token);
      expect(profile).toBeUndefined();

      // Clean up
      await db.delete(shareLinks).where(eq(shareLinks.shareToken, token));
    });
  });
});
