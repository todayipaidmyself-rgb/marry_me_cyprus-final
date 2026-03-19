import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
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

describe("venues", () => {
  it("getAll returns array of venues", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const venues = await caller.venues.getAll();

    expect(Array.isArray(venues)).toBe(true);
  });

  it("seed creates venues when called", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.venues.seed();

    expect(result.success).toBe(true);
    expect(typeof result.count).toBe("number");
  });

  it("getById returns venue when valid ID provided", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First seed to ensure venues exist
    await caller.venues.seed();
    const venues = await caller.venues.getAll();

    if (venues.length > 0) {
      const venue = await caller.venues.getById({ venueId: venues[0]!.id });
      expect(venue).toBeDefined();
      expect(venue?.id).toBe(venues[0]!.id);
    }
  });
});

describe("collections", () => {
  it("getAll returns array of collections", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const collections = await caller.collections.getAll();

    expect(Array.isArray(collections)).toBe(true);
  });

  it("seed creates collections when called", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.collections.seed();

    expect(result.success).toBe(true);
    expect(typeof result.count).toBe("number");
  });

  it("getById returns collection when valid ID provided", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First seed to ensure collections exist
    await caller.collections.seed();
    const collections = await caller.collections.getAll();

    if (collections.length > 0) {
      const collection = await caller.collections.getById({
        collectionId: collections[0]!.id,
      });
      expect(collection).toBeDefined();
      expect(collection?.id).toBe(collections[0]!.id);
    }
  });
});
