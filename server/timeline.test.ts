import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("timeline.initializeEvents", () => {
  it("creates default timeline events for new user", async () => {
    const ctx = createAuthContext(9999); // Use unique ID to avoid conflicts
    const caller = appRouter.createCaller(ctx);

    const events = await caller.timeline.initializeEvents();

    expect(events.length).toBeGreaterThan(0);
    expect(events[0]).toHaveProperty("title");
    expect(events[0]).toHaveProperty("startTime");
    expect(events[0]).toHaveProperty("sortOrder");
  });

  it("does not duplicate events if already initialized", async () => {
    const ctx = createAuthContext(9998);
    const caller = appRouter.createCaller(ctx);

    // First initialization
    const firstEvents = await caller.timeline.initializeEvents();
    const firstCount = firstEvents.length;

    // Second initialization should return existing events
    const secondEvents = await caller.timeline.initializeEvents();

    expect(secondEvents.length).toBe(firstCount);
  });
});

describe("timeline.getEvents", () => {
  it("returns empty array for user with no events", async () => {
    const ctx = createAuthContext(9997);
    const caller = appRouter.createCaller(ctx);

    const events = await caller.timeline.getEvents();

    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBe(0);
  });

  it("returns events after initialization", async () => {
    const ctx = createAuthContext(9996);
    const caller = appRouter.createCaller(ctx);

    await caller.timeline.initializeEvents();
    const events = await caller.timeline.getEvents();

    expect(events.length).toBeGreaterThan(0);
  });
});

describe("timeline.createEvent", () => {
  it("creates a new timeline event", async () => {
    const ctx = createAuthContext(9995);
    const caller = appRouter.createCaller(ctx);

    const events = await caller.timeline.createEvent({
      title: "Custom Event",
      description: "Test description",
      startTime: "14:00",
      endTime: "15:00",
    });

    const newEvent = events.find(e => e.title === "Custom Event");
    expect(newEvent).toBeDefined();
    expect(newEvent?.description).toBe("Test description");
    expect(newEvent?.startTime).toBe("14:00");
    expect(newEvent?.endTime).toBe("15:00");
  });

  it("validates time format", async () => {
    const ctx = createAuthContext(9994);
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.timeline.createEvent({
        title: "Invalid Event",
        startTime: "invalid-time",
      })
    ).rejects.toThrow();
  });
});

describe("timeline.updateEvent", () => {
  it("updates event details", async () => {
    const ctx = createAuthContext(9993);
    const caller = appRouter.createCaller(ctx);

    // Create an event first
    const created = await caller.timeline.createEvent({
      title: "Original Title",
      startTime: "10:00",
    });

    const eventId = created[0].id;

    // Update the event
    const updated = await caller.timeline.updateEvent({
      eventId,
      title: "Updated Title",
      startTime: "11:00",
    });

    const updatedEvent = updated.find(e => e.id === eventId);
    expect(updatedEvent?.title).toBe("Updated Title");
    expect(updatedEvent?.startTime).toBe("11:00");
  });

  it("only allows users to update their own events", async () => {
    const ctx1 = createAuthContext(9992);
    const caller1 = appRouter.createCaller(ctx1);

    // User 1 creates an event
    const created = await caller1.timeline.createEvent({
      title: "User 1 Event",
      startTime: "10:00",
    });

    const eventId = created[0].id;

    // User 2 tries to update it
    const ctx2 = createAuthContext(9991);
    const caller2 = appRouter.createCaller(ctx2);

    await caller2.timeline.updateEvent({
      eventId,
      title: "Hacked Title",
    });

    // Verify the event wasn't updated
    const user1Events = await caller1.timeline.getEvents();
    const event = user1Events.find(e => e.id === eventId);
    expect(event?.title).toBe("User 1 Event");
  });
});

describe("timeline.deleteEvent", () => {
  it("deletes an event", async () => {
    const ctx = createAuthContext(9990);
    const caller = appRouter.createCaller(ctx);

    // Create an event
    const created = await caller.timeline.createEvent({
      title: "To Delete",
      startTime: "10:00",
    });

    const eventId = created[0].id;

    // Delete it
    const remaining = await caller.timeline.deleteEvent({ eventId });

    expect(remaining.find(e => e.id === eventId)).toBeUndefined();
  });

  it("only allows users to delete their own events", async () => {
    const ctx1 = createAuthContext(9989);
    const caller1 = appRouter.createCaller(ctx1);

    // User 1 creates an event
    const created = await caller1.timeline.createEvent({
      title: "User 1 Event",
      startTime: "10:00",
    });

    const eventId = created[0].id;

    // User 2 tries to delete it
    const ctx2 = createAuthContext(9988);
    const caller2 = appRouter.createCaller(ctx2);

    await caller2.timeline.deleteEvent({ eventId });

    // Verify the event still exists for user 1
    const user1Events = await caller1.timeline.getEvents();
    expect(user1Events.find(e => e.id === eventId)).toBeDefined();
  });
});

describe("timeline default events", () => {
  it("creates events with proper time ordering", async () => {
    const ctx = createAuthContext(9987);
    const caller = appRouter.createCaller(ctx);

    const events = await caller.timeline.initializeEvents();

    // Check that events are created with valid times
    events.forEach(event => {
      expect(event.startTime).toMatch(/^\d{2}:\d{2}$/);
      if (event.endTime) {
        expect(event.endTime).toMatch(/^\d{2}:\d{2}$/);
      }
    });

    // Check that sortOrder is sequential
    const sortOrders = events.map(e => e.sortOrder).sort((a, b) => a - b);
    expect(sortOrders[0]).toBe(1);
    expect(sortOrders[sortOrders.length - 1]).toBe(events.length);
  });
});
