import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("profile.upsert", () => {
  it("creates a new profile with valid data", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const profileData = {
      firstName: "Sophia",
      partnerName: "Alexander",
      weddingDate: "2025-06-15",
      location: "Paphos",
      venueArea: "Coral Beach Hotel",
      guestCount: 80,
      styleTags: ["luxury", "romantic", "beachfront"],
    };

    const result = await caller.profile.upsert(profileData);

    expect(result).toBeDefined();
    expect(result.firstName).toBe("Sophia");
    expect(result.partnerName).toBe("Alexander");
    expect(result.weddingDate).toBe("2025-06-15");
    expect(result.location).toBe("Paphos");
    expect(result.guestCount).toBe(80);
    expect(result.styleTags).toEqual(["luxury", "romantic", "beachfront"]);
  });

  it("updates an existing profile", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create initial profile
    await caller.profile.upsert({
      firstName: "Sophia",
      partnerName: "Alexander",
      weddingDate: "2025-06-15",
      location: "Paphos",
      guestCount: 80,
      styleTags: ["luxury"],
    });

    // Update profile
    const updated = await caller.profile.upsert({
      firstName: "Sophia",
      partnerName: "Alexander",
      weddingDate: "2025-07-20",
      location: "Limassol",
      venueArea: "Amara Hotel",
      guestCount: 120,
      styleTags: ["luxury", "modern", "garden"],
    });

    expect(updated.weddingDate).toBe("2025-07-20");
    expect(updated.location).toBe("Limassol");
    expect(updated.guestCount).toBe(120);
    expect(updated.styleTags).toEqual(["luxury", "modern", "garden"]);
  });
});

describe("profile.get", () => {
  it("returns null when no profile exists", async () => {
    const { ctx } = createAuthContext(999); // User ID that doesn't have a profile
    const caller = appRouter.createCaller(ctx);

    const result = await caller.profile.get();

    expect(result).toBeNull();
  });

  it("returns profile data after creation", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create profile
    await caller.profile.upsert({
      firstName: "Emma",
      partnerName: "James",
      weddingDate: "2026-05-10",
      location: "Ayia Napa",
      guestCount: 60,
      styleTags: ["boho", "beachfront"],
    });

    // Retrieve profile
    const result = await caller.profile.get();

    expect(result).toBeDefined();
    expect(result?.firstName).toBe("Emma");
    expect(result?.partnerName).toBe("James");
    expect(result?.location).toBe("Ayia Napa");
    expect(result?.styleTags).toEqual(["boho", "beachfront"]);
  });
});
