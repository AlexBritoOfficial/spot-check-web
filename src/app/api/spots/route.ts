import { createClient, withSessionCookies } from "@/lib/supabase/server";
import { nearbySpotsQuerySchema } from "@/app/lib/nearbySpotsQuerySchema";
import { spotSchema } from "@/app/lib/spotSchema";
import { reshapeNearbySpot, reshapeSpot } from "./reshape";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_RADIUS_METERS = 8000;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const result = nearbySpotsQuerySchema.safeParse({
    lat: searchParams.get("lat") ?? undefined,
    lng: searchParams.get("lng") ?? undefined,
    radius: searchParams.get("radius") ?? undefined,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 },
    );
  }

  const { lat, lng, radius } = result.data;
  const { supabase, cookieResponse } = createClient(request);

  try {
    // RLS (is_public or owner_id = auth.uid()) filters both branches below
    // automatically — a signed-out or non-owner caller never sees a private
    // spot, with no isPublic check needed in this route.
    if (lat !== undefined && lng !== undefined) {
      const { data, error } = await supabase.rpc("spots_nearby", {
        p_lat: lat,
        p_lng: lng,
        p_radius_meters: radius ?? DEFAULT_RADIUS_METERS,
      });

      if (error) throw error;

      return withSessionCookies(
        NextResponse.json((data ?? []).map(reshapeNearbySpot)),
        cookieResponse,
      );
    }

    const { data, error } = await supabase.from("spots").select();

    if (error) throw error;

    return withSessionCookies(
      NextResponse.json((data ?? []).map(reshapeSpot)),
      cookieResponse,
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch spots" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = spotSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 },
    );
  }

  const { latLng, ...rest } = result.data;
  const { supabase, cookieResponse } = createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // owner_id always comes from the session, never the request body — a
  // signed-out caller (user === null) creates an ownerless spot, matching
  // the anon insert policy's `owner_id is null` check.
  const { data: spot, error } = await supabase
    .from("spots")
    .insert({
      name: rest.name,
      city: rest.city,
      spot_type: rest.spotType,
      description: rest.description,
      features: rest.features,
      difficulty: rest.difficulty,
      is_skateable: rest.isSkateable,
      is_public: rest.isPublic,
      rating: rest.rating,
      photo: rest.photo,
      status: rest.status,
      lat: latLng.lat,
      lng: latLng.lng,
      owner_id: user?.id ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create spot" },
      { status: 500 },
    );
  }

  return withSessionCookies(
    NextResponse.json(reshapeSpot(spot), { status: 201 }),
    cookieResponse,
  );
}
