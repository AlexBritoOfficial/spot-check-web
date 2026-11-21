import { describe, expect, it } from "vitest";
import { spotSchema } from "./spotSchema";

const validSpot = {
  name: "Love Park",
  city: "Philadelphia",
  spotType: "street",
  features: ["ledge", "stairs"],
  difficulty: "advanced",
  isSkateable: true,
  isPublic: true,
  rating: 4,
  latLng: { lat: 39.9526, lng: -75.1652 },
  status: "active",
};

describe("spotSchema", () => {
  it("accepts a fully valid spot", () => {
    const result = spotSchema.safeParse(validSpot);
    expect(result.success).toBe(true);
  });

  it("accepts optional fields omitted", () => {
    const result = spotSchema.safeParse(validSpot);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeUndefined();
      expect(result.data.photo).toBeUndefined();
    }
  });

  it("strips ownerId/createdAt rather than accepting them from a client", () => {
    const result = spotSchema.safeParse({
      ...validSpot,
      ownerId: "00000000-0000-0000-0000-000000000000",
      createdAt: "2020-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("ownerId");
      expect(result.data).not.toHaveProperty("createdAt");
    }
  });

  it("rejects an empty name", () => {
    const result = spotSchema.safeParse({ ...validSpot, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty city", () => {
    const result = spotSchema.safeParse({ ...validSpot, city: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown spotType", () => {
    const result = spotSchema.safeParse({ ...validSpot, spotType: "skatepark" });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown feature", () => {
    const result = spotSchema.safeParse({
      ...validSpot,
      features: ["half-pipe"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a rating outside 0-5", () => {
    expect(spotSchema.safeParse({ ...validSpot, rating: -1 }).success).toBe(
      false,
    );
    expect(spotSchema.safeParse({ ...validSpot, rating: 6 }).success).toBe(
      false,
    );
  });

  it("rejects latLng outside valid world coordinates", () => {
    const result = spotSchema.safeParse({
      ...validSpot,
      latLng: { lat: 91, lng: 0 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing required field", () => {
    const withoutCity: Partial<typeof validSpot> = { ...validSpot };
    delete withoutCity.city;
    const result = spotSchema.safeParse(withoutCity);
    expect(result.success).toBe(false);
  });
});
