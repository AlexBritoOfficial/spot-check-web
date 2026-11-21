import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/types/database.types";
import { DELETE, PATCH } from "./[id]/route";
import { GET, POST } from "./route";

// service_role bypasses RLS for fixture setup/teardown, the same role
// prisma/seed.ts's direct connection effectively played before this cutover.
const admin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function cookieHeaderFrom(response: NextResponse): string {
  return response.cookies
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

// Signs in through this app's own src/lib/supabase/server.ts client rather
// than hand-constructing Supabase's internal cookie format — the resulting
// Cookie header is guaranteed to parse the same way the real route handlers
// parse it, since it's the same code on both ends.
async function signInAndGetCookieHeader(
  email: string,
  password: string,
): Promise<string> {
  const signInRequest = new NextRequest("http://localhost/api/auth/sign-in", {
    method: "POST",
  });
  const { supabase, cookieResponse } = createSupabaseServerClient(signInRequest);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return cookieHeaderFrom(cookieResponse);
}

const REFERENCE = { lat: 40, lng: -75 };

// Hand-placed at known distances from REFERENCE (not reusing real seed
// data, so this test doesn't silently break if that data changes):
// ~140m, ~1.4km, and ~140km away. Both the near/mid radius and the margin
// to "far" are generous enough to not depend on the precise PostGIS
// geography-vs-planar distance, just the rough ordering.
const fixtures = [
  { name: "__test_near__", lat: 40.001, lng: -75.001 },
  { name: "__test_mid__", lat: 40.01, lng: -75.01 },
  { name: "__test_far__", lat: 41, lng: -74 },
];

describe("GET /api/spots — nearby PostGIS query", () => {
  beforeAll(async () => {
    const { error } = await admin.from("spots").insert(
      fixtures.map((fixture) => ({
        name: fixture.name,
        city: "Test City",
        spot_type: "street" as const,
        difficulty: "beginner" as const,
        lat: fixture.lat,
        lng: fixture.lng,
      })),
    );
    if (error) throw error;
  });

  afterAll(async () => {
    await admin
      .from("spots")
      .delete()
      .in("name", fixtures.map((f) => f.name));
  });

  it("returns only spots within the radius, ordered nearest-first", async () => {
    const request = new NextRequest(
      `http://localhost/api/spots?lat=${REFERENCE.lat}&lng=${REFERENCE.lng}&radius=5000`,
    );

    const response = await GET(request);
    expect(response.status).toBe(200);

    const body: { name: string }[] = await response.json();
    const names = body.map((s) => s.name).filter((n) => n.startsWith("__test_"));

    expect(names).toEqual(["__test_near__", "__test_mid__"]);
  });

  it("excludes spots outside the radius", async () => {
    const request = new NextRequest(
      `http://localhost/api/spots?lat=${REFERENCE.lat}&lng=${REFERENCE.lng}&radius=5000`,
    );

    const response = await GET(request);
    const body: { name: string }[] = await response.json();
    const names = body.map((s) => s.name);

    expect(names).not.toContain("__test_far__");
  });
});

describe("POST /api/spots — ownership", () => {
  const createdSpotIds: string[] = [];

  afterEach(async () => {
    if (createdSpotIds.length > 0) {
      await admin.from("spots").delete().in("id", createdSpotIds);
      createdSpotIds.length = 0;
    }
  });

  const newSpotBody = {
    name: "__test_post_spot__",
    city: "Test City",
    spotType: "street",
    features: [],
    difficulty: "beginner",
    isSkateable: true,
    isPublic: true,
    rating: 0,
    latLng: { lat: 40.5, lng: -75.5 },
    status: "active",
  };

  function buildRequest(body: unknown, cookie?: string) {
    return new NextRequest("http://localhost/api/spots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify(body),
    });
  }

  it("creates an ownerless spot when signed out", async () => {
    const response = await POST(buildRequest(newSpotBody));
    expect(response.status).toBe(201);

    const spot = await response.json();
    expect(spot.ownerId).toBeNull();
    createdSpotIds.push(spot.id);
  });

  it("sets owner_id from the session, never from the request body", async () => {
    const email = `__test_user_${Date.now()}@example.com`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: "test-password-123",
      email_confirm: true,
    });
    if (error || !data.user) throw error ?? new Error("no user created");

    try {
      const cookie = await signInAndGetCookieHeader(email, "test-password-123");
      const spoofedOwnerId = "00000000-0000-0000-0000-000000000000";

      const response = await POST(
        buildRequest({ ...newSpotBody, ownerId: spoofedOwnerId }, cookie),
      );
      expect(response.status).toBe(201);

      const spot = await response.json();
      expect(spot.ownerId).toBe(data.user.id);
      expect(spot.ownerId).not.toBe(spoofedOwnerId);
      createdSpotIds.push(spot.id);
    } finally {
      await admin.auth.admin.deleteUser(data.user.id);
    }
  });
});

describe("PATCH/DELETE /api/spots/[id] — ownership enforcement", () => {
  const routeParams = (id: string) => ({ params: Promise.resolve({ id }) });

  it("returns 404 when a non-owner tries to update or delete someone else's spot", async () => {
    const ownerEmail = `__test_owner_${Date.now()}@example.com`;
    const otherEmail = `__test_other_${Date.now()}@example.com`;
    const password = "test-password-123";

    const { data: owner, error: ownerError } = await admin.auth.admin.createUser({
      email: ownerEmail,
      password,
      email_confirm: true,
    });
    const { data: other, error: otherError } = await admin.auth.admin.createUser({
      email: otherEmail,
      password,
      email_confirm: true,
    });
    if (ownerError || !owner.user) throw ownerError ?? new Error("no owner user");
    if (otherError || !other.user) throw otherError ?? new Error("no other user");

    try {
      const { data: spot, error: insertError } = await admin
        .from("spots")
        .insert({
          name: "__test_owned_spot__",
          city: "Test City",
          spot_type: "street",
          difficulty: "beginner",
          lat: 40.5,
          lng: -75.5,
          owner_id: owner.user.id,
        })
        .select()
        .single();
      if (insertError || !spot) throw insertError ?? new Error("no spot created");

      const otherCookie = await signInAndGetCookieHeader(otherEmail, password);
      const patchBody = {
        name: "hijacked",
        city: "Test City",
        spotType: "street",
        features: [],
        difficulty: "beginner",
        isSkateable: true,
        isPublic: true,
        rating: 0,
        latLng: { lat: 40.5, lng: -75.5 },
        status: "active",
      };

      const patchResponse = await PATCH(
        new NextRequest(`http://localhost/api/spots/${spot.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Cookie: otherCookie },
          body: JSON.stringify(patchBody),
        }),
        routeParams(spot.id),
      );
      expect(patchResponse.status).toBe(404);

      const deleteResponse = await DELETE(
        new NextRequest(`http://localhost/api/spots/${spot.id}`, {
          method: "DELETE",
          headers: { Cookie: otherCookie },
        }),
        routeParams(spot.id),
      );
      expect(deleteResponse.status).toBe(404);

      const { data: stillThere } = await admin
        .from("spots")
        .select("id")
        .eq("id", spot.id)
        .maybeSingle();
      expect(stillThere).not.toBeNull();
    } finally {
      await admin.from("spots").delete().eq("name", "__test_owned_spot__");
      await admin.auth.admin.deleteUser(owner.user.id);
      await admin.auth.admin.deleteUser(other.user.id);
    }
  });
});
