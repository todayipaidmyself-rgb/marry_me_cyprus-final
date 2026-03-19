import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("inquiries", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let testUserId: number;

  beforeAll(async () => {
    // Create a mock authenticated context
    const mockContext: TrpcContext = {
      user: {
        id: 999,
        openId: "test-inquiry-user",
        name: "Test Inquiry User",
        email: "test@inquiry.com",
        role: "user",
        loginMethod: "manus",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {
        protocol: "https",
        headers: {},
      } as any,
      res: {} as any,
    };

    caller = appRouter.createCaller(mockContext);
    testUserId = mockContext.user!.id;
  });

  describe("inquiries.submit", () => {
    it("creates venue inquiry with all fields", async () => {
      const result = await caller.inquiries.submit({
        venueId: "atlantida-beach-weddings",
        name: "John & Jane Doe",
        email: "johnjane@example.com",
        phone: "+357 99 123456",
        weddingDate: "2025-06-15",
        guestCount: 80,
        message: "We are interested in booking this venue for our wedding.",
      });

      expect(result).toEqual({ success: true });
    });

    it("creates collection inquiry with minimal fields", async () => {
      const result = await caller.inquiries.submit({
        collectionId: "alassos-beachfront-wedding",
        name: "Test Couple",
        email: "test@example.com",
        message: "Please send more information about this collection.",
      });

      expect(result).toEqual({ success: true });
    });

    it("creates inquiry with both venue and collection", async () => {
      const result = await caller.inquiries.submit({
        venueId: "atlantida-beach-weddings",
        collectionId: "alassos-beachfront-wedding",
        name: "Combined Inquiry",
        email: "combined@example.com",
        message: "Interested in both venue and collection.",
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe("inquiries.getUserInquiries", () => {
    it("returns user inquiries", async () => {
      // First create an inquiry
      await caller.inquiries.submit({
        venueId: "atlantida-beach-weddings",
        name: "Retrieval Test",
        email: "retrieval@example.com",
        message: "Test inquiry for retrieval.",
      });

      // Then retrieve inquiries
      const inquiries = await caller.inquiries.getUserInquiries();

      expect(Array.isArray(inquiries)).toBe(true);
      expect(inquiries.length).toBeGreaterThan(0);

      // Check that the inquiry has the expected structure
      const inquiry = inquiries[0];
      expect(inquiry).toHaveProperty("id");
      expect(inquiry).toHaveProperty("userId");
      expect(inquiry).toHaveProperty("name");
      expect(inquiry).toHaveProperty("email");
      expect(inquiry).toHaveProperty("message");
      expect(inquiry).toHaveProperty("status");
      expect(inquiry).toHaveProperty("createdAt");
      expect(inquiry.userId).toBe(testUserId);
    });

    it("returns empty array for user with no inquiries", async () => {
      // Create a different user context
      const newUserContext: TrpcContext = {
        user: {
          id: 888,
          openId: "test-no-inquiries",
          name: "No Inquiries User",
          email: "noinquiries@test.com",
          role: "user",
          loginMethod: "manus",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
        req: {
          protocol: "https",
          headers: {},
        } as any,
        res: {} as any,
      };

      const newCaller = appRouter.createCaller(newUserContext);
      const inquiries = await newCaller.inquiries.getUserInquiries();

      expect(Array.isArray(inquiries)).toBe(true);
      expect(inquiries.length).toBe(0);
    });
  });
});
