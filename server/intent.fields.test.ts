import { describe, it, expect } from "vitest";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Intent Capture Fields", () => {
  it("new user can have intent fields populated", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    // Create a test user with intent fields
    const testOpenId = `test-intent-${Date.now()}`;

    await db.insert(users).values({
      openId: testOpenId,
      name: "Test Intent User",
      email: "intent@test.com",
      userRole: "bride",
      intentReason: "planning",
      priorities: JSON.stringify([
        "venue_recommendations",
        "timeline",
        "guest_management",
      ]),
      preEnrollmentCompleted: 1,
    });

    // Fetch the user back
    const [fetchedUser] = await db
      .select()
      .from(users)
      .where(eq(users.openId, testOpenId));

    expect(fetchedUser).toBeDefined();
    expect(fetchedUser.userRole).toBe("bride");
    expect(fetchedUser.intentReason).toBe("planning");
    expect(fetchedUser.priorities).toBe(
      JSON.stringify(["venue_recommendations", "timeline", "guest_management"])
    );
    expect(fetchedUser.preEnrollmentCompleted).toBe(1);

    // Cleanup
    await db.delete(users).where(eq(users.openId, testOpenId));
  });

  it("existing users have null intent fields (backwards compatible)", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    // Create a user without intent fields (simulating existing user)
    const testOpenId = `test-existing-${Date.now()}`;

    await db.insert(users).values({
      openId: testOpenId,
      name: "Existing User",
      email: "existing@test.com",
      // Intentionally NOT setting userRole, intentReason, priorities
      // preEnrollmentCompleted will default to 0
    });

    // Fetch the user back
    const [fetchedUser] = await db
      .select()
      .from(users)
      .where(eq(users.openId, testOpenId));

    expect(fetchedUser).toBeDefined();
    expect(fetchedUser.userRole).toBeNull();
    expect(fetchedUser.intentReason).toBeNull();
    expect(fetchedUser.priorities).toBeNull();
    expect(fetchedUser.preEnrollmentCompleted).toBe(0);

    // Cleanup
    await db.delete(users).where(eq(users.openId, testOpenId));
  });

  it("all intent field enum values work correctly", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const testCases = [
      { userRole: "groom", intentReason: "helping" },
      { userRole: "planner", intentReason: "inspiration" },
      { userRole: "family_member", intentReason: "guest_management" },
    ];

    for (const testCase of testCases) {
      const testOpenId = `test-enum-${Date.now()}-${testCase.userRole}`;

      await db.insert(users).values({
        openId: testOpenId,
        name: `Test ${testCase.userRole}`,
        email: `${testCase.userRole}@test.com`,
        userRole: testCase.userRole as any,
        intentReason: testCase.intentReason as any,
        preEnrollmentCompleted: 1,
      });

      const [fetchedUser] = await db
        .select()
        .from(users)
        .where(eq(users.openId, testOpenId));

      expect(fetchedUser.userRole).toBe(testCase.userRole);
      expect(fetchedUser.intentReason).toBe(testCase.intentReason);

      // Cleanup
      await db.delete(users).where(eq(users.openId, testOpenId));
    }
  });
});
